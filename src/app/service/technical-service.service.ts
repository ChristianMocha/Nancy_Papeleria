import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DateService } from './date.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TechnicalServiceService {
  private readonly dateService = inject(DateService);
  private readonly authService = inject(AuthService);
  public firestore = inject(Firestore);

  private collectionName = 'technical_service';

  addService(service: any) {
    service.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    service.created_by = this.authService.getUserLocalStorage();
    const serviceRef = doc(collection(this.firestore, this.collectionName));
    service.ser_id = serviceRef.id;
    return setDoc(serviceRef, service);
  }

  updateService(id: string, data: Partial<any>) {
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    data['updated_by'] = this.authService.getUserLocalStorage();
    const serviceRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(serviceRef, data);
  }

  getServices(): Observable<any[]> {
    const serviceRef = collection(this.firestore, this.collectionName);

    const q = query(
      serviceRef,
      where('ser_team_state', '==', true),
      orderBy('ser_start_date', 'desc')
    );

    return collectionData(q, { idField: 'ser_id' }) as Observable<any[]>;
  }

  getServicesFalse(): Observable<any[]> {
    const ref = collection(this.firestore, this.collectionName);

    const q = query(
      ref,
      where('ser_team_state', '==', false),
      orderBy('ser_start_date', 'desc')
    );

    return collectionData(q, { idField: 'ser_id' }) as Observable<any[]>;
  }

  async toggleStatus(id: string, data: Partial<any>) {
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    data['updated_by'] = this.authService.getUserLocalStorage();
    const serviceRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(serviceRef, data);
  }

  deleteService(id: string) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
