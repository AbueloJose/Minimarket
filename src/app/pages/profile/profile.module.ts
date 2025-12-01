import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <--- AGREGADO ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';

// IMPORTAMOS TUS COMPONENTES
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <--- INDISPENSABLE PARA QUE FUNCIONE EL FORMULARIO
    IonicModule,
    ProfilePageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}