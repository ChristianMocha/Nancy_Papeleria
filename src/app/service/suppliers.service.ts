import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  collectionGroup,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { DateService } from './date.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private readonly dateService = inject(DateService);
    private readonly authService = inject(AuthService);
  private collectionName = 'supplier';

  public firestore = inject(Firestore);

  addSupplier(supplier: any) {
    supplier.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
            supplier.created_by = this.authService.getUserLocalStorage();
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

  getSuppliersActive(): Observable<any[]> {
    const suppliersRef = collection(this.firestore, this.collectionName);

    const q = query(suppliersRef, where('is_active', '==', true));

    return collectionData(q, { idField: 'supp_id' }) as Observable<any[]>;
  }

  updateSupplier(id: string, data: Partial<any>) {
    console.log(data);
    console.log(id);
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    data['updated_by'] = this.authService.getUserLocalStorage();

    const supplierRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(supplierRef, data);
  }

  deleteService(id: string) {
    console.log(id);
    const supplierRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(supplierRef);
  }

 getProductsBySupplierId(supplierId: string): Observable<any[]> {
  const ref = collectionGroup(this.firestore, 'products');
  const q = query(ref, where('prod_supplier_id', '==', supplierId));

  return collectionData(q, { idField: 'prod_id' });
}

}
