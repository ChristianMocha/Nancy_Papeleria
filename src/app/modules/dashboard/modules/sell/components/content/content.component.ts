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
  public openCartMobile = false;

  ngOnInit() {
    this.shopDate = this.dateService.getDate();
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
        this.categoryService.getCategories(),
      );
    } catch (error) {}
  }

  selectCategory(categoryId: any) {
    this.selectedCategory = categoryId;
    if (categoryId === 'all') {
      this.showButtonMore = false;
      this.getAllPorducts();
      return;
    }
    this.productService.getProductsByCategory(categoryId).subscribe((res) => {
      this.showButtonMore = true;
      this.filteredProducts = res;
    });
  }

  async getAllPorducts(nextPage: boolean = false) {
    this.loading = true;
    this.lstProducts = await this.productService.getProductsPaginated(
      10,
      nextPage,
    );

    if (nextPage) {
      this.filteredProducts = [...this.filteredProducts, ...this.lstProducts];
    } else {
      this.filteredProducts = this.lstProducts;
    }

    this.loading = false;
  }
  async nextPage() {
    await this.getAllPorducts(true);
  }

  newProduct() {
    this.router.navigate(['product/add']);
  }

  async filterProducts() {
    if (!this.searchTerm()) {
      this.filteredProducts = [...this.lstProducts];
      this.syncStockWithCart();
      return;
    }
    if (
      this.lstProductsSearch() !== undefined &&
      this.lstProductsSearch() !== null
    ) {
      this.filteredProducts = await this.lstProductsSearch();
    }

    this.syncStockWithCart();
  }

  addToSelection(product: any) {
    if (product.prod_quantity_available <= 0) return;
    if (product.prod_sold_pount == null || isNaN(product.prod_sold_pount)) {
      product.prod_sold_pount = 0;
    }

    product.prod_quantity_available--;

    const existing = this.selectedProducts.find(
      (p) => p.prod_code === product.prod_code,
    );

    if (existing) {
      existing.pod_selectedQty += 1;
      this.updatePrice(existing);
    } else {
      product.pod_selectedQty = 1;
      product.pro_price_unit =
        product.prod_discount_price ?? product.prod_sale_price;

      this.selectedProducts.push(product);
    }

    product.prod_sold_pount += 1;

    const existingUpdate = this.selectedProductsUpdate.find(
      (p) => p.prod_code === product.prod_code,
    );

    if (existingUpdate) {
      existingUpdate.prod_quantity_available = product.prod_quantity_available;
    } else {
      this.selectedProductsUpdate.push(product);
    }
  }

  increaseQty(item: any) {
    if (item.prod_quantity_available > 0) {
      item.pod_selectedQty++;
      item.prod_quantity_available--;

      item.prod_sold_pount += 1;

      this.updatePrice(item);

      this.updateProductStock(item.prod_code, item.prod_quantity_available);
    }
  }

  decreaseQty(item: any) {
    if (item.pod_selectedQty > 1) {
      item.pod_selectedQty--;
      item.prod_quantity_available++;

      item.prod_sold_pount -= 1;
      this.updatePrice(item);

      this.updateProductStock(item.prod_code, item.prod_quantity_available);
    }
  }

  removeProduct(item: any) {
    item.prod_quantity_available += item.pod_selectedQty;
    item.prod_sold_pount -= item.pod_selectedQty;
    this.selectedProducts = this.selectedProducts.filter(
      (p) => p.prod_code !== item.prod_code,
    );

    this.updateProductStock(item.prod_code, item.prod_quantity_available);
  }

  onDiscountChange(item: any) {
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
    removeFromUpdate: boolean = false,
  ) {
    const productInList = this.lstProducts.find(
      (p) => p.prod_code === prodCode,
    );
    if (productInList) {
      productInList.prod_quantity_available = newQty;
    }

    const productInFiltered = this.filteredProducts.find(
      (p) => p.prod_code === prodCode,
    );
    if (productInFiltered) {
      productInFiltered.prod_quantity_available = newQty;
    }

    const productInUpdate = this.selectedProductsUpdate.find(
      (p) => p.prod_code === prodCode,
    );

    if (removeFromUpdate) {
      this.selectedProductsUpdate = this.selectedProductsUpdate.filter(
        (p) => p.prod_code !== prodCode,
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
      0,
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
            (p) => p.prod_code === item.prod_code,
          );
          if (productInList) {
            productInList.prod_quantity_available += item.pod_selectedQty;
          }

          const productInFiltered = this.filteredProducts.find(
            (p) => p.prod_code === item.prod_code,
          );
          if (productInFiltered) {
            productInFiltered.prod_quantity_available += item.pod_selectedQty;
          }

          const productInUpdate = this.selectedProductsUpdate.find(
            (p) => p.prod_code === item.prod_code,
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

    this.shoppingCartService.savePurchase(formattedData).then((res) => {
      this.shoppingCartService
        .updateMultipleProducts(this.selectedProductsUpdate)
        .then((res) => {
          this.selectedProducts = [];
          this.selectedProductsUpdate = [];
          this.showModal = false;
          this.deleteSearchTerm.emit('');
          this.getAllPorducts();
        });

      Swal.fire({
        title: '¿Desea imprimir Recibo?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.printFactura(formattedData);
        }
      });
    });
  }

  showModalPurchase() {
    if (this.getTotalPrice() > 0) this.showModal = true;
  }

  printFactura(ser: any) {
    const rows = ser.shop_products
      .map(
        (prod: any) => `
    <tr>
      <td>
        ${prod.shop_pod_selectedQty} <br>
        ${prod.shop_prod_code}
      </td>

      <td>${prod.shop_prod_name}</td>

      <td class="right">
        ${
          prod.shop_prod_discount_price > 0
            ? prod.shop_prod_discount_price
            : prod.shop_prod_sale_price
        }
      </td>

      <td class="right">
        ${(
          (prod.shop_prod_discount_price > 0
            ? prod.shop_prod_discount_price
            : prod.shop_prod_sale_price) * prod.shop_pod_selectedQty
        ).toFixed(2)}
      </td>
    </tr>
  `,
      )
      .join('');

    const html = `
  <html>
    <head>
      <title>Factura</title>
      <style>
        body {
          font-family: Arial;
          font-size: 13px;
          padding: 10px;
        }
        h2, h3 { text-align: center; margin: 5px 0; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { padding: 4px; border-bottom: 1px dashed #999; }
        .right { text-align: right; }
        .totals td { border-bottom: none; }
        .footer {
          margin-top: 25px;
          text-align: center;
          font-size: 12px;
          border-top: 1px dashed #999;
          padding-top: 10px;
        }
      </style>
    </head>

    <body>

      <h3>Nancy</h3>
      <div class="left">Tel: 0992522312</div>
      <div class="left">Dirección: Av. Ricardo Duran</div>

      <br>

      <div><span class="bold">Fecha emisión:</span> ${this.formatFechaCompleta(
        ser.shop_date,
      )}</div>


      <br>

      <table>
        <thead>
          <tr>
            <th>Cant<br>Código</th>
            <th>Producto</th>
            <th class="right">P.Unit</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <br>

      <table class="totals">
        <tr>
          <td class="right bold">TOTAL:</td>
          <td class="right bold">$${Number(ser.shop_total).toFixed(2)}</td>
        </tr>
      </table>

      <div class="footer">
        Gracias por su compra.<br>
        *Guarde este comprobante para cualquier reclamo*
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>

    </body>
  </html>
  `;

    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  }

  formatFechaCompleta(fecha: string): string {
    const ahora = new Date();
    const partes = fecha.split('-');

    const f = new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2]),
      ahora.getHours(),
      ahora.getMinutes(),
      ahora.getSeconds(),
    );

    return f.toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  syncStockWithCart() {
    this.filteredProducts.forEach((prod) => {
      const cartItem = this.selectedProducts.find(
        (p) => p.prod_code === prod.prod_code,
      );
      if (cartItem) {
        prod.prod_quantity_available =
          prod.prod_quantity_available - cartItem.pod_selectedQty;

        if (prod.prod_quantity_available < 0) {
          prod.prod_quantity_available = 0;
        }
      }
    });
  }

  goToAddCategory() {
    this.router.navigate(['/categories/new']);
  }

  increaseMobile(acc: any) {
    if (acc.prod_quantity_available <= 0) return;

    if (!acc.pod_selectedQty) {
      acc.pod_selectedQty = 0;
    }

    acc.pod_selectedQty += 1;
    acc.prod_quantity_available -= 1;

    this.syncCart(acc);
  }
  decreaseMobile(acc: any) {
    if (!acc.pod_selectedQty || acc.pod_selectedQty <= 0) return;

    acc.pod_selectedQty -= 1;
    acc.prod_quantity_available += 1;

    if (acc.pod_selectedQty === 0) {
      acc.pod_selectedQty = 0;
    }

    this.syncCart(acc);
  }
  syncCart(acc: any) {
    const item = this.selectedProducts.find((p) => p.prod_id === acc.prod_id);

    if (acc.pod_selectedQty > 0) {
      if (item) {
        item.pod_selectedQty = acc.pod_selectedQty;
      } else {
        this.selectedProducts.push({ ...acc });
      }
    } else {
      this.selectedProducts = this.selectedProducts.filter(
        (p) => p.prod_id !== acc.prod_id,
      );
    }
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  openCart() {
    if (this.isMobile()) {
      this.openCartMobile = true;
    } else {
      this.showModalPurchase();
    }
  }
}
