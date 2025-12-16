import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-admin-add-product',
  templateUrl: './admin-add-product.page.html',
  styleUrls: ['./admin-add-product.page.scss'],
  standalone: false
})
export class AdminAddProductPage implements OnInit {

  producto = {
    nombre: '',
    precio: null,
    categoria: '',
    descripcion: '',
    imagen_url: '',
    disponible: true
  };

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() { }

  async cargarImagen(event: any) {
    const file = event.target.files[0];
    
    if (!file) return;

    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'circles'
    });
    await loading.present();

    const url = await this.supabase.subirImagen(file);

    loading.dismiss();

    if (url) {
      this.producto.imagen_url = url;
      this.mostrarToast('Imagen subida correctamente', 'success');
    } else {
      this.mostrarToast('Error al subir la imagen', 'danger');
    }
  }

  async guardarProducto() {
    if (!this.producto.nombre || !this.producto.precio || !this.producto.categoria) {
      this.mostrarToast('Por favor completa nombre, precio y categoría', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando producto...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { error } = await this.supabase.createProduct(this.producto);
      if (error) throw error;

      await this.mostrarToast('Producto agregado con éxito', 'success');
      this.router.navigate(['/admin-dashboard']);
    } catch (error: any) {
      console.error('Error:', error);
      this.mostrarToast('Error al guardar: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}