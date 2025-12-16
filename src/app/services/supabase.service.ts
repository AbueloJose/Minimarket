import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  // TUS CREDENCIALES
  private supabaseUrl = 'https://bkhvnanudfehwsjlvapo.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraHZuYW51ZGZlaHdzamx2YXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODc1MjAsImV4cCI6MjA3OTg2MzUyMH0.nf0KuKrsJXioD-KnpK7bZ50jE8FT8n0nkmWR-FQXffM';
  
  public supabase: SupabaseClient;
  
  // BehaviorSubject mantiene el último valor emitido. 
  // Iniciamos en null (nadie logueado).
  private _currentUser = new BehaviorSubject<any>(null);
  private _avatarUrl = new BehaviorSubject<string>('');

  constructor() {
    console.log('>>> Inicializando Supabase Service (Modo Persistente)...');
    
    // CONFIGURACIÓN ROBUSTA
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        persistSession: false,       // Queremos mantener la sesión
        autoRefreshToken: false,     // Renovar token automáticamente
        detectSessionInUrl: false   // FALSE para Ionic/Capacitor para evitar conflictos de rutas
      }
    });

    // 1. Intentar recuperar sesión guardada
    this.loadUser();
    
    // 2. Escuchar cambios de estado (Login, Logout, etc.)
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Estado Auth:', event);
      if (session?.user) {
        this._currentUser.next(session.user);
      } else {
        this._currentUser.next(null);
      }
    });
  }

  /**
   * Carga el usuario de la memoria local de forma segura
   */
  async loadUser() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error recuperando sesión (posible dato corrupto):', error);
        // Si hay error, limpiamos para evitar bloqueos
        this._currentUser.next(null);
        return;
      }

      if (data.session?.user) {
        console.log('✅ Usuario recuperado:', data.session.user.email);
        this._currentUser.next(data.session.user);
      } else {
        console.log('ℹ️ No hay sesión activa.');
        this._currentUser.next(null);
      }
    } catch (e) {
      console.error('Excepción crítica en loadUser:', e);
      this._currentUser.next(null);
    }
  }

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, dataUser: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: dataUser }
    });
    return { data, error };
  }

  async logout() {
    await this.supabase.auth.signOut();
    this._currentUser.next(null);
    // Limpieza extra por seguridad
    localStorage.removeItem(`sb-${this.supabaseUrl}-auth-token`);
  }

  async getCurrentUser() {
    // Primero devolvemos lo que ya tenemos en memoria (es instantáneo)
    if (this._currentUser.value) {
      return this._currentUser.value;
    }
    // Si no, preguntamos a la base
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  /**
   * Busca en la tabla 'usuarios' usando la columna 'id'
   */
  async getUserRole(userId: string) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo rol:', error);
      return null;
    }
    return data?.rol;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId) 
      .maybeSingle();
    return data?.rol === 'admin';
  }
  
  // Observables
  get currentUser$() { return this._currentUser.asObservable(); }
  get currentAvatar$() { return this._avatarUrl.asObservable(); }

  // ==========================================
  // PRODUCTOS E IMÁGENES
  // ==========================================

  async getProducts() {
    const { data } = await this.supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async getProductoById(id: string) {
    const { data } = await this.supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  async createProduct(productData: any) {
    return this.supabase.from('productos').insert(productData);
  }

  async updateProduct(id: string, campos: any) {
    return this.supabase.from('productos').update(campos).eq('id', id);
  }

  async deleteProduct(id: string) {
    return this.supabase.from('productos').delete().eq('id', id);
  }

  async subirImagen(file: File): Promise<string | null> {
    try {
      const fileName = `img_${Date.now()}_${file.name}`;
      const { error } = await this.supabase.storage
        .from('productos')
        .upload(fileName, file);

      if (error) {
        console.error('Error subiendo imagen:', error);
        return null;
      }

      const { data: publicUrlData } = this.supabase.storage
        .from('productos')
        .getPublicUrl(fileName);
        
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Excepción en subirImagen:', e);
      return null;
    }
  }

  // ==========================================
  // CARRITO
  // ==========================================

  async getCarrito() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data } = await this.supabase
      .from('carrito')
      .select('*, producto:productos(*)')
      .eq('usuario_id', user.id);

    return data || [];
  }

  async toggleCart(uid: string, pid: string) {
    const { data: existing } = await this.supabase
      .from('carrito')
      .select('*')
      .eq('usuario_id', uid)
      .eq('producto_id', pid)
      .maybeSingle();

    if (existing) {
      return 'exists'; 
    } else {
      await this.supabase.from('carrito').insert({ usuario_id: uid, producto_id: pid, cantidad: 1 });
      return 'added';
    }
  }

  async deleteItemCarrito(carritoId: string) {
    return this.supabase.from('carrito').delete().eq('id', carritoId);
  }

  async updateCantidadCarrito(carritoId: string, cantidad: number) {
    return this.supabase.from('carrito').update({ cantidad }).eq('id', carritoId);
  }

  async vaciarCarrito(uid: string) {
    return this.supabase.from('carrito').delete().eq('usuario_id', uid);
  }

  // ==========================================
  // FAVORITOS
  // ==========================================

  async getFavoritos() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data } = await this.supabase
      .from('favoritos')
      .select('*, producto:productos(*)')
      .eq('usuario_id', user.id);
    return data || [];
  }

  async toggleFavorite(uid: string, pid: string) {
    const { data: existing } = await this.supabase
      .from('favoritos')
      .select('*')
      .eq('usuario_id', uid)
      .eq('producto_id', pid)
      .maybeSingle();

    if (existing) {
      await this.supabase.from('favoritos').delete().eq('id', existing.id);
      return 'removed';
    } else {
      await this.supabase.from('favoritos').insert({ usuario_id: uid, producto_id: pid });
      return 'added';
    }
  }

  // ==========================================
  // PERFIL
  // ==========================================

  async getUserProfile(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data || {};
  }

  async updateUserProfile(userId: string, data: any) {
    return this.supabase.from('usuarios').update(data).eq('id', userId);
  }

  updateLocalAvatar(url: string) {
    this._avatarUrl.next(url);
  }

  async getTarjetasUsuario(uid: string) {
    return []; 
  }

  // ==========================================
  // PEDIDOS
  // ==========================================

  async crearPedido(pedido: any) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async guardarDetallePedido(detalle: any) {
    return this.supabase.from('detalle_pedido').insert(detalle);
  }

  async actualizarEstadoPedido(id: string, estado: string) {
    return this.supabase.from('pedidos').update({ estado }).eq('id', id);
  }

  async getPedidoById(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo pedido:', error);
      return null;
    }
    return data;
  }

  async getUltimoPedido(userId: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  async getDatos(tabla: string) {
    const { data } = await this.supabase.from(tabla).select('*');
    return data || [];
  }
}