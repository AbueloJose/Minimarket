import { Component } from '@angular/core'; 
import { MenuController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-admin-pedidos',
  templateUrl: './admin-pedidos.page.html',
  styleUrls: ['./admin-pedidos.page.scss'],
  standalone: false
})
export class AdminPedidosPage { 

  pedidos: any[] = [];

  constructor(
    private supabase: SupabaseService, 
    private menuCtrl: MenuController
  ) { }

  async ionViewWillEnter() {
    this.menuCtrl.enable(true);
    await this.cargarPedidos();
  }

  async cargarPedidos() {
    console.log('Cargando pedidos...');
    this.pedidos = await this.supabase.getAdminAllPedidos();
    console.log('Pedidos encontrados:', this.pedidos);
  }

  async cambiarEstado(pedido: any, nuevoEstado: string) {
    await this.supabase.actualizarEstadoPedido(pedido.id, nuevoEstado);
  }
}