import { Component, inject } from '@angular/core';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  public readonly shoppingCartService = inject(ShoppingCartService);

  public selectedDate: string = new Date().toISOString().substring(0, 10);

  public lstPurchases: any[] = [];

  public searchShopping: string = '';
  public totalSales: number = 0;
  public totalEarnings: number = 0;

  public isLoading: boolean = false;
  

  ngOnInit() {
    this.getPurchasesByDate();
  }


  getPurchasesByDate() {
    this.isLoading = true;
    this.shoppingCartService.getPurchasesByDate(this.selectedDate).then((res) => {
      console.log(res);
      this.lstPurchases = res
      this.getTotalPrice();
      this.getTotalEarnings();
      this.isLoading = false;
    });
  }

  filterByDate() {
    console.log(this.selectedDate);
    this.getPurchasesByDate()
  }

  getTotalPrice() {
    this.totalSales =  this.lstPurchases.reduce((acc, purchase) => acc + (purchase.shop_total || 0), 0);
  }

  getTotalEarnings() {
    this.totalEarnings =  this.lstPurchases.reduce((acc, purchase) => acc + (purchase.total_earnings || 0), 0);
  }


}
