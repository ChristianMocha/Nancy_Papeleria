import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContentComponent } from './components/content/content.component';
import { NavBarComponent } from "../inventory/components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-winning-products',
  imports: [NavbarComponent, ContentComponent],
  templateUrl: './winning-products.component.html',
  styleUrl: './winning-products.component.scss'
})
export class WinningProductsComponent {

}
