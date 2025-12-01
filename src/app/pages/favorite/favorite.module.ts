import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FavoritePageRoutingModule } from './favorite-routing.module';
import { FavoritePage } from './favorite.page';

// IMPORTAMOS TUS COMPONENTES
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritePageRoutingModule,
    ComponentsModule // <--- Indispensable
  ],
  declarations: [FavoritePage]
})
export class FavoritePageModule {}