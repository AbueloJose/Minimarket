import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: false
})
export class FavoritePage implements OnInit {
  
  usuario: any = null;
  productosFiltrados: any[] = [];
  loading: boolean = true;

  constructor(
    private supabase: SupabaseService, 
    private router: Router
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    const user = await this.supabase.getCurrentUser();
    
    if (user) {
      this.usuario = user;
      // Esto llena la variable que usa el HTML nuevo
      this.productosFiltrados = await this.supabase.getFavoritos();
    } else {
      this.usuario = null;
      this.productosFiltrados = [];
    }
    this.loading = false;
  }
}