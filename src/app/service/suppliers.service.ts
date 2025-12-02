import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
    private readonly dateService = inject(DateService);
  private collectionName = 'employees';

  public firestore = inject(Firestore);

  addSupplier(supplier: any) {
    supplier.created_at = this.dateService.getDate();
    console.log(supplier);
    const supplierRef = doc(collection(this.firestore, this.collectionName));
    supplier.supp_id = supplierRef.id;
    return setDoc(supplierRef, supplier);
  }
}
