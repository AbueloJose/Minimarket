import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CartPageRoutingModule } from './cart-routing.module';
import { CartPage } from './cart.page';

// IMPORTANTE: Importamos tu módulo de componentes
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartPageRoutingModule,
    ComponentsModule // <--- Sin esto no se ve la barra de navegación
  ],
  declarations: [CartPage]
})
export class CartPageModule {}