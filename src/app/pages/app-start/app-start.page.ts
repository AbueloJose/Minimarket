import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular'; // <--- IMPORTANTE: 1. Importar esto

@Component({
  selector: 'app-app-start',
  templateUrl: './app-start.page.html',
  styleUrls: ['./app-start.page.scss'],
  standalone: false
})
export class AppStartPage implements OnInit {

  constructor(
    private router: Router,
    private menuCtrl: MenuController // <--- IMPORTANTE: 2. Inyectarlo aquí
  ) {}

  ngOnInit() {}

  // SE EJECUTA CUANDO ENTRAS A LA PÁGINA
  ionViewWillEnter() {
    this.menuCtrl.enable(false); // <--- ESTO OCULTA EL SIDEBAR
  }

  // SE EJECUTA CUANDO SALES DE LA PÁGINA (Login o Registro)
  ionViewWillLeave() {
    this.menuCtrl.enable(true); // <--- ESTO LO VUELVE A ACTIVAR PARA EL RESTO DE LA APP
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}