import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-income',
  imports: [CommonModule, FormsModule],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss',
})
export class IncomeComponent {
  public readonly shoppingCartService = inject(ShoppingCartService);

  public totalEarningsEmit = output<number>();
  public totalSalesEmit = output<number>();
  public billsAmountEmit = output<number>();
  public selectedDate = input<string>(
    new Date().toISOString().substring(0, 10)
  );
  public router = inject(Router);
  public inputType = input<any>();
  public searchShopping = input<any>();

  public inputTypeIn: any;

  public isLoading: boolean = false;

  public lstPurchases: any[] = [];
  public paginatedProducts: any[] = [];
  private allPurchases: any[] = [];
  public totalSales: number = 0;
  public totalEarnings: number = 0;
  public billsAmount: number = 0;

  public itemsPerPage = 10;
  public currentPage = 1;
  public totalPages = 1;

  ngOnInit() {
    this.currentPage = 1;
    this.inputTypeIn = this.inputType();
    if (this.inputType() === 'date') {
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
      this.inputTypeIn = 'year';
    }
    this.getPurchasesByDate();
    this.getTotalBillsAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.currentPage = 1;
    this.inputTypeIn = this.inputType();
    if (this.inputType() === 'date') {
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
      this.inputTypeIn = 'year';
    }

    if (changes['selectedDate']) {
      this.getPurchasesByDate();
      this.getTotalBillsAmount();
    }

    this.onSearchChange();
  }

  getPurchasesByDate() {
    this.isLoading = true;
    this.lstPurchases = [];
    this.shoppingCartService
      .getData(this.selectedDate(), this.inputTypeIn)
      .then((res) => {
        res = res.map((p: any) => ({
          ...p,
          shop_crea_date: this.convertToDate(p.shop_crea_date),
        }));
        this.lstPurchases = res;
        this.allPurchases = res;
        this.getTotalPrice();
        this.getTotalEarnings();
        this.isLoading = false;
        this.updatePagination();
      });
  }

  getTotalBillsAmount() {
    console.log(this.inputTypeIn);
    this.isLoading = true;
    this.shoppingCartService
      .getTotalBillsAmount(this.selectedDate(), this.inputTypeIn)
      .then((res) => {
        this.billsAmount = res;
        console.log(this.billsAmount);
        this.billsAmountEmit.emit(this.billsAmount);
      });
  }

  getTotalPrice() {
    this.totalSales = this.lstPurchases.reduce(
      (acc, purchase) => acc + (purchase.shop_total || 0),
      0
    );
    this.totalSalesEmit.emit(this.totalSales);
  }

  getTotalEarnings() {
    this.totalEarnings = this.lstPurchases.reduce(
      (acc, purchase) => acc + (purchase.total_earnings || 0),
      0
    );
    this.totalEarningsEmit.emit(this.totalEarnings);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.lstPurchases.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.lstPurchases.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onSearchChange() {
    const term = this.searchShopping()?.toString().toLowerCase() || '';

    if (term.trim().length === 0) {
      this.lstPurchases = [...this.allPurchases];
      this.updatePagination();
      return;
    }

    const filtered = this.allPurchases.filter(
      (purchase) =>
        purchase.shop_concept?.toLowerCase().includes(term) ||
        purchase.shop_total?.toString().includes(term)
    );

    this.lstPurchases = filtered;
    this.updatePagination();
  }

  convertToDate(value: any): Date | null {
    if (!value) return null;

    // Caso 1: Timestamp (Firebase)
    if (value.toDate) {
      try {
        return value.toDate();
      } catch {
        return null;
      }
    }

    // Caso 2: Fecha en formato YYYY-MM-DD => parse manual
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day); // 👈 crea fecha local sin UTC
    }

    // Caso 3: Otros formatos
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  printFactura(ser: any) {
    const rows = ser.shop_products
      .map(
        (prod: any) => `
      <tr>
        <td>
          ${prod.shop_pod_selectedQty}<br>
        </td>
        <td>${prod.shop_prod_name}</td>
        <td class="col-unit">
          ${
            prod.shop_prod_discount_price > 0
              ? prod.shop_prod_discount_price
              : prod.shop_prod_sale_price
          } 
        </td>
        
        <td class="col-total">
          ${(
            (prod.shop_prod_discount_price > 0
              ? prod.shop_prod_discount_price
              : prod.shop_prod_sale_price) * prod.shop_pod_selectedQty
          ).toFixed(2)}
        </td>

      </tr>
    `
      )
      .join('');

    const html = `
  <html>
  <head>
    <title>Factura</title>

    <style>

      /* ELIMINA LA FECHA, ENCABEZADOS Y MÁRGENES */
      @page {
        size: 58mm auto;
        margin: 0;
      }

      body {
        font-family: Arial;
        font-size: 12px;
        padding: 6px;
        width: 58mm;
      }

      h3 { text-align: center; margin: 5px 0; }

      table { width: 100%; border-collapse: collapse; }
      td, th { padding: 3px 0; border-bottom: 1px dashed #888; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .footer {
        margin-top: 10px;
        text-align: center;
        font-size: 11px;
      }
        .col-unit {
        width: 25%;
        text-align: right;
        padding-right: 6px;
      }
      
      .col-total {
        width: 25%;
        text-align: right;
      }


    </style>
  </head>

  <body>

    <h3>CRTECNOLOGIA</h3>
    <div>Tel: 0983922706</div>
    <div>Dirección: Av. Ricardo Duran - Cuatro Esquinas</div>

    <br>

    <div><span class="bold">Fecha emisión:</span> ${this.formatFechaCompleta(
      ser.shop_date
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

    <table>
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
      window.onload = () => window.print();
    </script>

  </body>
  </html>
  `;

    // ❗ Usa una ventana especial “_print” para evitar about:blank
    const win = window.open('', '_blank', 'width=400,height=600');

    if (win) {
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
      ahora.getSeconds()
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

  goToPage(route: string) {
    this.router.navigate([route]);
  }
}
