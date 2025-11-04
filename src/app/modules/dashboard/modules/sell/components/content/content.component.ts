import { Component, inject, input, output, SimpleChanges } from '@angular/core';
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
import { DateService } from '../../../../../../service/date.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, ModalPurchaseComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  public lstProductsSearch = input<any[]>([]);
  public searchTerm = input<any>();
  public deleteSearchTerm = output<any>();

  private readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);
  public readonly shoppingCartService = inject(ShoppingCartService);
  public readonly dateService = inject(DateService);
  public router = inject(Router);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public filteredProducts: any[] = [];
  public selectedProducts: any[] = [];
  public selectedProductsUpdate: any[] = [];
  public selectedCategory: string = 'all';

  public showModal: boolean = false;
  public loading: boolean = false;
  public showButtonMore: boolean = false;

  public shopDate: string = '';

  ngOnInit() {
    this.shopDate = this.dateService.getDate();
    console.log(this.shopDate);
    this.getCategories();
    this.getAllPorducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lstProductsSearch']) {
      this.filterProducts();
    }
  }

  async getCategories() {
    try {
      this.lstCategories = await firstValueFrom(
        this.categoryService.getCategories()
      );
      console.log('Empleados:', this.lstCategories);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  selectCategory(categoryId: any) {
    console.log(categoryId);
    this.selectedCategory = categoryId;
    if (categoryId === 'all') {
      this.showButtonMore = false;
      this.getAllPorducts();
      return;
    }
    console.log('Categoría seleccionada:', categoryId);
    this.productService.getProductsByCategory(categoryId).subscribe((res) => {
      console.log(res);
      this.showButtonMore = true;
      this.filteredProducts = res;
    });
  }

  async getAllPorducts(nextPage: boolean = false) {
    this.loading = true;
    this.lstProducts = await this.productService.getProductsPaginated(
      10,
      nextPage
    );

    if (nextPage) {
      this.filteredProducts = [...this.filteredProducts, ...this.lstProducts];
    } else {
      this.filteredProducts = this.lstProducts;
    }

    console.log(this.filteredProducts);

    this.loading = false;
  }
  async nextPage() {
    await this.getAllPorducts(true);
  }

  newProduct() {
    this.router.navigate(['product/add']);
  }

  async filterProducts() {
    console.log(this.lstProductsSearch());

    if (!this.searchTerm()) {
      this.getAllPorducts();
    }
    if (
      this.lstProductsSearch() !== undefined &&
      this.lstProductsSearch() !== null
    ) {
      console.log('entrando correctamente');
      this.filteredProducts = await this.lstProductsSearch();
    }
  }

  addToSelection(product: any) {
    if (product.prod_quantity_available <= 0) return;

    product.prod_quantity_available--;

    const existing = this.selectedProducts.find(
      (p) => p.prod_code === product.prod_code
    );

    if (existing) {
      existing.pod_selectedQty += 1;
      this.updatePrice(existing);
    } else {
      const unitPrice = product.prod_discount_price ?? product.prod_sale_price;

      this.selectedProducts.push({
        ...product,
        pod_selectedQty: 1,
        pro_price_unit: unitPrice,
      });
    }

    const existingUpdate = this.selectedProductsUpdate.find(
      (p) => p.prod_code === product.prod_code
    );

    if (existingUpdate) {
      existingUpdate.prod_quantity_available = product.prod_quantity_available;
    } else {
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

      this.updateProductStock(item.prod_code, item.prod_quantity_available);
    }
  }

  decreaseQty(item: any) {
    if (item.pod_selectedQty > 1) {
      item.pod_selectedQty--;
      item.prod_quantity_available++;

      this.updatePrice(item);

      this.updateProductStock(item.prod_code, item.prod_quantity_available);
    }
  }

  removeProduct(item: any) {
    item.prod_quantity_available += item.pod_selectedQty;
    this.selectedProducts = this.selectedProducts.filter(
      (p) => p.prod_code !== item.prod_code
    );

    this.updateProductStock(item.prod_code, item.prod_quantity_available);
  }

  onDiscountChange(item: any) {
    console.log(item);

    if (!item.prod_discount_price || item.prod_discount_price <= 0) {
      item.prod_discount_price = null;
    }
    this.updatePrice(item);
  }

  getFinalPrice(item: any) {
    return item.prod_discount_price ?? item.prod_sale_price;
  }

  updatePrice(item: any) {
    const unitPrice = item.prod_discount_price ?? item.prod_sale_price;
    item.pro_price_unit = unitPrice * item.pod_selectedQty;
  }

  updateProductStock(
    prodCode: string,
    newQty: number,
    removeFromUpdate: boolean = false
  ) {
    const productInList = this.lstProducts.find(
      (p) => p.prod_code === prodCode
    );
    if (productInList) {
      productInList.prod_quantity_available = newQty;
    }

    const productInFiltered = this.filteredProducts.find(
      (p) => p.prod_code === prodCode
    );
    if (productInFiltered) {
      productInFiltered.prod_quantity_available = newQty;
    }

    const productInUpdate = this.selectedProductsUpdate.find(
      (p) => p.prod_code === prodCode
    );

    if (removeFromUpdate) {
      this.selectedProductsUpdate = this.selectedProductsUpdate.filter(
        (p) => p.prod_code !== prodCode
      );
    } else if (productInUpdate) {
      productInUpdate.prod_quantity_available = newQty;
    } else {
      const product = this.lstProducts.find((p) => p.prod_code === prodCode);
      if (product) {
        this.selectedProductsUpdate.push({
          ...product,
          prod_quantity_available: newQty,
        });
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedProducts.forEach((item) => {
          const productInList = this.lstProducts.find(
            (p) => p.prod_code === item.prod_code
          );
          if (productInList) {
            productInList.prod_quantity_available += item.pod_selectedQty;
          }

          const productInFiltered = this.filteredProducts.find(
            (p) => p.prod_code === item.prod_code
          );
          if (productInFiltered) {
            productInFiltered.prod_quantity_available += item.pod_selectedQty;
          }

          const productInUpdate = this.selectedProductsUpdate.find(
            (p) => p.prod_code === item.prod_code
          );
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

  savePurchase(data: any) {
    const shopConcept = this.selectedProducts
      .map((p) => `(${p.pod_selectedQty}) ${p.prod_name}`)
      .join(', ');
    const totalEarnings = this.selectedProducts.reduce((acc, p) => {
      const salePrice = p.prod_discount_price ?? p.prod_sale_price;
      const profitPerUnit = salePrice - p.prod_purchase_cost;
      return acc + profitPerUnit * p.pod_selectedQty;
    }, 0);

    console.log(data);
    let formattedData = {
      shop_date: this.shopDate,
      shop_change: data.change,
      shop_payment: data.payment,
      shop_total: this.getTotalPrice(),
      shop_concept: shopConcept,
      total_earnings: totalEarnings,
      shop_products: this.selectedProducts.map((p) => ({
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
        shop_pro_price_unit: p.pro_price_unit,
        shop_prod_discount_price: p.prod_discount_price ?? 0,
      })),
    };

    console.log(formattedData);

    this.shoppingCartService.savePurchase(formattedData).then((res) => {
      console.log(res);
      this.shoppingCartService
        .updateMultipleProducts(this.selectedProductsUpdate)
        .then((res) => {
          this.selectedProducts = [];
          this.selectedProductsUpdate = [];
          this.showModal = false;
          this.deleteSearchTerm.emit('');
          this.getAllPorducts();
        });
    });
  }

  showModalPurchase() {
    if (this.getTotalPrice() > 0) this.showModal = true;
  }
}
