import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderProfileComponent } from './header-profile/header-profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProductCardComponent } from './product-card/product-card.component';

import { SidebarPedidoComponent } from './sidebar-pedido/sidebar-pedido.component';

@NgModule({
  declarations: [
    HeaderProfileComponent,
    NavbarComponent,
    ProductCardComponent,
    SidebarPedidoComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    HeaderProfileComponent,
    NavbarComponent,
    ProductCardComponent,
    SidebarPedidoComponent
  ]
})
export class ComponentsModule { }