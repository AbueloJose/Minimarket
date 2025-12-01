import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false // <--- Modo Clásico
})
export class ProfilePage implements OnInit {
  showAvatarModal = false;
  pendingAvatarSelection = '';
  initialAvatar = '';
  isEditing = false;
  isDisabled = false;
  inputDisabled = true;

  avatarUrls: string[] = [
    'https://ionicframework.com/docs/img/demos/avatar.svg',
    'https://via.placeholder.com/150/FF0000/FFFFFF?text=Chicken1',
    'https://via.placeholder.com/150/00FF00/FFFFFF?text=Chicken2'
  ];

  selectedAvatar: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  // VALIDADORES
  nameValidator: ValidatorFn = (control) => {
    const value = control.value || '';
    const valid = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value);
    return valid ? null : { invalidName: true };
  };

  addressValidator: ValidatorFn = (control) => {
    const value = control.value || '';
    const valid = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/.test(value);
    return valid ? null : { invalidAddress: true };
  };

  phoneValidator: ValidatorFn = (control) => {
    const value = control.value || '';
    const valid = /^[0-9]+$/.test(value);
    return valid ? null : { invalidPhone: true };
  };

  // FORMULARIO
  credentials = this.fb.nonNullable.group({
    name: ['', [Validators.required, this.nameValidator]],
    lastname: [''], 
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, this.addressValidator]],
    phone: ['', [Validators.required, this.phoneValidator]],
  });

  usuario: any = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    // Intenta obtener usuario real
    const user = await this.supabase.getCurrentUser();
    
    if (user) {
      this.usuario = user;
      const perfil = await this.supabase.getUserProfile(user.id);
      if (perfil) {
        this.usuario = { ...this.usuario, ...perfil };
        if (perfil.avatar) this.selectedAvatar = perfil.avatar;
      }
    } else {
      // DATOS FALSOS TEMPORALES (Para que veas el diseño)
      console.log('Modo Invitado (Visualización)');
      this.usuario = {
        nombre: 'Invitado',
        email: 'invitado@pollo.com',
        direccion: 'Av. Siempre Viva 123',
        telefono: '999999999'
      };
    }

    this.initializeFormWithUserData();
  }

  private initializeFormWithUserData() {
    this.credentials.patchValue({
      name: this.usuario.nombre || 'Usuario',
      lastname: this.usuario.apellido || '',
      email: this.usuario.email || '',
      address: this.usuario.direccion || '',
      phone: this.usuario.telefono || '',
    });
  }

  // --- LÓGICA DE AVATAR ---
  openAvatarSelector() { this.showAvatarModal = true; }
  closeAvatarSelector() { this.showAvatarModal = false; }

  async confirmAvatarSelection(url: string) {
    this.selectedAvatar = url;
    this.closeAvatarSelector();
  }

  // --- LÓGICA DE EDICIÓN ---
  editProfile() {
    this.isEditing = true;
    this.initialAvatar = this.selectedAvatar;
    this.inputDisabled = false; // Habilitar inputs
  }

  cancelEdit() {
    this.isEditing = false;
    this.inputDisabled = true;
    this.initializeFormWithUserData();
    this.selectedAvatar = this.initialAvatar;
  }

  async saveChangesEdit() {
    const updated = this.credentials.getRawValue();
    // Aquí iría la lógica de guardado real
    console.log('Guardando cambios...', updated);
    
    // Simulación de guardado
    this.usuario = { ...this.usuario, ...updated, nombre: updated.name };
    this.isEditing = false;
    this.inputDisabled = true;
    
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Perfil actualizado (Simulación)',
      buttons: ['OK']
    });
    await alert.present();
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
            await this.supabase.signOut();
            // Redirigir al login o home
            this.router.navigate(['/login']); 
          } 
        }
      ]
    });
    await alert.present();
  }

  // HELPERS INPUTS
  onlyCharacteres(event: any) {
    const value = event.target.value;
    event.target.value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }
  onlyAlphanumeric(event: any) {
    const value = event.target.value;
    event.target.value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, '');
  }
  onlyNumbers(event: any) {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, '');
  }
}