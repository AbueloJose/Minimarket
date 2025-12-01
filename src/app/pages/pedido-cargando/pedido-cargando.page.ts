import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pedido-cargando',
  templateUrl: './pedido-cargando.page.html',
  styleUrls: ['./pedido-cargando.page.scss'],
  standalone: false // <--- Modo Clásico
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
    // 1. Obtener datos del router
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { total: number; cartItems: any[] };

    if (state) {
      this.total = state.total;
      this.cartItems = state.cartItems;
    } else {
      // Si entras directo sin datos, te manda al home
      this.router.navigate(['/home']);
      return;
    }

    await this.procesarPedido();
  }

  async procesarPedido() {
    // 2. Obtener Usuario
    const user = await this.supabase.getCurrentUser();
    if (!user) {
      await this.mostrarAlerta('Debes iniciar sesión para pedir');
      this.router.navigate(['/login']);
      return;
    }

    // 3. Crear el Pedido (Cabecera)
    const nuevoPedido = {
      usuario_id: user.id,
      total: this.total,
      estado: 'Pendiente', // Estado inicial
      fecha: new Date()
    };

    const pedidoCreado = await this.supabase.crearPedido(nuevoPedido);

    if (!pedidoCreado) {
      await this.mostrarAlerta('Error al crear el pedido');
      this.router.navigate(['/cart']);
      return;
    }

    // 4. Guardar los detalles (Cada plato)
    for (const item of this.cartItems) {
      const detalle = {
        pedido_id: pedidoCreado.id,
        producto_id: item.id || item.producto_id, // Depende de cómo venga el objeto
        cantidad: item.cantidad,
        precio_unit: item.precio
      };
      
      await this.supabase.guardarDetallePedido(detalle);
    }

    // 5. Borrar carrito y limpiar variables
    await this.supabase.vaciarCarrito(); // O borrar solo los items del usuario
    this.cartItems = [];
    this.total = 0;

    // 6. Guardar ID para la siguiente página
    localStorage.setItem('pedidoActualId', pedidoCreado.id);

    // 7. Iniciar Simulación en segundo plano
    this.simularEstados(pedidoCreado.id);

    // 8. Redirigir a la pantalla de estado
    setTimeout(() => {
      this.router.navigate(['/pedido-estado']);
    }, 2000); // 2 segundos de "Cargando..."
  }

  // --- LÓGICA DE SIMULACIÓN ---
  simularEstados(pedidoId: string) {
    const estados = [
      'Confirmado',
      'En preparación',
      'Listo para enviar',
      'En camino',
      'Espera de entregar'
    ];

    let index = 0;
    
    // Cambia de estado cada 5 segundos
    const interval = setInterval(async () => {
      const estadoActual = estados[index];
      console.log(`Simulando estado: ${estadoActual}`);

      await this.supabase.actualizarEstadoPedido(pedidoId, estadoActual);

      index++;
      if (index >= estados.length) {
        clearInterval(interval); // Detener al final
      }
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