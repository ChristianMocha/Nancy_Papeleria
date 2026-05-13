import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { AuthService } from '../../../../../../service/auth.service';

@Component({
  selector: 'app-modal-purchase',
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './modal-purchase.component.html',
  styleUrl: './modal-purchase.component.scss',
})
export class ModalPurchaseComponent {
  public readonly authService = inject(AuthService);

  public totalSale = input<number>(0);
  public loadingVenta = input<boolean>(false);
  public loadingVentaEmmit = output<boolean>();
  public close = output<any>();
  public confirmSale = output<any>();

  public customerPayment: any;
  public changeAmount: number = 0;
  public loading: boolean = false;
  public viewMasssageError: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loadingVenta']) {
      if (this.loadingVenta() === true) {
        this.loading = false;

        setTimeout(() => {
          this.handleClose();
          this.loadingVentaEmmit.emit(false);
        });
      }
    }
  }

  calculateChange() {
    this.changeAmount = Math.max(this.customerPayment - this.totalSale(), 0);
    if (
      this.customerPayment != null ||
      this.customerPayment >= 0.01 ||
      this.customerPayment >= this.totalSale()
    ) {
      this.viewMasssageError = false;
    }
    if (
      this.customerPayment == null ||
      this.customerPayment < 0.01 ||
      this.customerPayment < this.totalSale()
    ) {
      this.viewMasssageError = true;
    }
  }

  handleClose() {
    this.close.emit(true);
  }

  handleConfirm() {
    this.loading = true;
    if (
      this.customerPayment == null ||
      this.customerPayment < 0.01 ||
      this.customerPayment < this.totalSale()
    ) {
      this.loading = false;
      this.viewMasssageError = true;
      return;
    }

    this.confirmSale.emit({
      payment: this.customerPayment,
      change: this.changeAmount,
    });
    // this.loading = false;
    this.viewMasssageError = false;
    // this.handleClose();
  }
}
