import { Component, inject } from '@angular/core';
import { EmployeeService } from '../../../../../../service/employee.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  private readonly employeeService = inject(EmployeeService);

  ngOnInit() {
    this.getEmployees();
  }


  async getEmployees() {
    console.log('entrano el metodo de traer empleados');
    this.employeeService.getEmployees().subscribe(
      (res) => {
        console.log(res);
        
      }
    )
}

}
