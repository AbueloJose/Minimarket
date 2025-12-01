import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sidebar-pedido',
  templateUrl: './sidebar-pedido.component.html',
  styleUrls: ['./sidebar-pedido.component.scss'],
  standalone: false // <--- Importante
})
export class SidebarPedidoComponent implements OnInit {
  pedidos: any[] = [];
  isOpen = false;

  constructor(
    private modalCtrl: ModalController,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    // Animación de entrada
    setTimeout(() => { this.isOpen = true; }, 100);
    await this.cargarPedidos();
  }

  cerrar() {
    this.isOpen = false;
    // Esperamos la animación antes de cerrar el modal real
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 300);
  }

  async cargarPedidos() {
    // TEMPORAL: Traemos todos los pedidos porque aún no tenemos Login de usuario
    console.log('Cargando historial...');
    this.pedidos = await this.supabase.getDatos('pedidos');
  }

  async marcarEntregado(pedidoId: string) {
    console.log('Marcar entregado:', pedidoId);
    // Aquí implementaremos la actualización luego
    alert('Función de actualizar estado pendiente de configurar');
  }
}