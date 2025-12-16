import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false 
})
export class CartPage implements OnInit {
  
  usuario = true;
  productos: any[] = [];
  
  constructor(
    private supabase: SupabaseService, 
    private router: Router
  ) {}

  async ngOnInit() {
    console.log('Cargando carrito...');
    await this.cargarCarrito(); 
    console.log('Productos en carrito:', this.productos);
  }

  async cargarCarrito() {
    const datosRaw = await this.supabase.getCarrito();
    
    if (datosRaw && datosRaw.length > 0) {
      this.productos = datosRaw.map((item: any) => {
        const producto = item.productos || {}; 
        
        return {
          carrito_id: item.id,       
          cantidad: item.cantidad,   
          id_producto: producto.id,
          nombre: producto.nombre || 'Producto no disponible',
          precio: producto.precio || 0,
          imagen_url: producto.imagen_url || null,
          descripcion: producto.descripcion,
          ...item
        };
      });
    } else {
        this.productos = [];
    }
  }
}