import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
    const modal = await this.modalController.create({
      component: SidebarPedidoComponent,
      cssClass: 'sidebar-pedido-modal', 
      backdropDismiss: true
    });

    await modal.present();
  }
}