import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pedido-cargando',
  templateUrl: './pedido-cargando.page.html',
  styleUrls: ['./pedido-cargando.page.scss'],
  standalone: false
})
export class PedidoCargandoPage implements OnInit {
  
  total: number = 0;
  cartItems: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { total: number; cartItems: any[] };

    if (state) {
      this.total = state.total;
      this.cartItems = state.cartItems;
    } else {
      this.router.navigate(['/home']);
      return;
    }

    await this.procesarPedido();
  }

  async procesarPedido() {
    const user = await this.supabase.getCurrentUser();
    if (!user) {
      await this.mostrarAlerta('Debes iniciar sesión para pedir');
      this.router.navigate(['/login']);
      return;
    }

    // 1. Crear Pedido
    const nuevoPedido = {
      usuario_id: user.id,
      total: this.total,
      estado: 'Pendiente',
      fecha: new Date()
    };

    const pedidoCreado = await this.supabase.crearPedido(nuevoPedido);

    if (!pedidoCreado) {
      await this.mostrarAlerta('Error al crear el pedido');
      this.router.navigate(['/cart']);
      return;
    }

    // 2. Guardar Detalles
    for (const item of this.cartItems) {
      const detalle = {
        pedido_id: pedidoCreado.id,
        producto_id: item.id || item.producto_id,
        cantidad: item.cantidad,
        precio_unit: item.precio
      };
      await this.supabase.guardarDetallePedido(detalle);
    }

    // 3. VACIAR CARRITO (Ahora pasamos el ID)
    await this.supabase.vaciarCarrito(user.id);
    this.cartItems = [];
    this.total = 0;

    // 4. Guardar ID y Simular
    localStorage.setItem('pedidoActualId', pedidoCreado.id);
    this.simularEstados(pedidoCreado.id);

    setTimeout(() => {
      this.router.navigate(['/pedido-estado']);
    }, 2000);
    // 5. BORRAR CARRITO
    console.log('Llamando a vaciarCarrito...');
    const borrado = await this.supabase.vaciarCarrito(user.id);
    
    if (borrado) {
        console.log('Carrito borrado correctamente en la interfaz');
        this.cartItems = [];
        this.total = 0;
    } else {
        console.error('ALERTA: El carrito no se borró en la BD');
    }
  }

  simularEstados(pedidoId: string) {
    const estados = [
      'Confirmado', 'En preparación', 'Listo para enviar', 
      'En camino', 'Espera de entregar'
    ];
    let index = 0;
    const interval = setInterval(async () => {
      const estadoActual = estados[index];
      await this.supabase.actualizarEstadoPedido(pedidoId, estadoActual);
      index++;
      if (index >= estados.length) clearInterval(interval);
    }, 5000);
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Pedido',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}