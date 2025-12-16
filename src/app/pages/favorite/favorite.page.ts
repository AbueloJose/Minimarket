import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: false
})
export class FavoritePage implements OnInit {
  
  usuario: any = null;
  productosFiltrados: any[] = []; 
  loading: boolean = true;

  constructor(
    private supabase: SupabaseService, 
    private router: Router
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    const user = await this.supabase.getCurrentUser();
    
    if (user) {
      this.usuario = user;
      
      const datosRaw = await this.supabase.getFavoritos();
      
      if (datosRaw && datosRaw.length > 0) {
        this.productosFiltrados = datosRaw.map((item: any) => {
            const producto = item.productos || {};
            
            return {
                favorito_id: item.id, 
                id_producto: producto.id, 
                nombre: producto.nombre || 'Producto no disponible',
                precio: producto.precio || 0,
                imagen_url: producto.imagen_url || null,
                ...item
            };
        });
      } else {
          this.productosFiltrados = [];
      }
    } else {
      this.usuario = null;
      this.productosFiltrados = [];
    }
    this.loading = false;
  }
}