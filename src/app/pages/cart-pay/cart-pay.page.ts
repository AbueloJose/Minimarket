import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-cart-pay',
  templateUrl: './cart-pay.page.html',
  styleUrls: ['./cart-pay.page.scss'],
  standalone: false
})
export class CartPayPage implements OnInit {
  cartItems: any[] = [];
  total: number = 0;

  constructor(
    private supabase: SupabaseService,
    private alertController: AlertController,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarCarrito();
  }

  goBack() {
    this.location.back();
  }

  async cargarCarrito() {
    this.cartItems = await this.supabase.getCarrito();
    this.calcularTotalCart();
  }

  calcularTotalCart() {
    this.total = this.cartItems.reduce((acc, item) => {
      const precio = item.precio || 0; 
      return acc + (precio * item.cantidad);
    }, 0);
  }

  async cambiarCantidad(item: any, cambio: number) {
    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
      const alert = await this.alertController.create({
        header: 'Eliminar producto',
        message: '¿Deseas quitar este producto de tu orden?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar',
            handler: async () => {
              const idABorrar = item.carrito_id; 
              if(idABorrar) {
                await this.supabase.deleteItemCarrito(idABorrar);
                this.cartItems = this.cartItems.filter((i) => i.carrito_id !== idABorrar);
                this.calcularTotalCart();
              }
            },
          },
        ],
      });
      await alert.present();
      
    } else if (nuevaCantidad <= 10) {
      const idAActualizar = item.carrito_id;
      if(idAActualizar) {
        await this.supabase.updateCantidadCarrito(idAActualizar, nuevaCantidad);
        item.cantidad = nuevaCantidad;
        this.calcularTotalCart();
      }
    }
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Vaciar Canasta',
      message: '¿Estás seguro de borrar todo?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { 
          text: 'Sí, vaciar', 
          handler: async () => {
            // CORRECCIÓN: Obtenemos ID de usuario
            const user = await this.supabase.getCurrentUser();
            if (user) {
              await this.supabase.vaciarCarrito(user.id);
              this.cartItems = [];
              this.total = 0;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  irAPagar() {
    this.router.navigate(['/pay-method'], {
      state: {
        total: this.total,
        cartItems: this.cartItems,
      },
    });
  }
}