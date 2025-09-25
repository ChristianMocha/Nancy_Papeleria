import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  totalClientes = 0;
  totalPorCobrar = 0;

  // Input buscador
  filtro = '';

  // Lista de clientes
  clientes: any[] = [
    {
      nombre: 'Laura Jimena Rojas',
      celular: '3116548723',
      documento: '1025364789',
      totalPorCobrar: 0,
    },
    {
      nombre: 'Andrés Felipe Ramírez',
      celular: '3009874521',
      documento: '1148963215',
      totalPorCobrar: 58400,
    },
  ];

  get clientesFiltrados(): any[] {
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  constructor() {
    this.calcularResumen();
  }

  calcularResumen() {
    this.totalClientes = this.clientes.length;
    this.totalPorCobrar = this.clientes.reduce(
      (acc, c) => acc + c.totalPorCobrar,
      0
    );
  }

}
