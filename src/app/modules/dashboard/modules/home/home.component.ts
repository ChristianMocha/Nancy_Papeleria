import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../../../../service/shopping-cart.service';
import { AuthService } from '../../../../service/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public router = inject(Router);
  public readonly shoppingCartService = inject(ShoppingCartService);
  public readonly authService = inject(AuthService);

  public open = false;
  public isOpenBills: boolean = false;
  private readonly fb = inject(FormBuilder);
  public formBills: FormGroup = this.fb.group({});
  public shopDate: string = '';
  public loading: boolean = false;

  ngOnInit() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.shopDate = now.toISOString().split('T')[0];

    this.formBills = this.fb.group({
      bills_date: [this.shopDate, Validators.required],
      bills_total: ['', Validators.required],
      bills_concept: ['', Validators.required],
      bills_total_earnings: [''],
      bills_change: [0],
      bills_payment: [0],

      is_active: [true, Validators.required],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
    });
  }
  goToPage(route: string) {
    this.router.navigate([route]);
  }

  openDrawer() {
    this.open = !this.open;
  }

  openDrawerNewBills() {
    this.isOpenBills = true;
  }

  closeDrawerNewBills() {
    this.isOpenBills = false;
  }

  submitBills() {
    this.loading = true;
    if (!this.formBills.valid) {
      this.loading = false;
      return;
    }

    this.formBills
      .get('bills_total_earnings')
      ?.setValue(this.formBills.get('bills_total')?.value);

    this.shoppingCartService.saveBills(this.formBills.value).then((res) => {
      this.formBills.reset({
        is_active: true,
        shop_date: this.shopDate,
        bills_date: this.shopDate,
      });
      this.closeDrawerNewBills();
      this.loading = false;
      this.router.navigate(['movements']);
    });
  }
}
