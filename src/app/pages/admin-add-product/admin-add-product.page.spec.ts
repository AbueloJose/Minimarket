import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAddProductPage } from './admin-add-product.page';

describe('AdminAddProductPage', () => {
  let component: AdminAddProductPage;
  let fixture: ComponentFixture<AdminAddProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
