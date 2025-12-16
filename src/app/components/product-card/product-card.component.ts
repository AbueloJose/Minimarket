import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false
})
export class ProductCardComponent implements OnInit {
  
  @Input() id!: string; // Recibe el ID (que es item.id_producto)
  @Input() name!: string;
  @Input() price!: number;
  @Input() imageUrl!: string;

  constructor(private router: Router) { } 

  ngOnInit() {
  }

  // Función llamada por el (click) en el HTML para navegar
  goToProductView() {
    // Navega a la ruta: /product-view/ID_DEL_PRODUCTO
    this.router.navigate(['/product-view', this.id]);
  }
}