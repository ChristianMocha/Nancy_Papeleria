import { Component, inject } from '@angular/core';
import { TableComponent } from './components/table/table.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, TableComponent, HeaderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {

  public openModal: boolean = false;
  public categoryName: string = '';
  private readonly formBuilder = inject(FormBuilder);
  public settingForm: FormGroup = this.formBuilder.group({});

  roles = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Usuario' },
  { id: 3, nombre: 'Invitado' },
  { id: 4, nombre: 'Editor' },
  { id: 5, nombre: 'Supervisor' },
];


  public employeeForm: FormGroup = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      rol: ['', Validators.required]
  });
  
  ngOnInit() {
  }


  emitModal(event: boolean){
    this.openModal = event
  }

  onClose(){
    this.openModal = false;
    }

  onSubmit(){

  }

  


}
