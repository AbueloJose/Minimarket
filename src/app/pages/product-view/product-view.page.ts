import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Agregamos Router
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular'; // Agregamos Toast
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.page.html',
  styleUrls: ['./product-view.page.scss'],
  standalone: false
})
export class ProductViewPage implements OnInit {
  
  id: string = '';
  producto: any = null;
  isInFavMap: { [key: string]: boolean } = {}; 
  isInCartMap: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inyectamos Router
    private location: Location,
    private supabase: SupabaseService,
    private toastController: ToastController // Inyectamos Toast
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      await this.loadProducto();
    }
  }

  async loadProducto() {
    this.producto = await this.supabase.getProductoById(this.id);
  }

  goBack() {
    this.location.back();
  }

  // LOGICA REAL PARA CARRITO
  async toggleCarrito(productoId: string) {
    const user = await this.supabase.getCurrentUser();
    
    if (!user) {
      this.mostrarToast('Inicia sesión para comprar', 'warning');
      return;
    }

    // Por simplicidad, en este ejemplo solo "agregamos". 
    // Si quisieras quitar, tendrías que verificar si ya existe.
    const exito = await this.supabase.agregarAlCarrito(user.id, productoId);

    if (exito) {
      this.isInCartMap[productoId] = true;
      this.mostrarToast('¡Agregado al carrito!', 'success');
    }
  }

  // BOTÓN "PEDIR" GRANDE
  async cartPay() {
    // 1. Lo agregamos al carrito primero
    await this.toggleCarrito(this.id);
    
    // 2. Nos vamos al carrito para ver el resumen
    this.router.navigate(['/cart']);
  }

  // (Opcional) Lógica Favoritos
  toggleFavorites(id: string) {
    this.isInFavMap[id] = !this.isInFavMap[id];
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500,
      color: color
    });
    await toast.present();
  }
}