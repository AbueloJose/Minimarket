import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: false // <--- Modo Clásico
})
export class FavoritePage implements OnInit {
  
  categorySelected: string = 'all';
  usuario = true; // Temporal para ver el HTML
  productos: any[] = [];          // Todos los favoritos
  productosFiltrados: any[] = []; // Los que se muestran

  constructor(
    private supabase: SupabaseService, 
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarFavoritos();
  }

  async cargarFavoritos() {
    console.log('Cargando favoritos...');
    this.productos = await this.supabase.getFavoritos();
    
    // Al inicio mostramos todo
    this.productosFiltrados = this.productos;
  }

  // Filtro simple por texto (igual que en Home)
  filtrarProductos() {
    if (this.categorySelected === 'menu') {
      this.productosFiltrados = this.productos.filter(p => p.categoria === 'Alimentos' || p.categoria === 'Comida');
    } else if (this.categorySelected === 'bebidas') {
      this.productosFiltrados = this.productos.filter(p => p.categoria === 'Bebidas');
    } else {
      this.productosFiltrados = this.productos;
    }
  }

  // Esta función la llama el HTML cuando tocas los botones (si los tuvieras)
  seleccionarCategoria(cat: string) {
    this.categorySelected = cat;
    this.filtrarProductos();
  }
}