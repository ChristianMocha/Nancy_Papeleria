import { Component, inject, input, SimpleChanges } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { ProductService } from '../../../../../../service/product.service';
import { Category } from '../../../../../shared/models/category';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { ModalPurchaseComponent } from '../modal-purchase/modal-purchase.component';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, ModalPurchaseComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  public searchTerm = input<string>('');

  private readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);
  public readonly shoppingCartService = inject(ShoppingCartService);
  public router = inject(Router);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public filteredProducts: any[] = [];
  public selectedProducts: any[] = [];
  public selectedProductsUpdate: any[] = [];
  public selectedCategory: string = 'all';

  public showModal: boolean = false;

  public shopDate: string = new Date().toISOString().split('T')[0];


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
    if (product.prod_quantity_available <= 0) return; // ❌ No permitir si ya no hay stock
  
    product.prod_quantity_available--; // 🔹 Resta 1 disponible
  
    // 🔹 Buscar si ya está en seleccionados
    const existing = this.selectedProducts.find(p => p.prod_code === product.prod_code);
  
    if (existing) {
      existing.pod_selectedQty += 1;
      this.updatePrice(existing); // Recalcular el precio total
    } else {
      // 🔹 Agregar una copia del producto con cantidad seleccionada y precio total
      const unitPrice = product.prod_discount_price ?? product.prod_sale_price;
  
      this.selectedProducts.push({
        ...product,
        pod_selectedQty: 1,
        pro_price_unit: unitPrice,
      });
    }
  
    // 🔹 Actualizar o insertar producto en selectedProductsUpdate
    const existingUpdate = this.selectedProductsUpdate.find(
      (p) => p.prod_code === product.prod_code
    );
  
    if (existingUpdate) {
      // ✅ Actualizar solo los datos necesarios
      existingUpdate.prod_quantity_available = product.prod_quantity_available;
    } else {
      // ✅ Insertar si no existe
      this.selectedProductsUpdate.push({
        ...product,
        prod_quantity_available: product.prod_quantity_available,
      });
    }
  
    console.log('🛒 selectedProducts:', this.selectedProducts);
    console.log('📦 selectedProductsUpdate:', this.selectedProductsUpdate);
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

  updateProductStock(prodCode: string, newQty: number, removeFromUpdate: boolean = false) {
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
  
    // 🔹 Actualiza o elimina en selectedProductsUpdate
    const productInUpdate = this.selectedProductsUpdate.find(p => p.prod_code === prodCode);
  
    if (removeFromUpdate) {
      // 🗑️ Eliminar del array si corresponde
      this.selectedProductsUpdate = this.selectedProductsUpdate.filter(
        p => p.prod_code !== prodCode
      );
    } else if (productInUpdate) {
      // 🔁 Actualizar cantidad disponible si ya existe
      productInUpdate.prod_quantity_available = newQty;
    } else {
      // ➕ Agregar si no estaba en la lista de actualización
      const product = this.lstProducts.find(p => p.prod_code === prodCode);
      if (product) {
        this.selectedProductsUpdate.push({ ...product, prod_quantity_available: newQty });
      }
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
  
        this.selectedProducts.forEach(item => {
          const productInList = this.lstProducts.find(p => p.prod_code === item.prod_code);
          if (productInList) {
            productInList.prod_quantity_available += item.pod_selectedQty;
          }
  
          const productInFiltered = this.filteredProducts.find(p => p.prod_code === item.prod_code);
          if (productInFiltered) {
            productInFiltered.prod_quantity_available += item.pod_selectedQty;
          }
  
          const productInUpdate = this.selectedProductsUpdate.find(p => p.prod_code === item.prod_code);
          if (productInUpdate) {
            productInUpdate.prod_quantity_available += item.pod_selectedQty;
          }
        });
  
        this.selectedProducts = [];
        this.selectedProductsUpdate = [];
  
        Swal.fire({
          title: '🧺 Canasta vaciada',
          text: 'Todos los productos han sido removidos y el stock restaurado.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }



  savePurchase(data: any){

    const shopConcept = this.selectedProducts.map(p => `(${p.pod_selectedQty}) ${p.prod_name}`).join(', ');

    console.log(data);
    let formattedData = {
      shop_date: this.shopDate,
      shop_change: data.change,
      shop_payment: data.payment,
      shop_total: this.getTotalPrice(),
      shop_concept: shopConcept,
      shop_products: this.selectedProducts.map(p => ({
        shop_prod_description: p.prod_description,
        shop_prod_quantity_available: p.prod_quantity_available,
        shop_prod_name: p.prod_name,
        shop_prod_purchase_cost: p.prod_purchase_cost,
        shop_prod_sale_price: p.prod_sale_price,
        shop_prod_code: p.prod_code,
        shop_prod_id: p.prod_id,
        shop_prod_category_id: p.prod_category_id,
        shop_prod_image: p.prod_image,
        shop_pod_selectedQty: p.pod_selectedQty,
        shop_pro_price_unit: p.pro_price_unit
      }))
    };


    console.log(formattedData);

    this.shoppingCartService.savePurchase(formattedData).then((res) => {
      console.log(res);
      this.shoppingCartService.updateMultipleProducts(this.selectedProductsUpdate).then((res) => {
        this.selectedProducts = [];
        this.selectedProductsUpdate = [];
        this.showModal = false;
      });
    });
  }

  showModalPurchase(){
    if(this.getTotalPrice() > 0)
      this.showModal = true;
  }

}
