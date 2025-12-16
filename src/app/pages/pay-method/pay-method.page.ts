import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pay-method',
  templateUrl: './pay-method.page.html',
  styleUrls: ['./pay-method.page.scss'],
  standalone: false 
})
export class PayMethodPage implements OnInit {
  metodoSeleccionado: string | null = null;
  total: number = 0;
  usuario: any = null;
  cartItems: any[] = [];
  tarjetas: any[] = [];
  showModal: boolean = false;

  constructor(
    private supabase: SupabaseService,
    private alertController: AlertController,
    private router: Router,
    private location: Location
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { total: number; cartItems: any[] };

    if (state) {
      this.total = state.total;
      this.cartItems = state.cartItems || [];
    } else {
      // this.location.back();
      console.log('Modo prueba sin datos previos');
      this.total = 150.00; 
    }

    await this.cargarUsuario();
    await this.cargarTarjetas();
  }

  goBack() {
    this.location.back();
  }

  async cargarUsuario() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      this.usuario = await this.supabase.getUserProfile(user.id);
    } else {
      this.usuario = { direccion: 'Av. Siempre Viva 123 (Simulada)' };
    }
  }

  async cargarTarjetas() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      this.tarjetas = await this.supabase.getTarjetasUsuario(user.id);
    } else {
      this.tarjetas = [
        { id: 'simulada_1', numero_mascara: '**** **** **** 4242' }
      ];
    }
  }

  abrirModalAgregarTarjeta() {
    this.showModal = true;
  }

  cancelarAgregarTarjeta() {
    this.showModal = false;
  }

  guardarTarjeta() {
    alert('Función de Stripe pendiente de configurar. (Tarjeta guardada visualmente)');
    this.showModal = false;
  }

  async confirmarEliminarTarjeta(id: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar',
      message: '¿Borrar esta tarjeta?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { 
          text: 'Sí', 
          handler: async () => {
            this.tarjetas = this.tarjetas.filter(t => t.id !== id);
          } 
        }
      ]
    });
    await alert.present();
  }

  async realizarPedido() {
    if (!this.metodoSeleccionado) {
      const alert = await this.alertController.create({
        header: 'Atención',
        message: 'Selecciona un método de pago.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/pedido-cargando'], {
      state: { total: this.total, cartItems: this.cartItems }
    });
  }
}