import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  usuario: any = { nombre: 'Invitado' }; 
  categorySelected: string = 'menu'; // 'menu' o 'bebidas'
  
  productos: any[] = [];
  productosFiltrados: any[] = [];

  // Mapas para saber si un producto está en carrito o favoritos (para pintar íconos si quisieras)
  isInCartMap: { [id: string]: boolean } = {};
  isInFavMap: { [id: string]: boolean } = {};

  readonly MENU_ID = '9c094064-ee42-489f-b90b-7c422358dabe'; // IDs opcionales si usas filtro por ID
  readonly BEBIDAS_ID = '2cff7f95-ca3c-44a7-918e-31972aa08d6e';

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {}

  // Se ejecuta CADA VEZ que entras a la pantalla
  async ionViewWillEnter() {
    await this.cargarUsuario();
    await this.cargarProductos();
    await this.refreshStates();
  }

  async cargarUsuario() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      const perfil = await this.supabase.getUserProfile(user.id);
      this.usuario = perfil || user;
    }
  }

  async cargarProductos() {
    // Traemos productos disponibles
    const { data, error } = await this.supabase.supabase
      .from('productos')
      .select('*')
      .eq('disponible', true);

    if (data) {
      this.productos = data;
      this.filtrarProductos();
    }
  }

  filtrarProductos() {
    if (this.categorySelected === 'menu') {
      // Filtramos por texto o por ID según tu base de datos
      this.productosFiltrados = this.productos.filter(p => 
        p.categoria === 'Alimentos' || 
        p.categoria === 'Comida' || 
        p.categoria_id === this.MENU_ID
      );
    } else if (this.categorySelected === 'bebidas') {
      this.productosFiltrados = this.productos.filter(p => 
        p.categoria === 'Bebidas' ||
        p.categoria_id === this.BEBIDAS_ID
      );
    } else {
      this.productosFiltrados = this.productos;
    }

    // Si no hay nada, mostramos todo por seguridad
    if (this.productosFiltrados.length === 0 && this.productos.length > 0) {
      this.productosFiltrados = this.productos;
    }
  }

  seleccionarCategoria(categoria: string) {
    this.categorySelected = categoria;
    this.filtrarProductos();
  }

  // Verifica qué productos están en carrito/favoritos para pintar íconos
  async refreshStates() {
    // 1. Carrito
    const carrito = await this.supabase.getCarrito();
    this.isInCartMap = {};
    carrito.forEach((item: any) => this.isInCartMap[item.id] = true);

    // 2. Favoritos
    const favs = await this.supabase.getFavoritos();
    this.isInFavMap = {};
    favs.forEach((item: any) => this.isInFavMap[item.id] = true);
  }
}