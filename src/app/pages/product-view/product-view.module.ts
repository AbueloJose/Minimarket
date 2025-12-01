import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProductViewPageRoutingModule } from './product-view-routing.module';
import { ProductViewPage } from './product-view.page';

// IMPORTAMOS TUS COMPONENTES (Header y Navbar)
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductViewPageRoutingModule,
    ComponentsModule // <--- SIN ESTO, NO SE VE LA NAVBAR
  ],
  declarations: [ProductViewPage]
})
export class ProductViewPageModule {}