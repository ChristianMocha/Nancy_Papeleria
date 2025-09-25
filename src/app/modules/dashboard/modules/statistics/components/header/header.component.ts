import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SalesComponent } from '../sales/sales.component';
import { BillsComponent } from '../bills/bills.component';
import { EmployeesComponent } from '../employees/employees.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, SalesComponent, BillsComponent, EmployeesComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
   tabs = ['Ventas', 'Gastos', 'Empleados'];
  activeTab = 'Ventas';

}
