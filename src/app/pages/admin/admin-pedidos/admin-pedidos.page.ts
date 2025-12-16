// src/app/pages/admin/admin-pedidos/admin-pedidos.page.ts

import { Component } from '@angular/core'; // Quité OnInit porque usaremos ionViewWillEnter
import { MenuController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-admin-pedidos',
  templateUrl: './admin-pedidos.page.html',
  styleUrls: ['./admin-pedidos.page.scss'],
  standalone: false
})
export class AdminPedidosPage { // Ya no hace falta implements OnInit obligatoriamente

  pedidos: any[] = [];

  constructor(
    private supabase: SupabaseService, 
    private menuCtrl: MenuController
  ) { }

  // Se ejecuta SIEMPRE que entras a la pantalla (incluso si vienes de "Atrás")
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