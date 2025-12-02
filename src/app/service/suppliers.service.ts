import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { DateService } from './date.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly dateService = inject(DateService);
  private collectionName = 'supplier';

  public firestore = inject(Firestore);

  addSupplier(supplier: any) {
    supplier.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    console.log(supplier);
    const supplierRef = doc(collection(this.firestore, this.collectionName));
    supplier.supp_id = supplierRef.id;
    return setDoc(supplierRef, supplier);
  }

  getSuppliers(): Observable<any[]> {
    const suppliersRef = collection(this.firestore, this.collectionName);
    return collectionData(suppliersRef, { idField: 'supp_id' }) as Observable<
      any[]
    >;
  }

  updateSupplier(id: string, data: Partial<any>) {
    console.log(data);
    console.log(id);
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );

    const supplierRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(supplierRef, data);
  }

  deleteService(id: string) {
    console.log(id);
    const supplierRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(supplierRef);
  }
}
