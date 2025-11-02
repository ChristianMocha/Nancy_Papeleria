import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';

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
  public inputType = input<any>();

  public inputTypeIn: any;

  public isLoading: boolean = false;

  public lstPurchases: any[] = [];
  public paginatedProducts: any[] = [];
  public totalSales: number = 0;
  public totalEarnings: number = 0;
  public billsAmount: number = 0;

  public itemsPerPage = 6;
  public currentPage = 1;
  public totalPages = 1;

  ngOnInit() {
    console.log(this.inputType());
    this.inputTypeIn = this.inputType();
    if (this.inputType() === 'date') {
           console.log('entrando 1');
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
            console.log('entrando 2');
      this.inputTypeIn = 'year';
    }
    this.getPurchasesByDate();
    this.getTotalBillsAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputTypeIn = this.inputType();
     console.log(this.inputType());
    if (this.inputType() === 'date') {
      console.log('entrando 1');
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
      console.log('entrando 2');
      this.inputTypeIn = 'year';
    }

    if (changes['selectedDate']) {
      this.getPurchasesByDate();
      this.getTotalBillsAmount();
    }
  }

  getPurchasesByDate() {
    console.log(this.inputTypeIn);
    this.isLoading = true;
    this.shoppingCartService
      .getData(this.selectedDate(), this.inputTypeIn)
      .then((res) => {
        console.log(res);
        this.lstPurchases = res;
        this.getTotalPrice();
        this.getTotalEarnings();
        this.isLoading = false;
        this.updatePagination();
      });
  }

  getTotalBillsAmount() {
    console.log('entrando ');
    this.isLoading = true;
    this.shoppingCartService
      .getTotalBillsAmount(this.selectedDate())
      .then((res) => {
        console.log(res);
        this.billsAmount = res;
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
}
