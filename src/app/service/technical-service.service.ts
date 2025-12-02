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

@Injectable({
  providedIn: 'root',
})
export class TechnicalServiceService {
  private readonly dateService = inject(DateService);
  public firestore = inject(Firestore);

  private collectionName = 'technical_service';

  addService(service: any) {
    console.log(service);
    service.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    const serviceRef = doc(collection(this.firestore, this.collectionName));
    service.ser_id = serviceRef.id;
    return setDoc(serviceRef, service);
  }

  updateService(id: string, data: Partial<any>) {
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
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
    const serviceRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(serviceRef, data);
  }

  deleteService(id: string) {
    console.log(id);
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
