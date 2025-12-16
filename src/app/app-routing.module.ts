import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'app-start', // O cambia a 'login' si prefieres
    pathMatch: 'full'
  },
  {
    path: 'app-start',
    loadChildren: () => import('./pages/app-start/app-start.module').then( m => m.AppStartPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'product-view/:id',
    loadChildren: () => import('./pages/product-view/product-view.module').then( m => m.ProductViewPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'cart-pay',
    loadChildren: () => import('./pages/cart-pay/cart-pay.module').then( m => m.CartPayPageModule)
  },
  {
    path: 'pay-method',
    loadChildren: () => import('./pages/pay-method/pay-method.module').then( m => m.PayMethodPageModule)
  },
  {
    path: 'pedido-cargando',
    loadChildren: () => import('./pages/pedido-cargando/pedido-cargando.module').then( m => m.PedidoCargandoPageModule)
  },
  {
    path: 'pedido-estado',
    loadChildren: () => import('./pages/pedido-estado/pedido-estado.module').then( m => m.PedidoEstadoPageModule)
  },
  {
    path: 'favorite',
    loadChildren: () => import('./pages/favorite/favorite.module').then( m => m.FavoritePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule)
  },
  {
    path: 'admin-add-product',
    loadChildren: () => import('./pages/admin-add-product/admin-add-product.module').then( m => m.AdminAddProductPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }