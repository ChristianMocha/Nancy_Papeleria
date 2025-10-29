import { Component, inject } from '@angular/core';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeComponent } from '../income/income.component';
import { BillsComponent } from "../bills/bills.component";

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, IncomeComponent, BillsComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  public selectedTab: string = 'ingresos';
  public totalEarnings: number = 0;
  public totalSales: number = 0;
  public billsAmount: number = 0;  
  public balanceAmount: number = 0;  

  public selectedDate: string = new Date().toISOString().substring(0, 10);
  public searchShopping: string = '';
  
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  totalEarningsEmit(data: any){
    this.totalEarnings = data
  }

  totalSalesEmit(data: any){
    this.totalSales = data
    this.calculateBalance();
  }

  billsAmountEmit(data: any){
    this.billsAmount = data;
    this.calculateBalance();
  }

  calculateBalance(){
    this.balanceAmount = this.totalSales - this.billsAmount
  }


}
