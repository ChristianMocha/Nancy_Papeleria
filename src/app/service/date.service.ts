import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  getDate(): string {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'long',
      timeStyle: 'medium',
      hour12: true,
      timeZone: 'America/Guayaquil', // zona horaria correcta de Ecuador
    });

    return formatter.format(now) + ' UTC-5';
  }
  getDateTimeStamp(): Date {
    return new Date();
  }
}
