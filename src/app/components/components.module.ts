import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Importamos los componentes (asegúrate que las carpetas se llamen así)
import { HeaderProfileComponent } from './header-profile/header-profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProductCardComponent } from './product-card/product-card.component';

// Si creaste el sidebar, descomenta la siguiente línea:
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
    // ESTA ES LA PARTE IMPORTANTE: Exportarlos para que el Home los vea
    HeaderProfileComponent,
    NavbarComponent,
    ProductCardComponent,
    SidebarPedidoComponent
  ]
})
export class ComponentsModule { }