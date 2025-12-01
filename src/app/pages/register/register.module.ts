import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <--- IMPORTANTE
import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page';

// Componentes
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <--- Vital para el formGroup
    IonicModule,
    RegisterPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}