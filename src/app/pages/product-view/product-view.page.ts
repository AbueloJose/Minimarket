import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
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
  isFavorite: boolean = false;
  isInCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private supabase: SupabaseService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.id) {
      console.log('ID de Producto capturado:', this.id);
      await this.loadProducto();
      
      if (this.producto) {
        await this.checkFavoriteStatus();
        await this.checkCartStatus();
      }
    } else {
      console.error('ERROR CRÍTICO: No se encontró ID del producto en la URL.');
    }
  }

  async loadProducto() {
    this.producto = await this.supabase.getProductoById(this.id);
    if (!this.producto) {
      console.error('ERROR: loadProducto no devolvió datos. Verificar si el ID existe en la tabla "productos".');
    }
  }

  goBack() {
    this.location.back();
  }

  async checkFavoriteStatus() {
    const user = await this.supabase.getCurrentUser();
    if (!user) return;
    
    const { data } = await this.supabase.supabase.from('favoritos').select('*')
      .eq('usuario_id', user.id).eq('producto_id', this.id).maybeSingle();
    this.isFavorite = !!data;
  }

  async checkCartStatus() {
    const user = await this.supabase.getCurrentUser();
    if (!user) return;

    const { data } = await this.supabase.supabase.from('carrito').select('*')
      .eq('usuario_id', user.id).eq('producto_id', this.id).maybeSingle();
    this.isInCart = !!data;
  }

  async toggleFavorite() {
    const user = await this.supabase.getCurrentUser();
    if (!user) { this.mostrarToast('Inicia sesión para favoritos', 'warning'); return; }

    const accion = await this.supabase.toggleFavorite(user.id, this.id);
    if (accion === 'added') {
      this.isFavorite = true;
      this.mostrarToast('Añadido a favoritos ❤️', 'success');
    } else {
      this.isFavorite = false;
      this.mostrarToast('Eliminado de favoritos 💔', 'medium');
    }
  }

  async toggleCarrito() {
    const user = await this.supabase.getCurrentUser();
    
    if (!user) {
      this.mostrarToast('Inicia sesión para comprar', 'warning');
      return;
    }

    const accion = await this.supabase.toggleCart(user.id, this.id);

    if (accion === 'added') {
      this.isInCart = true;
      this.mostrarToast('Agregado al carrito 🛒', 'success');
    } else if (accion === 'exists') {
      this.isInCart = true; 
      this.mostrarToast('Ya tienes este producto en el carrito 🛒', 'warning');
    } else {
      this.mostrarToast('Error al actualizar carrito', 'danger');
    }
  }

  async cartPay() {
    if (!this.isInCart) {
      await this.toggleCarrito();
    }
    this.router.navigate(['/cart-pay']);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 1500, color: color, position: 'bottom'
    });
    await toast.present();
  }
}