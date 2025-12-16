import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  
  showAvatarModal = false;
  isEditing = false;
  inputDisabled = true;

  // Ruta con barra al inicio
  defaultAvatar = '/assets/img/df_minimarket.svg';
  selectedAvatar: string = this.defaultAvatar;
  initialAvatar = ''; 

  avatarUrls: string[] = [
    '/assets/img/df_minimarket.svg',
    'https://ionicframework.com/docs/img/demos/avatar.svg',
    'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
    'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'
  ];

  // FORMULARIO SIMPLIFICADO (Sin validadores estrictos para evitar errores)
  credentials = this.fb.nonNullable.group({
    name: ['', [Validators.required]], 
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]], 
    phone: ['', [Validators.required]], 
  });

  usuario: any = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.cargarUsuario();
  }

  async cargarUsuario() {
    const localUser = localStorage.getItem('usuario');
    if (localUser) {
      this.usuario = JSON.parse(localUser);
      this.initializeFormWithUserData();
    }

    const userSupabase = await this.supabase.getCurrentUser();
    if (userSupabase) {
      const perfilData = await this.supabase.getUserProfile(userSupabase.id); 
      
      this.usuario = { 
        ...this.usuario, 
        id: userSupabase.id,
        email: userSupabase.email,
        ...perfilData 
      };

      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      this.initializeFormWithUserData();
    } else if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  private initializeFormWithUserData() {
    if (!this.usuario) return;

    this.credentials.patchValue({
      name: this.usuario.nombre || '',
      email: this.usuario.email || '',
      address: this.usuario.direccion || '',
      phone: this.usuario.telefono || '',
    });

    if (this.usuario.avatar && this.usuario.avatar.trim() !== '') {
      this.selectedAvatar = this.usuario.avatar;
    } else {
      this.selectedAvatar = this.defaultAvatar;
    }

    // --- NUEVO: AVISA AL MENÚ QUE ESTA ES LA FOTO ACTUAL ---
    this.supabase.updateLocalAvatar(this.selectedAvatar);
  }

  openAvatarSelector() { this.showAvatarModal = true; }
  closeAvatarSelector() { this.showAvatarModal = false; }

  confirmAvatarSelection(url: string) {
    this.selectedAvatar = url;
    this.closeAvatarSelector();
  }

  editProfile() {
    this.isEditing = true;
    this.initialAvatar = this.selectedAvatar;
    this.inputDisabled = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.inputDisabled = true;
    this.initializeFormWithUserData();
    this.selectedAvatar = this.initialAvatar;
  }

  async saveChangesEdit() {
    if (this.credentials.invalid) {
      // Si falla, mostramos alerta suave
      this.presentAlert('Atención', 'No puedes dejar campos vacíos.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando...' });
    await loading.present();

    const rawData = this.credentials.getRawValue();

    const dataToUpdate = {
      nombre: rawData.name,
      direccion: rawData.address,
      telefono: rawData.phone,
      avatar: this.selectedAvatar 
    };

    try {
      const { error } = await this.supabase.updateUserProfile(this.usuario.id, dataToUpdate);

      if (error) throw error;

      this.usuario = { ...this.usuario, ...dataToUpdate };
      localStorage.setItem('usuario', JSON.stringify(this.usuario));

      // --- NUEVO: AVISA AL MENÚ QUE LA FOTO CAMBIÓ ---
      this.supabase.updateLocalAvatar(this.selectedAvatar);

      this.isEditing = false;
      this.inputDisabled = true;
      
      await loading.dismiss();
      this.presentAlert('Éxito', 'Perfil actualizado.');

    } catch (error) {
      await loading.dismiss();
      console.error(error);
      this.presentAlert('Error', 'No se pudo guardar en la base de datos.');
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Salir', 
          handler: async () => {
            await this.supabase.logout();
            localStorage.removeItem('usuario');
            
            // Reseteamos el avatar al default al salir
            this.supabase.updateLocalAvatar(this.defaultAvatar);
            
            this.router.navigate(['/login']); 
          } 
        }
      ]
    });
    await alert.present();
  }

  // --- HELPERS VISUALES ---
  onlyCharacteres(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }

  onlyAlphanumeric(event: any) {
    // Permite letras, números, puntos, hashtags, comas y guiones
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\.\#\,\-\s]/g, '');
  }

  onlyNumbers(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}