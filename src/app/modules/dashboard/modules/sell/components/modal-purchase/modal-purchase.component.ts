import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { AuthService } from '../../../../../../service/auth.service';

@Component({
  selector: 'app-modal-purchase',
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './modal-purchase.component.html',
  styleUrl: './modal-purchase.component.scss'
})
export class ModalPurchaseComponent {
      public readonly authService = inject(AuthService);

  public totalSale = input<number>(0);
  public close = output<any>();
  public confirmSale = output<any>();

  public customerPayment: any;
  public changeAmount: number = 0;
  public loading: boolean = false;

  calculateChange() {
    this.changeAmount = Math.max(this.customerPayment - this.totalSale(), 0);
  }

  handleClose() {
    this.close.emit(true);
  }

  handleConfirm() {
    this.loading = true;
    if(this.customerPayment < 0 || this.customerPayment < this.totalSale() ) {
      this.loading = false;
      return;
    };

    this.confirmSale.emit({
      payment: this.customerPayment,
      change: this.changeAmount
    });
  }

}
