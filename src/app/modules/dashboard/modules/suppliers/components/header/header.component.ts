import { Component, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public emitModal = output<any>();
  onCreateSuppliers() {
    this.emitModal.emit(true);
  }
}
