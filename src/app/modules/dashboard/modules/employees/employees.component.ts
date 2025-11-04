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
import { Role } from '../../../shared/models/category copy';
import { DateService } from '../../../../service/date.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    TableComponent,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent
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
    emp_name: ['', [Validators.required]],
    emp_email: ['', [Validators.required, Validators.email]],
    emp_password: ['', [Validators.required, Validators.minLength(6)]],
    emp_role: ['', Validators.required],
    emp_status: [true],
    emp_id: [''],
    emp_start_date: [''],
  });


  ngOnInit() {}

  emitModal(event: boolean) {
    this.openModal = event;
  }

  onClose() {
    this.openModal = false;
  }

  // async onSubmit() {
  //   console.log(this.employeeForm.value);

  //   const docRef = await this.employeeService.addEmployee(
  //     this.employeeForm.value
  //   );
  //   console.log(docRef);
  // }

  async onSubmit() {
    this.loading = true;
    try {
      console.log(this.employeeForm.value);
      if (!this.employeeForm.valid) {
        this.employeeForm.markAllAsTouched();
        console.log('Ingrese todos los campos');
        return;
      }
     const res = await this.authService.registerUser(this.employeeForm.value);
     console.log(res);
     if (res) {
      this.employeeForm.get('emp_id')?.setValue(res);
      console.log(this.dateService.getDate());
      this.employeeForm.get('emp_start_date')?.setValue(this.dateService.getDate());
      delete this.employeeForm.value.emp_password;
      console.log(this.employeeForm.value);
      this.employeeService.addEmployee(this.employeeForm.value).then((res) => {
        this.openModal = false;
        this.loading = false;
        this.employeeForm.reset();
      })
      
     }
      // alert('Usuario creado correctamente');
     
    } catch (err) {
      this.loading = false;
      console.error(err);
      // alert('Error al crear usuario');
    }
  }
}
