import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from "./components/content/content.component";

@Component({
  selector: 'app-sell',
  imports: [HeaderComponent, ContentComponent],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss'
})
export class SellComponent {

  public searchTerm: string = '';

  searchTermEmmit(data: string){
    this.searchTerm = data

  }

}
