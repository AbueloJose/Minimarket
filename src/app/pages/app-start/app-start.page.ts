import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-app-start',
  templateUrl: './app-start.page.html',
  styleUrls: ['./app-start.page.scss'],
  standalone: false
})
export class AppStartPage implements OnInit {

  constructor(
    private router: Router,
    private menuCtrl: MenuController 
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.menuCtrl.enable(false); 
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true); 
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}