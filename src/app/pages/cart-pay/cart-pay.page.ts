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
    // Obtenemos los datos tal cual vienen de Supabase (con la estructura anidada)
    const datos = await this.supabase.getCarrito();
    
    if (datos) {
      this.cartItems = datos;
    } else {
      this.cartItems = [];
    }

    this.calcularTotalCart();
  }

  calcularTotalCart() {
    this.total = this.cartItems.reduce((acc, item) => {
      // Validamos que exista 'producto' para evitar errores si se borró de la BD
      const precio = item.producto?.precio || 0; 
      return acc + (precio * item.cantidad);
    }, 0);
  }

  async cambiarCantidad(item: any, cambio: number) {
    const nuevaCantidad = item.cantidad + cambio;

    // CASO 1: La cantidad llega a 0 -> Preguntar si borrar
    if (nuevaCantidad <= 0) {
      const alert = await this.alertController.create({
        header: 'Eliminar producto',
        message: '¿Deseas quitar este producto de tu orden?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar',
            handler: async () => {
              // item.id es el ID de la fila del carrito
              if(item.id) {
                await this.supabase.deleteItemCarrito(item.id);
                
                // Filtramos la lista localmente para que se actualice rápido
                this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
                this.calcularTotalCart();
              }
            },
          },
        ],
      });
      await alert.present();
      
    } 
    // CASO 2: Aumentar o disminuir cantidad (Máximo 10)
    else if (nuevaCantidad <= 10) {
      if(item.id) {
        // Actualizamos en Supabase
        await this.supabase.updateCantidadCarrito(item.id, nuevaCantidad);
        
        // Actualizamos localmente
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
    // Validar que haya items antes de ir a pagar
    if (this.cartItems.length === 0) return;

    this.router.navigate(['/pay-method'], {
      state: {
        total: this.total,
        cartItems: this.cartItems,
      },
    });
  }
}