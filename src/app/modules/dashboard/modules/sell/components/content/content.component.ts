import { Component, inject, input, SimpleChanges } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { ProductService } from '../../../../../../service/product.service';
import { Category } from '../../../../../shared/models/category';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  public searchTerm = input<string>('');

  private readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);
  public router = inject(Router);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public filteredProducts: any[] = [];
  public selectedProducts: any[] = [];
  public selectedCategory: string = 'all';

  ngOnInit() {
    this.getCategories();
    this.getAllPorducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.searchTerm());
    if (changes['searchTerm']) {
      this.filterProducts();
    }
    
  }



  async getCategories() {
    try {
      this.lstCategories = await firstValueFrom(this.categoryService.getCategories());
      console.log('Empleados:', this.lstCategories);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }



  selectCategory(categoryId: any) {
    this.selectedCategory = categoryId;
    console.log('Categoría seleccionada:', categoryId);
  }

  async getAllPorducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        console.log('✅ Productos:', res)
        this.lstProducts = res
        this.lstProducts = res.map(prod => ({
          ...prod,
          prod_start_date: prod.prod_start_date?.toDate ? prod.prod_start_date.toDate() : prod.prod_start_date
        }));
        this.filteredProducts = this.lstProducts;
        console.log(this.lstProducts);
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }

  newProduct(){
    this.router.navigate(['product/add']);
  }

  filterProducts() {
    const term = this.searchTerm().toLowerCase().trim() || '';
    const cat = this.selectedCategory;
  
    if (term.length < 3) {
      this.filteredProducts = this.lstProducts.filter(p =>
        cat === 'all' || p.prod_category_id === cat
      );
      return;
    }

    this.filteredProducts = this.lstProducts.filter(p => {
      const matchesSearch =
        p.prod_name?.toLowerCase().includes(term) ||
        p.prod_code?.toLowerCase().includes(term);
  
      const matchesCategory =
        cat === 'all' || p.prod_category_id === cat;
  
      return matchesSearch && matchesCategory;
    });
  }

addToSelection(product: any) {
  if (product.prod_quantity_available <= 0) return; // No permitir si ya no hay stock

  product.prod_quantity_available--; // Resta 1 disponible

  // Buscar si ya está en seleccionados
  const existing = this.selectedProducts.find(p => p.prod_code === product.prod_code);

  if (existing) {
    existing.pod_selectedQty += 1;

    // Recalcular el precio total cada vez que cambia la cantidad
    this.updatePrice(product)
  } else {
    // Agregar una copia del producto con cantidad seleccionada y precio total
    const unitPrice = product.prod_discount_price ?? product.prod_sale_price;

    this.selectedProducts.push({
      ...product,
      pod_selectedQty: 1,
      pro_price_unit: unitPrice, // nuevo campo total inicial
    });
  }

  console.log(this.selectedProducts);
}



  increaseQty(item: any) {
  if (item.prod_quantity_available > 0) {
    item.pod_selectedQty++;
    item.prod_quantity_available--;

    this.updatePrice(item);

    // 🔹 Sincronizar en arrays principales
    this.updateProductStock(item.prod_code, item.prod_quantity_available);
  }
}

decreaseQty(item: any) {
  if (item.pod_selectedQty > 1) {
    item.pod_selectedQty--;
    item.prod_quantity_available++;

    this.updatePrice(item);

    // 🔹 Sincronizar en arrays principales
    this.updateProductStock(item.prod_code, item.prod_quantity_available);
  }
}

removeProduct(item: any) {
  item.prod_quantity_available += item.pod_selectedQty;
  this.selectedProducts = this.selectedProducts.filter(
    (p) => p.prod_code !== item.prod_code
  );

  // 🔹 Sincronizar cuando se elimina del carrito
  this.updateProductStock(item.prod_code, item.prod_quantity_available);
}



  onDiscountChange(item: any) {
    console.log(item);
    // Si no hay descuento, vuelve a usar el precio original
    if (!item.prod_discount_price || item.prod_discount_price <= 0) {
      item.prod_discount_price = null;
    }
   this.updatePrice(item)
  }

  getFinalPrice(item: any) {
    // Usa el precio con descuento si existe, si no el original
    return item.prod_discount_price ?? item.prod_sale_price;
  }

  updatePrice(item: any) {
    const unitPrice = item.prod_discount_price ?? item.prod_sale_price;
    item.pro_price_unit = unitPrice * item.pod_selectedQty;
  }

  updateProductStock(prodCode: string, newQty: number) {
    // 🔹 Actualiza en lstProducts
    const productInList = this.lstProducts.find(p => p.prod_code === prodCode);
    if (productInList) {
      productInList.prod_quantity_available = newQty;
    }
  
    // 🔹 Actualiza también en filteredProducts
    const productInFiltered = this.filteredProducts.find(p => p.prod_code === prodCode);
    if (productInFiltered) {
      productInFiltered.prod_quantity_available = newQty;
    }
  }

  
  getTotalPrice(): number {
    return this.selectedProducts.reduce(
      (acc, item) => acc + (item.pro_price_unit || 0),
      0
    );
  }
  
  clearBasket() {
    if (this.selectedProducts.length === 0) return;
  
    Swal.fire({
      title: '¿Vaciar canasta?',
      text: 'Se eliminarán todos los productos seleccionados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      reverseButtons: true,
    }).then(result => {
      if (result.isConfirmed) {
  
        // 🔹 Restaurar el stock de los productos
        this.selectedProducts.forEach(item => {
          const original = this.filteredProducts.find(p => p.prod_code === item.prod_code);
          if (original) {
            original.prod_quantity_available += item.pod_selectedQty;
          }
        });
  
        // 🔹 Vaciar canasta
        this.selectedProducts = [];
  
        // ✅ Mostrar mensaje de éxito
        Swal.fire({
          title: 'Canasta vaciada',
          text: 'Todos los productos han sido removidos.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

}
