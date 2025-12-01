import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false // <--- Modo Clásico
})
export class LoginPage implements OnInit {
  
  credentials = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  get correo() { return this.credentials.controls.correo; }
  get contrasena() { return this.credentials.controls.contrasena; }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async login() {
    if (this.credentials.invalid) {
      return; // Si el formulario está mal, no hace nada
    }

    const loading = await this.loadingController.create({ message: 'Iniciando sesión...' });
    await loading.present();

    const { correo, contrasena } = this.credentials.getRawValue();

    // 1. Intentamos loguear con Supabase
    const { data, error } = await this.supabase.signIn(correo, contrasena);

    await loading.dismiss();

    if (error) {
      await this.showAlert('Fallo en login', 'Credenciales inválidas o error de conexión.');
      console.error(error);
      return;
    }

    if (data.user) {
      // 2. Login exitoso -> Vamos al Home
      // Borramos el historial para que no pueda volver al login con "Atrás"
      this.navCtrl.navigateRoot('/home');
    }
  }

  // Recuperar contraseña
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Restablecer Contraseña',
      message: 'Ingresa tu correo para enviarte un enlace.',
      inputs: [
        { type: 'email', name: 'email', placeholder: 'ejemplo@correo.com' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (result) => {
            if(!result.email) return;
            
            const loading = await this.loadingController.create();
            await loading.present();
            
            const { error } = await this.supabase.sendPasswordReset(result.email);
            
            await loading.dismiss();

            if (error) {
              await this.showAlert('Error', error.message);
            } else {
              await this.showAlert('¡Listo!', 'Revisa tu correo.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async showAlert(title: string, msg: string) {
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: ['OK'],
    });
    await alert.present();
  }
}