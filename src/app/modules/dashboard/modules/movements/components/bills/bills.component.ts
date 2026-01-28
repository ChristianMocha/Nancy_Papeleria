import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { DateService } from '../../../../../../service/date.service';

@Component({
  selector: 'app-bills',
  imports: [CommonModule, FormsModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss',
})
export class BillsComponent {
  public readonly shoppingCartService = inject(ShoppingCartService);

  public totalEarningsEmit = output<number>();
  public totalSalesEmit = output<number>();
  public selectedDate = input<string>(
    new Date().toISOString().substring(0, 10),
  );
  public inputType = input<any>();

  public isLoading: boolean = false;

  public lstBills: any[] = [];
  public paginatedProducts: any[] = [];
  public totalSales: number = 0;
  public totalEarnings: number = 0;
  public inputTypeIn: any;

  public itemsPerPage = 10;
  public currentPage = 1;
  public totalPages = 1;

  ngOnInit() {
    this.inputTypeIn = this.inputType();
    if (this.inputType() === 'date') {
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
      this.inputTypeIn = 'year';
    }

    this.getBillsByDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputTypeIn = this.inputType();
    if (this.inputType() === 'date') {
      this.inputTypeIn = 'day';
    }

    if (this.inputType() === 'number') {
      this.inputTypeIn = 'year';
    }
    if (changes['selectedDate']) {
      this.getBillsByDate();
    }
  }

  getBillsByDate() {
    this.isLoading = true;
    this.shoppingCartService
      .getBillsByRange(this.inputTypeIn, this.selectedDate())
      .then((res) => {
        this.lstBills = res;

        this.getTotalPrice();
        this.getTotalEarnings();
        this.isLoading = false;
        this.updatePagination();
      });
  }

  getTotalPrice() {
    this.totalSales = this.lstBills.reduce(
      (acc, purchase) => acc + (purchase.shop_total || 0),
      0,
    );
    this.totalSalesEmit.emit(this.totalSales);
  }

  getTotalEarnings() {
    this.totalEarnings = this.lstBills.reduce(
      (acc, purchase) => acc + (purchase.total_earnings || 0),
      0,
    );
    this.totalEarningsEmit.emit(this.totalEarnings);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.lstBills.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.lstBills.slice(start, end);
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
