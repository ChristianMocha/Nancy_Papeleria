import { Component } from '@angular/core';
import { ContentComponent } from "./components/content/content.component";
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-clients',
  imports: [ContentComponent, HeaderComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {

}
