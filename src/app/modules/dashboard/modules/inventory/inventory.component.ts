import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavBarComponent } from "./components/header/nav-bar/nav-bar.component";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {

  

}
