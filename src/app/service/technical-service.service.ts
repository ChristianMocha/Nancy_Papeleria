import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TechnicalServiceService {
  public firestore = inject(Firestore);

  private collectionName = 'technical_service';

  addService(service: any) {
    console.log(service);
    const serviceRef = doc(collection(this.firestore, this.collectionName));
    service.ser_id = serviceRef.id;
    return setDoc(serviceRef, service);
  }

  updateService(id: string, data: Partial<any>) {
    const serviceRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(serviceRef, data);
  }

  getServices(): Observable<any[]> {
    const serviceRef = collection(this.firestore, this.collectionName);
    return collectionData(serviceRef, { idField: 'ser_id' }) as Observable<
      any[]
    >;
  }

  async toggleStatus(id: string, data: Partial<any>) {
    const serviceRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(serviceRef, data);
  }

  deleteService(id: string) {
    console.log(id);
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
