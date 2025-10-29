import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShoppingCartService } from '../../../../../../service/shopping-cart.service';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {


  private readonly fb = inject(FormBuilder);
  public form: FormGroup = this.fb.group({});

  public readonly shoppingCartService = inject(ShoppingCartService);

  public searchTermEmmit = output<any>();

  public searchTerm: string = '';

  public isOpen: boolean = false;
  public loading: boolean = false;

  public changeAmount: number = 0;

  ngOnInit() {
    this.form = this.fb.group({
      shop_date: [new Date().toISOString().split('T')[0], Validators.required],
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
  }

  filterProducts(){
    this.searchTermEmmit.emit(this.searchTerm);

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

}
