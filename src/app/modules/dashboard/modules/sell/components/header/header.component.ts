import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public searchTermEmmit = output<any>();

  public searchTerm: string = '';


  filterProducts(){
    this.searchTermEmmit.emit(this.searchTerm);

  }

}
