import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ServicesComponent } from './components/services/services.component';
import { HeaderComponent } from './components/header/header.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import { DateService } from '../../../../service/date.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PatternLockComponent } from '../../../shared/components/pattern-lock/pattern-lock.component';
import { TechnicalServiceService } from '../../../../service/technical-service.service';

@Component({
  selector: 'app-technical-service',
  imports: [
    CommonModule,
    ServicesComponent,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PatternLockComponent,
  ],
  templateUrl: './technical-service.component.html',
  styleUrl: './technical-service.component.scss',
})
export class TechnicalServiceComponent {
  public authService = inject(AuthService);
  private readonly technicalServiceService = inject(TechnicalServiceService);
  private readonly dateService = inject(DateService);

  private readonly formBuilder = inject(FormBuilder);

  public openModal: boolean = false;
  public loading: boolean = false;
  public settingForm: FormGroup = this.formBuilder.group({});

  public password: any[] = [
    { name: 'código', code: 1 },
    { name: 'patrón', code: 2 },
    { name: 'sin contraseña', code: 3 },
  ];

  public serviceForm: FormGroup = this.formBuilder.group({
    ser_description: ['', [Validators.required]],
    ser_name: ['', [Validators.required]],
    ser_phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    ser_price: ['', [Validators.required]],
    ser_password: [this.password[3], [Validators.required]],
    ser_password_code: [''],
    ser_pattern: [''],
    ser_status: [true],
    ser_id: [''],
    ser_start_date: [''],
    ser_maximum_withdrawal_date: [''],
    ser_team_state: [true],
  });

  ngOnInit() {}

  emitModal(event: boolean) {
    this.openModal = event;
  }

  onClose() {
    this.openModal = false;
    this.serviceForm.reset();
  }

  async onSubmit() {
    this.loading = true;
    try {
      console.log(this.serviceForm.value);
      if (!this.serviceForm.valid) {
        this.serviceForm.markAllAsTouched();
        console.log('Ingrese todos los campos');
        return;
      }
      console.log(this.dateService.getDate());
      this.serviceForm
        .get('ser_start_date')
        ?.setValue(this.dateService.getDate());

      const startDate = this.serviceForm.get('ser_start_date')?.value;

      // Convertirla a Date
      const dateObj = new Date(startDate);

      // Sumar 3 meses
      dateObj.setMonth(dateObj.getMonth() + 3);

      // Pasar a formato YYYY-MM-DD para el input type="date"
      const maxDate = dateObj.toISOString().slice(0, 10);

      // Setear en el formulario
      this.serviceForm.get('ser_maximum_withdrawal_date')?.setValue(maxDate);

      console.log(this.serviceForm.value);
      this.technicalServiceService
        .addService(this.serviceForm.value)
        .then((res) => {
          this.openModal = false;
          this.loading = false;
          this.serviceForm.reset();
        });
    } catch (err) {
      this.loading = false;
      console.error(err);
      // alert('Error al crear usuario');
    }
  }

  onPattern(arr: number[]) {
    this.serviceForm.get('ser_pattern')?.setValue(arr.join('-'));
  }

  service(data: any) {
    this.openModal = true;

    this.serviceForm.patchValue({
      ...data,
      ser_team_state: data.ser_team_state ?? true,
    });
  }
}
