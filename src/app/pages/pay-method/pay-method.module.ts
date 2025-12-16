import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PayMethodPageRoutingModule } from './pay-method-routing.module';
import { PayMethodPage } from './pay-method.page';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayMethodPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PayMethodPage]
})
export class PayMethodPageModule {}