import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  
  menuAvatar: string = '/assets/img/df_minimarket.svg';
  usuarioNombre: string = 'Inicia Sesión';
  usuarioEmail: string = '';
  esAdmin: boolean = false; 

  // 1. MENÚ CLIENTE
  private clientPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Perfil', url: '/profile', icon: 'person' },
    { title: 'Carrito', url: '/carrito', icon: 'cart' },
    { title: 'Mis Pedidos', url: '/pedidos', icon: 'list' },
  ];

  // 2. MENÚ ADMIN (NUEVO SIDEBAR)
  private adminPages = [
    { title: 'Gestionar Productos', url: '/admin-dashboard', icon: 'layers' },
    { title: 'Agregar Producto', url: '/admin-add-product', icon: 'add-circle' },
    // Puedes agregar 'Ver Pedidos Clientes' aquí en el futuro
  ];

  // La variable que usa el HTML
  public appPages = this.clientPages; 
  public labels = ['Familia', 'Amigos', 'Notas'];

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Escuchar cambios de sesión para actualizar menú en tiempo real
    this.supabase.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.checkUserRole(session.user.id);
      } else {
        this.resetMenu();
      }
    });
  }

  async ngOnInit() {
    this.supabase.currentAvatar$.subscribe(url => { if(url) this.menuAvatar = url; });
    
    // Chequeo inicial
    const user = await this.supabase.getCurrentUser();
    if(user) {
      await this.checkUserRole(user.id);
    }
  }

  async checkUserRole(uid: string) {
    // Verificamos rol
    this.esAdmin = await this.supabase.isAdmin(uid);
    
    // CAMBIO DE MENÚ SEGÚN ROL
    if (this.esAdmin) {
      this.appPages = this.adminPages; 
    } else {
      this.appPages = this.clientPages; 
    }

    // Cargar datos perfil
    const profile = await this.supabase.getUserProfile(uid);
    if (profile) {
      this.usuarioNombre = profile.nombre || 'Usuario';
      this.usuarioEmail = profile.email || '';
      if (profile.avatar) this.supabase.updateLocalAvatar(profile.avatar);
    }
  }

  async logout() {
    await this.supabase.logout();
    this.resetMenu();
    this.router.navigate(['/login']);
  }

  resetMenu() {
    this.usuarioNombre = 'Inicia Sesión';
    this.usuarioEmail = '';
    this.menuAvatar = '/assets/img/df_minimarket.svg';
    this.esAdmin = false;
    this.appPages = this.clientPages; // Vuelta al menú normal
  }
}