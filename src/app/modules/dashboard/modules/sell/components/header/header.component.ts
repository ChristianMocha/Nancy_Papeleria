import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { ProductService } from '../../../../../../service/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public readonly productService = inject(ProductService);


  private readonly fb = inject(FormBuilder);
  public form: FormGroup = this.fb.group({});
  public formBills: FormGroup = this.fb.group({});

  public readonly shoppingCartService = inject(ShoppingCartService);

  public searchTermEmmit = output<any>();
  public productsEmmit = output<any>();
  public deleteSearchTermEmit = input<any>();

  public searchTerm: string = '';

  public isOpen: boolean = false;
  public isOpenBills: boolean = false;
  public loading: boolean = false;

  public changeAmount: number = 0;
  public shopDate: string = '';

  ngOnInit() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    this.shopDate = now.toISOString().slice(0, 16);

    this.form = this.fb.group({
      shop_date: [this.shopDate, Validators.required],
      shop_total: ['', Validators.required],
      shop_concept: ['', Validators.required],
      total_earnings: ['',],
      shop_change: [''],
      shop_payment: ['', Validators.required],
    });

    this.form.valueChanges.subscribe(val => {
      const total = Number(val.shop_total) || 0;
      const payment = Number(val.shop_payment) || 0;
      const change = payment - total;
  
      this.form.patchValue({ shop_change: change > 0 ? change : 0 }, { emitEvent: false });
    });

    this.formBills = this.fb.group({
      bills_date: [this.shopDate, Validators.required],
      bills_total: ['', Validators.required],
      bills_concept: ['', Validators.required],
      bills_total_earnings: ['',],
      bills_change: [0],
      bills_payment: [0],
    });

    this.formBills.valueChanges.subscribe(val => {
      const total = Number(val.bills_total) || 0;
      const payment = Number(val.bills_payment) || 0;
      const change = payment - total;
  
      this.formBills.patchValue({ bills_change: change > 0 ? change : 0 }, { emitEvent: false });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.searchTerm = '';
    
  }

  filterProducts(){
    this.searchTermEmmit.emit(this.searchTerm);
    this.getSearchProducts();

  }

  openDrawer() {
    this.isOpen = true;
  }

  closeDrawer() {
    this.isOpen = false;
  }

  submit() {
    this.loading = true;
    console.log(this.form.value);
    if (!this.form.valid) {
      console.log('Ingrese todos los campos');
      return; 
    }

    this.form.get('total_earnings')?.setValue(this.form.get('shop_total')?.value);

    console.log(this.form.value);
    // shop_crea_date
    this.shoppingCartService.savePurchase(this.form.value).then((res) => {
      console.log(res);
       this.form.reset();
      this.closeDrawer();
      this.loading = false;
    });
  }

  submitBills() {
    this.loading = true;
    console.log(this.formBills.value);
    if (!this.formBills.valid) {
      console.log('Ingrese todos los campos bills');
      return; 
    }

    this.formBills.get('bills_total_earnings')?.setValue(this.formBills.get('bills_total')?.value);

    console.log(this.formBills.value);
    this.shoppingCartService.saveBills(this.formBills.value).then((res) => {
      console.log(res);
       this.formBills.reset();
      this.closeDrawerNewBills();
      this.loading = false;
    });
  }

  openDrawerNewBills() {
    this.isOpenBills = true;
  }

  closeDrawerNewBills(){
    this.isOpenBills = false;
  }

  getSearchProducts(){
    console.log(this.searchTerm);
    if (this.searchTerm.length < 3 && this.searchTerm.length > 0) return;
    this.productService.searchProducts(this.searchTerm).then((res) => {
      console.log(res);
      this.productsEmmit.emit(res);
    })
  }



}
