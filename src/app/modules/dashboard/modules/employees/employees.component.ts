import { Component, inject } from '@angular/core';
import { TableComponent } from './components/table/table.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmployeeService } from '../../../../service/employee.service';
import { AuthService } from '../../../../service/auth.service';
import { Role } from '../../../shared/models/role';
import { DateService } from '../../../../service/date.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    TableComponent,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent {
  public authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly dateService = inject(DateService);

  private readonly formBuilder = inject(FormBuilder);

  public openModal: boolean = false;
  public loading: boolean = false;
  public categoryName: string = '';
  public settingForm: FormGroup = this.formBuilder.group({});

  public roles: Role[] = [
    { id: 'admin', nombre: 'Administrador' },
    { id: 'employee', nombre: 'Empleado' },
    { id: 'public', nombre: 'Público' },
  ];

  public employeeForm: FormGroup = this.formBuilder.group({
    emp_id: [''],
    emp_uid: [''],
    emp_name: ['', [Validators.required]],
    emp_email: ['', [Validators.required, Validators.email]],
    emp_password: ['', [Validators.required, Validators.minLength(6)]],
    emp_role: ['', Validators.required],
    is_active: [true, Validators.required],
    created_by: [''],
    created_at: [''],
    updated_by: [''],
    updated_at: [''],
  });

  ngOnInit() {
  }

  emitModal(event: boolean) {
    this.openModal = event;
  }

  onClose() {
    this.openModal = false;
    this.employeeForm.reset({
      is_active: true,
    });
  }

  // async onSubmit() {

  //   const docRef = await this.employeeService.addEmployee(
  //     this.employeeForm.value
  //   );
  // }

  async onSubmit() {
    this.loading = true;
    try {
      if (!this.employeeForm.valid) {
        this.employeeForm.markAllAsTouched();
        return;
      }
      const res = await this.authService.registerUserWithoutLoggingOut(this.employeeForm.value);
      if (res) {
        this.employeeForm.get('emp_uid')?.setValue(res);
        delete this.employeeForm.value.emp_password;
        this.employeeService
          .addEmployee(this.employeeForm.value)
          .then((res) => {
            this.openModal = false;
            this.loading = false;
            this.employeeForm.reset({
              is_active: true,
            });
          });
      }
      // alert('Usuario creado correctamente');
    } catch (err) {
      this.loading = false;

      const error = err as { code?: string };

      if (error.code === 'auth/email-already-in-use') {
        return;
      }

      console.error(err);
    }
  }
}
