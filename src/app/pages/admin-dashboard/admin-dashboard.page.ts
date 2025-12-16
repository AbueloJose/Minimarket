import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit {

  productos: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    this.productos = await this.supabase.getProducts();
  }

  async handleRefresh(event: any) {
    await this.cargarProductos();
    event.target.complete();
  }

  // --- CORREGIDO: USAMOS 'disponible' EN LUGAR DE 'stock' ---
  async cambiarStock(producto: any, event: any) {
    // Obtenemos el nuevo valor (true/false)
    const nuevoEstado = event.detail.checked;
    console.log(`Cambiando disponibilidad de ${producto.nombre} a:`, nuevoEstado);

    try {
      // Usamos la columna real de tu base de datos: 'disponible'
      const { error } = await this.supabase.updateProduct(producto.id, { 
        disponible: nuevoEstado 
      });

      if (error) {
        console.error('Error al actualizar:', error);
        event.target.checked = !nuevoEstado; // Revertir visualmente
        await this.mostrarAlerta('Error', 'No se pudo actualizar la disponibilidad.');
      } else {
        producto.disponible = nuevoEstado; // Actualizar dato local
      }

    } catch (e) {
      console.error('Crash:', e);
      event.target.checked = !nuevoEstado;
    }
  }

  async borrarProducto(producto: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas eliminar ${producto.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.supabase.deleteProduct(producto.id);
            this.cargarProductos();
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.supabase.logout();
    this.navCtrl.navigateRoot('/login');
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}