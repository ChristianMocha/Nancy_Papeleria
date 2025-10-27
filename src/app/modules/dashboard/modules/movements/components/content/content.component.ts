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
  

  ngOnInit() {
    this.getPurchasesByDate();
  }


  getPurchasesByDate() {
    this.shoppingCartService.getPurchasesByDate(this.selectedDate).then((res) => {
      console.log(res);
      this.lstPurchases = res
    });
  }

  filterByDate() {
    console.log(this.selectedDate);
    this.getPurchasesByDate()
  }

}
