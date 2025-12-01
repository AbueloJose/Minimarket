import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pedido-estado',
  templateUrl: './pedido-estado.page.html',
  styleUrls: ['./pedido-estado.page.scss'],
  standalone: false
})
export class PedidoEstadoPage implements OnInit, OnDestroy {
  pedido: any = null;
  intervalId: any = null;

  estados = [
    'Pendiente',
    'Confirmado',
    'En preparación',
    'Listo para enviar',
    'En camino',
    'Espera de entregar',
    'Entregado',
  ];

  constructor(
    private router: Router, 
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const pedidoId = localStorage.getItem('pedidoActualId');
    
    if (!pedidoId) {
      this.router.navigate(['/home']);
      return;
    }

    await this.cargarPedido(pedidoId);

    this.intervalId = setInterval(() => {
      this.cargarPedido(pedidoId);
    }, 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Pendiente': 'time-outline',
      'Confirmado': 'thumbs-up-outline',
      'En preparación': 'bonfire-outline',
      'Listo para enviar': 'gift-outline',
      'En camino': 'bicycle-outline',
      'Espera de entregar': 'home-outline',
      'Entregado': 'checkmark-done-outline'
    };
    return icons[status] || 'help-outline';
  }

  async cargarPedido(pedidoId: string) {
    const data = await this.supabase.getPedidoById(pedidoId);
    if (data) {
      this.pedido = data;
      if (this.pedido.estado === 'Entregado') {
        clearInterval(this.intervalId);
      }
    }
  }

  regresarHome() {
    this.router.navigate(['/home']);
  }
}