import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
 getDate(): string {
  const now = new Date();

  // Ajustar a Ecuador UTC-5
  const ecuOffset = -5;
  const localOffset = now.getTimezoneOffset() / 60;
  now.setHours(now.getHours() + ecuOffset - localOffset);

  // Formato de fecha en español
  const formatter = new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'medium',
    hour12: true,
    timeZone: 'UTC'
  });

  const formatted = formatter.format(now);

  return `${formatted} UTC-5`;
}

}
