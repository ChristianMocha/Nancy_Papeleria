import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';

@Component({
  selector: 'app-bills',
  imports: [CommonModule, FormsModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss'
})
export class BillsComponent {

public readonly shoppingCartService = inject(ShoppingCartService);

  public totalEarningsEmit = output<number>();
  public totalSalesEmit = output<number>();
  public selectedDate = input<string>( new Date().toISOString().substring(0, 10));


  public isLoading: boolean = false;

  public lstBills: any[] = [];
  public paginatedProducts: any[] = [];
  public totalSales: number = 0;
  public totalEarnings: number = 0;

  public itemsPerPage = 6;
  public currentPage = 1;
  public totalPages = 1;


  ngOnInit() {
    this.getBillsByDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate']) {
      this.getBillsByDate();
    }
  }



  getBillsByDate() {
    this.isLoading = true;
    this.shoppingCartService
      .getBillsByDate(this.selectedDate())
      .then((res) => {
        console.log(res);
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
      0
    );
    this.totalSalesEmit.emit(this.totalSales);
  }

  getTotalEarnings() {
    this.totalEarnings = this.lstBills.reduce(
      (acc, purchase) => acc + (purchase.total_earnings || 0),
      0
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

