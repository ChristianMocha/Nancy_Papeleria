import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  showAlert(title: string, icon: SweetAlertIcon = 'success') {
    Swal.fire({
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 1500,
    });
  }
}
