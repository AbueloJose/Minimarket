import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false
})
export class ProductCardComponent implements OnInit {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() price: number = 0;
  @Input() imageUrl: string = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  goToDetail() {
    console.log('Navegando al detalle del producto:', this.id);
    this.router.navigate(['/product-view', this.id]);
  }

  async add(event: Event) {
    // ESTO ES VITAL: Detiene el clic para que no active el goToDetail del padre
    event.stopPropagation();
    event.preventDefault(); 

    console.log('Botón Agregar presionado');

    const user = await this.supabase.getCurrentUser();
    
    if (!user) {
      this.mostrarToast('Debes iniciar sesión primero', 'warning');
      return;
    }

    const exito = await this.supabase.agregarAlCarrito(user.id, this.id);

    if (exito) {
      this.mostrarToast('Producto agregado al carrito 🛒', 'success');
    } else {
      this.mostrarToast('Error al agregar', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}