import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CartPayPageRoutingModule } from './cart-pay-routing.module';
import { CartPayPage } from './cart-pay.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartPayPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CartPayPage]
})
export class CartPayPageModule {}