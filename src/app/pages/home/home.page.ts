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
  
  categorySelected: string = 'stock'; 
  
  productos: any[] = [];
  productosFiltrados: any[] = [];

  isInCartMap: { [id: string]: boolean } = {};
  isInFavMap: { [id: string]: boolean } = {};

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {}

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
    const { data, error } = await this.supabase.supabase
      .from('productos')
      .select('*');

    if (data) {
      this.productos = data;
      this.filtrarProductos(); 
    }
  }

  filtrarProductos() {
    if (this.categorySelected === 'stock') {
      this.productosFiltrados = this.productos.filter(p => p.disponible === true);

    } else if (this.categorySelected === 'agotado') {
      this.productosFiltrados = this.productos.filter(p => p.disponible === false);
    } 
  }

  seleccionarCategoria(categoria: string) {
    this.categorySelected = categoria;
    this.filtrarProductos();
  }

  async refreshStates() {
    const carrito = await this.supabase.getCarrito();
    this.isInCartMap = {};
    if(carrito) carrito.forEach((item: any) => this.isInCartMap[item.id] = true);

    const favs = await this.supabase.getFavoritos();
    this.isInFavMap = {};
    if(favs) favs.forEach((item: any) => this.isInFavMap[item.id] = true);
  }
}