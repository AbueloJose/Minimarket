import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
// Importamos el sidebar para poder abrirlo
import { SidebarPedidoComponent } from '../sidebar-pedido/sidebar-pedido.component';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrls: ['./header-profile.component.scss'],
  standalone: false
})
export class HeaderProfileComponent implements OnInit {
  
  username: string = 'Usuario'; 
  @Input() introText: string = '¿Qué es lo que pediremos hoy?';
  selectedAvatar: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  @Output() notifyClick = new EventEmitter<void>();

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  async abrirSidebarEstadoPedido() {
    // Creamos el Modal con el componente del Sidebar
    const modal = await this.modalController.create({
      component: SidebarPedidoComponent,
      cssClass: 'sidebar-pedido-modal', // Clase transparente para ver el fondo
      backdropDismiss: true
    });

    await modal.present();
  }
}