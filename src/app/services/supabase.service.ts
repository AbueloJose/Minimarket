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
  // 1. AUTENTICACIÓN (LOGIN / REGISTER)
  // ==========================================

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUp(email: string, password: string, data: any) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: data // Aquí guardamos nombre, apellido, etc.
      }
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

  async updateUserProfile(uid: string, datos: any) {
    return await this.supabase
      .from('usuarios')
      .update(datos)
      .eq('id', uid);
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
      console.error('Error buscando producto:', error);
      return null;
    }
    return data;
  }

  // ==========================================
  // 4. CARRITO DE COMPRAS (CORREGIDO)
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

  // --- VERSIÓN SEGURA PARA AGREGAR ---
  async agregarAlCarrito(usuario_id: string, producto_id: string) {
    console.log('🛒 Intentando agregar:', { usuario_id, producto_id });

    // 1. Buscamos si ya existe (sin .single() para evitar errores si está vacío)
    const { data: existentes, error: buscarError } = await this.supabase
      .from('carrito')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('producto_id', producto_id);

    if (buscarError) {
      console.error('❌ Error buscando en carrito:', buscarError.message);
      return false;
    }

    if (existentes && existentes.length > 0) {
      // 2. Si existe, actualizamos cantidad
      const item = existentes[0];
      const { error: updateError } = await this.supabase
        .from('carrito')
        .update({ cantidad: item.cantidad + 1 })
        .eq('id', item.id);

      if (updateError) {
        console.error('❌ Error actualizando cantidad:', updateError.message);
        return false;
      }
      return true;

    } else {
      // 3. Si no existe, creamos nuevo
      const { error: insertError } = await this.supabase
        .from('carrito')
        .insert({ usuario_id, producto_id, cantidad: 1 });

      if (insertError) {
        console.error('❌ Error insertando producto:', insertError.message);
        return false;
      }
      return true;
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

  async vaciarCarrito() {
    const { error } = await this.supabase
      .from('carrito')
      .delete()
      .neq('id', 0); 
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

    if (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
    return (data || []).map((item: any) => item.producto);
  }

  // ==========================================
  // 6. PAGOS Y TARJETAS
  // ==========================================

  async getTarjetasUsuario(uid: string) {
    const { data, error } = await this.supabase
      .from('tarjetas')
      .select('*')
      .eq('usuario_id', uid);
    
    if (error) {
      console.error('Error cargando tarjetas:', error);
      return [];
    }
    return data || [];
  }

  async deleteTarjeta(id: string) {
    const { error } = await this.supabase
      .from('tarjetas')
      .delete()
      .eq('id', id);
    return !error;
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

    if (error) {
      console.error('Error creando pedido:', error);
      return null;
    }
    return data;
  }

  async guardarDetallePedido(detalle: any) {
    const { error } = await this.supabase
      .from('detalle_pedidos')
      .insert(detalle);
    return !error;
  }
  
  async actualizarEstadoPedido(id: string, estado: string) {
    const { error } = await this.supabase
      .from('pedidos')
      .update({ estado: estado })
      .eq('id', id);
    return !error;
  }

  async getPedidoById(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error cargando pedido:', error);
      return null;
    }
    return data;
  }
}