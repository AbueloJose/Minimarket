import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false // <--- Modo Clásico (NgModules)
})
export class CartPage implements OnInit {
  
  usuario = true; // Variable temporal para que se muestre el HTML
  productos: any[] = [];
  
  constructor(
    private supabase: SupabaseService, 
    private router: Router
  ) {}

  async ngOnInit() {
    console.log('Cargando carrito...');
    this.productos = await this.supabase.getCarrito();
    console.log('Productos en carrito:', this.productos);
  }
}