import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  doc,
  collection,
  setDoc,
  writeBatch,
  where,
  query,
  Timestamp,
  getDocs,
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  public firestore = inject(Firestore);
  public readonly dateService = inject(DateService);

  async savePurchase(purchaseData: any) {
    const purchaseCollection = collection(this.firestore, 'purchases');
    const newPurchaseRef = doc(purchaseCollection);
    purchaseData.shop_id = newPurchaseRef.id;
    (purchaseData.shop_crea_date = this.dateService.getDate()),
      await setDoc(newPurchaseRef, purchaseData);

    return purchaseData;
  }

  async saveBills(billsData: any) {
    const billsCollection = collection(this.firestore, 'bills');
    const newBillsRef = doc(billsCollection);
    billsData.bills_id = newBillsRef.id;
    (billsData.bills_crea_date = this.dateService.getDate()),
      await setDoc(newBillsRef, billsData);

    return billsData;
  }

  updateMultipleProducts(products: any[]) {
    const batch = writeBatch(this.firestore);

    products.forEach((p) => {
      const productRef = doc(
        this.firestore,
        `category/${p.prod_category_id}/products/${p.prod_id}`
      );
      batch.update(productRef, {
        ...p,
        prod_update_date: new Date(),
      });
    });

    return batch.commit();
  }

  async getPurchasesByDate(date?: string) {
    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(
      purchasesRef,
      where('shop_date', '>=', date),
      where('shop_date', '<=', date)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  async getBillsByDate(date?: string) {
    const purchasesRef = collection(this.firestore, 'bills');
    const q = query(
      purchasesRef,
      where('bills_date', '>=', date),
      where('bills_date', '<=', date)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

async getTotalBillsAmount(date?: string): Promise<number> {
  console.log(date);
    // 1️⃣ Crea referencia a la colección
    const billsRef: CollectionReference<DocumentData> = collection(this.firestore, 'bills');

    // 2️⃣ Si se pasa fecha, construye una query
    let q: Query<DocumentData> = billsRef;
    if (date) {
      q = query(
        billsRef,
        where('bills_date', '>=', date),
        where('bills_date', '<=', date)
      );
    }

    // 3️⃣ Ejecuta la consulta (usa `q`, no `billsRef`)
    const snapshot = await getDocs(q);

    // 4️⃣ Suma todos los bills_total
    let total = 0;
    snapshot.forEach(doc => {
      const data = doc.data() as any;
      total += data.bills_total || 0;
    });

    return total;
  }

}
