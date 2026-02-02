import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../../../../../service/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public emitModal = output<any>();
  public authService = inject(AuthService);

  showModalCategories() {
    this.emitModal.emit(true);
  }
}
