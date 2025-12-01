import { Component } from '@angular/core';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

// --- TUS VALIDADORES PERSONALIZADOS ---
function textOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const textOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return textOnlyRegex.test(value) ? null : { textOnly: true };
  };
}

function addressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const addressRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-]+$/;
    return addressRegex.test(value) ? null : { invalidAddress: true };
  };
}

function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(value) ? null : { invalidPhone: true };
  };
}

function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  return (form) => {
    const pass = form.get(password)?.value;
    const confirm = form.get(confirmPassword)?.value;
    return pass === confirm ? null : { mismatch: true };
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false // <--- Modo Clásico
})
export class RegisterPage {
  
  credentials = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(50), textOnlyValidator()]],
      lastname: ['', [Validators.required, Validators.maxLength(50), textOnlyValidator()]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.maxLength(200), addressValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      passwordConfirmation: ['', [Validators.required, Validators.maxLength(50)]],
    },
    {
      validators: passwordMatchValidator('password', 'passwordConfirmation'),
    }
  );

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async createAccount() {
    if (this.credentials.invalid) return;

    const loading = await this.loadingController.create({ message: 'Registrando...' });
    await loading.present();

    const { email, password, name, lastname, address, phone } = this.credentials.getRawValue();

    // Enviamos los datos extra como metadata del usuario
    const userData = {
      nombre: name,
      apellido: lastname,
      direccion: address,
      telefono: phone
    };

    const { data, error } = await this.supabase.signUp(email, password, userData);

    await loading.dismiss();

    if (error) {
      await this.showAlert('Error', error.message);
      return;
    }

    if (data?.user) {
      await this.showAlert(
        '¡Registro Exitoso!', 
        'Por favor revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
      );
      this.navCtrl.navigateRoot('/login');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // --- FILTROS DE INPUT (UX) ---
  filterTextOnly(event: any, controlName: string) {
    const input = event.target;
    const value = input.value;
    const filtered = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    if (value !== filtered) {
      input.value = filtered;
      this.credentials.get(controlName)?.setValue(filtered);
    }
  }

  filterPhoneOnly(event: any) {
    const input = event.target;
    const value = input.value;
    const filtered = value.replace(/[^0-9]/g, '');
    if (value !== filtered) {
      input.value = filtered;
      this.credentials.get('phone')?.setValue(filtered);
    }
  }

  filterAddress(event: any) {
    const input = event.target;
    const value = input.value;
    const filtered = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-]/g, '');
    if (value !== filtered) {
      input.value = filtered;
      this.credentials.get('address')?.setValue(filtered);
    }
  }

  filterPassword(event: any) {
    // Solo limitamos longitud visualmente, el validador hace el resto
    const input = event.target;
    if (input.value.length > 50) input.value = input.value.substring(0, 50);
  }

  filterPasswordConfirmation(event: any) {
    const input = event.target;
    if (input.value.length > 50) input.value = input.value.substring(0, 50);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}