import { Component, inject } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SuppliersService } from '../../../../service/suppliers.service';
import { Supplier } from '../../../shared/models/supplier';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-suppliers',
  imports: [
    CommonModule,
    HeaderComponent,
    ContentComponent,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
})
export class SuppliersComponent {
  private readonly suppliersService = inject(SuppliersService);
  public readonly authService = inject(AuthService);

  private readonly formBuilder = inject(FormBuilder);
  public settingForm: FormGroup = this.formBuilder.group({});

  public openModal: boolean = false;
  public loading: boolean = false;

  public suppliersForm: FormGroup = this.formBuilder.group({
    supp_id: [''],
    supp_full_name: ['', Validators.required],
    supp_phone: ['', [Validators.required, Validators.pattern(/^09[0-9]{8}$/)]],
    supp_identification_document: [
      '',
      [Validators.required, Validators.pattern(/^(?:\d{10}|\d{13})$/)],
    ],
    supp_total_to_pay: [0],
    is_active: [true, Validators.required],
    created_by: [''],
    created_at: [''],
    updated_by: [''],
    updated_at: [''],
  });

  emitModal(event: boolean) {
    this.openModal = event;
  }

  onClose() {
    this.openModal = false;
    this.suppliersForm.reset({
      is_active: true,
      supp_total_to_pay: 0,
    });
  }

  onSubmit() {
    this.loading = true;
    try {
      if (!this.suppliersForm.valid) {
        this.suppliersForm.markAllAsTouched();
        this.loading = false;
        return;
      }

      if (this.suppliersForm.value.supp_id) {

        this.suppliersService
          .updateSupplier(
            this.suppliersForm.value.supp_id,
            this.suppliersForm.value
          )
          .then((res) => {
            this.openModal = false;
            this.loading = false;
            this.suppliersForm.reset({
              is_active: this.suppliersForm.value.is_active,
              supp_total_to_pay: 0,
            });
          });
      } else {
        this.suppliersService
          .addSupplier(this.suppliersForm.value)
          .then((res) => {
            this.openModal = false;
            this.loading = false;
            this.suppliersForm.reset({
              is_active: true,
              supp_total_to_pay: 0,
            });
          });
      }
    } catch (error) {
    }
  }

  supplierEmit(data: Supplier) {
    this.suppliersForm.patchValue(data);
    this.openModal = true;

  }
}
