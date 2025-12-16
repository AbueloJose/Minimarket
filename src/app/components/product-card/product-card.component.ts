import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false
})
export class ProductCardComponent implements OnInit {
  
  @Input() id!: string; 
  @Input() name!: string;
  @Input() price!: number;
  @Input() imageUrl!: string;

  constructor(private router: Router) { } 

  ngOnInit() {
  }

  
  goToProductView() {
    this.router.navigate(['/product-view', this.id]);
  }
}