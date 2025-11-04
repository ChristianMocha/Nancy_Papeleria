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

  public lstProducts: any;
  public searchTerm: any;
  public deleteSearchTermEmit: any;

  productsEmmit(data: any){
    this.lstProducts = data

  }
  searchTermEmmit(data: any){
    this.searchTerm = data

  }

  deleteSearchTerm(data: any){
    this.deleteSearchTermEmit = data;
  }

}
