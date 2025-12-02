import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../../../../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

    public authService = inject(AuthService);
    public emitModal = output<any>();

  onCrearCliente(){
    this.emitModal.emit(true);
    
  }

}
