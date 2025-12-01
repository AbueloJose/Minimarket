import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-start',
  templateUrl: './app-start.page.html',
  styleUrls: ['./app-start.page.scss'],
  standalone: false // <--- Modo Clásico
})
export class AppStartPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}