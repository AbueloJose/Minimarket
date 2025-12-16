import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
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
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  get correo() { return this.credentials.controls.correo; }
  get contrasena() { return this.credentials.controls.contrasena; }

  async login() {
    if (this.credentials.invalid) {
      await this.mostrarAlerta('Formulario Incorrecto', 'Revisa que el correo tenga @ y la contraseña tenga 6 caracteres.');
      this.credentials.markAllAsTouched();
      return; 
    }

    const { correo, contrasena } = this.credentials.getRawValue();

    const loading = await this.loadingController.create({ 
      message: 'Iniciando sesión...',
      duration: 10000 
    });
    await loading.present();

    try {
      console.log('--- INTENTANDO LOGIN ---');
      
      const { data, error } = await this.supabase.signIn(correo, contrasena);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Auth correcto. User ID:', data.user.id);

        const rol = await this.supabase.getUserRole(data.user.id);
        
        await loading.dismiss(); 

        console.log('Rol obtenido de DB:', rol);

        if (rol === 'admin') {
          console.log('--> Redirigiendo a Panel ADMIN');
          this.navCtrl.navigateRoot('/admin-dashboard'); 
        } else if (rol === 'cliente') {
          console.log('--> Redirigiendo a HOME (Cliente)');
          this.navCtrl.navigateRoot('/home');
        } else {
          console.warn('Usuario sin rol definido, enviando a home.');
          this.navCtrl.navigateRoot('/home');
        }

      } else {
        throw new Error('No se recibieron datos del usuario.');
      }

    } catch (e: any) {
      await loading.dismiss().catch(() => {});
      console.error('ERROR LOGIN:', e);
      
      let msg = e.message;
      if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';

      await this.mostrarAlerta('Error de acceso', msg);
    }
  }

  async forgotPassword() {
    await this.mostrarAlerta('Recuperar', 'Contacta al administrador para restablecer tu cuenta.');
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }
}