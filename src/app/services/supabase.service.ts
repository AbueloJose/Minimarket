import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // ==========================================
  // 1. AUTENTICACIÓN
  // ==========================================

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, data: any) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: { data: data }
    });
  }

  async sendPasswordReset(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8100/reset-password',
    });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  // ==========================================
  // 2. PERFIL DE USUARIO
  // ==========================================

  async getUserProfile(uid: string) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', uid)
      .single();
    if (error) return null;
    return data;
  }

  // ==========================================
  // 3. PRODUCTOS Y GENERAL
  // ==========================================

  async getDatos(tabla: string) {
    const { data, error } = await this.supabase
      .from(tabla)
      .select('*');
    if (error) {
      console.error(`Error cargando ${tabla}:`, error);
      return [];
    }
    return data || [];
  }

  async getProductoById(id: string) {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error buscando producto en Supabase:', error);
      return null;
    }
    return data || null;
  }

  // ==========================================
  // 4. CARRITO DE COMPRAS
  // ==========================================
  
  async getCarrito() {
    const { data, error } = await this.supabase
      .from('carrito')
      .select(`
        id,
        cantidad,
        producto:productos ( * ) 
      `); 

    if (error) {
      console.error('Error cargando carrito:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
      ...item.producto, 
      cantidad: item.cantidad,
      carrito_id: item.id
    }));
  }

  async agregarAlCarrito(usuario_id: string, producto_id: string) {
    const { data: existentes } = await this.supabase
      .from('carrito')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('producto_id', producto_id);

    if (existentes && existentes.length > 0) {
      const item = existentes[0];
      const { error } = await this.supabase
        .from('carrito')
        .update({ cantidad: item.cantidad + 1 })
        .eq('id', item.id);
      return !error;
    } else {
      const { error } = await this.supabase
        .from('carrito')
        .insert({ usuario_id, producto_id, cantidad: 1 });
      return !error;
    }
  }

  async toggleCart(usuario_id: string, producto_id: string) {
    const { data } = await this.supabase
      .from('carrito')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('producto_id', producto_id)
      .maybeSingle();

    if (data) {
      await this.supabase.from('carrito').delete().eq('id', data.id);
      return 'removed'; 
    } else {
      await this.supabase.from('carrito').insert({ usuario_id, producto_id, cantidad: 1 });
      return 'added'; 
    }
  }

  async updateCantidadCarrito(id: string, cantidad: number) {
    const { error } = await this.supabase
      .from('carrito')
      .update({ cantidad: cantidad })
      .eq('id', id);
    return !error;
  }

  async deleteItemCarrito(id: string) {
    const { error } = await this.supabase
      .from('carrito')
      .delete()
      .eq('id', id);
    return !error;
  }

  async vaciarCarrito(usuario_id: string) {
    const { error } = await this.supabase
      .from('carrito')
      .delete()
      .eq('usuario_id', usuario_id); 
    return !error;
  }

  // ==========================================
  // 5. FAVORITOS
  // ==========================================

  async getFavoritos() {
    const { data, error } = await this.supabase
      .from('favoritos')
      .select(`
        id,
        producto:productos ( * )
      `);
    if (error) return [];
    return (data || []).map((item: any) => item.producto);
  }

  async toggleFavorite(usuario_id: string, producto_id: string) {
    const { data } = await this.supabase
      .from('favoritos')
      .select('*')
      .match({ usuario_id, producto_id })
      .maybeSingle();

    if (data) {
      await this.supabase.from('favoritos').delete().eq('id', data.id);
      return 'removed'; 
    } else {
      await this.supabase.from('favoritos').insert({ usuario_id, producto_id });
      return 'added'; 
    }
  }

  // ==========================================
  // 6. PAGOS Y TARJETAS
  // ==========================================

  async getTarjetasUsuario(uid: string) {
    const { data, error } = await this.supabase
      .from('tarjetas')
      .select('*')
      .eq('usuario_id', uid);
    if (error) return [];
    return data || [];
  }

  // ==========================================
  // 7. PEDIDOS
  // ==========================================

  async crearPedido(datosPedido: any) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .insert(datosPedido)
      .select('id')
      .single();
    if (error) { console.error('Error pedido:', error); return null; }
    return data;
  }

  async guardarDetallePedido(detalle: any) {
    const { error } = await this.supabase.from('detalle_pedidos').insert(detalle);
    return !error;
  }
  
  async actualizarEstadoPedido(id: string, estado: string) {
    const { error } = await this.supabase.from('pedidos').update({ estado: estado }).eq('id', id);
    return !error;
  }

  async getPedidoById(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }
}