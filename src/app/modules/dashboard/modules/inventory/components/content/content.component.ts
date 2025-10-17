import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../../../../service/product.service';
import { Category } from '../../../../../shared/models/category';

@Component({
  selector: 'app-content',
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  private readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public totalInventoryCost: number = 0


  ngOnInit() {
    this.getAllCategories();
    this.getAllPorducts();
    this.getAllProductsCostTotal();
  }
  


  async getAllCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log(this.lstCategories = res);
        console.log('✅ Categorías:', res)
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }

  async getAllPorducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        console.log('✅ Productos:', res)
        this.lstProducts = res
        console.log(this.lstProducts);
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }
  async getAllProductsCostTotal() {

    
    this.productService.getAllProductsCostTotal().then((res) => {
      console.log(res);
      this.totalInventoryCost = res
      
    }).catch((err) => {
      console.error(err);
      
    });
  }

  async onCategoryChange(event: any){
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
      console.log('Categoría seleccionada:', selectedCategoryId);
      if (!selectedCategoryId) return this.getAllPorducts();

    this.productService.getProductsByCategory(selectedCategoryId)

    try {
      this.lstProducts = await firstValueFrom(this.productService.getProductsByCategory(selectedCategoryId));
      console.log('productos:', this.lstProducts);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  

}
