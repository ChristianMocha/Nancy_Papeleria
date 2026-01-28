import { Component, inject, output } from '@angular/core';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeComponent } from '../income/income.component';
import { BillsComponent } from '../bills/bills.component';
import { DateService } from '../../../../../../service/date.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, IncomeComponent, BillsComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  public readonly dateService = inject(DateService);

  public selectedTab: string = 'ingresos';
  public totalEarnings: number = 0;
  public totalSales: number = 0;
  public billsAmount: number = 0;
  public balanceAmount: number = 0;

  public selectedDate: string = this.dateService.getDate();
  public searchShopping: string = '';
  public selectedRange: string = 'day';
  public inputType: string = 'date';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  totalEarningsEmit(data: any) {
    this.totalEarnings = data;
  }

  totalSalesEmit(data: any) {
    this.totalSales = data;
    this.calculateBalance();
  }

  billsAmountEmit(data: any) {
    this.billsAmount = data;
    this.calculateBalance();
  }

  calculateBalance() {
    this.balanceAmount = this.totalSales - this.billsAmount;
  }

  onRangeChange() {
    const now = new Date();

    switch (this.selectedRange) {
      case 'day':
        this.inputType = 'date';
        this.selectedDate = now.toISOString().split('T')[0];
        break;

      case 'week':
        this.inputType = 'week';
        const year = now.getFullYear();
        const week = this.getWeekNumber(now);
        this.selectedDate = `${year}-W${week.toString().padStart(2, '0')}`;
        break;

      case 'month':
        this.inputType = 'month';
        const month = now.toISOString().slice(0, 7);
        this.selectedDate = month;
        break;

      case 'year':
        this.inputType = 'number';
        this.selectedDate = now.getFullYear().toString();
        break;
    }

    setTimeout(() => {
      this.selectedTab = 'ingresos';
    });
  }

  onDateChange(){
    setTimeout(() => {
      this.selectedTab = 'ingresos';
    });
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
