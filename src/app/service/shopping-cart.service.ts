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
    purchaseData.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    purchaseData.shop_id = newPurchaseRef.id;
    purchaseData.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    (purchaseData.shop_crea_date = this.dateService.getDate()),
      await setDoc(newPurchaseRef, purchaseData);

    return purchaseData;
  }

  async saveBills(billsData: any) {
    const billsCollection = collection(this.firestore, 'bills');
    const newBillsRef = doc(billsCollection);
    billsData.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
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
        updated_at: Timestamp.fromDate(this.dateService.getDateTimeStamp()),
      });
    });

    return batch.commit();
  }

  async getData(date: string, rangeType: 'day' | 'week' | 'month' | 'year') {
    console.log(date);
    console.log(rangeType);
    switch (rangeType) {
      case 'day': {
        return this.getPurchasesByDate(date);
        break;
      }
      case 'week': {
        return this.getPurchasesByWeek(date, rangeType);
        break;
      }

      case 'month': {
        return this.getPurchasesByMonth(date, rangeType);
        break;
      }

      case 'year': {
        return this.getPurchasesByYear(date, rangeType);
        break;
      }

      default:
        break;
    }

    return [];
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

  async getTotalBillsAmount(
    date: string,
    rangeType: 'day' | 'week' | 'month' | 'year'
  ): Promise<number> {
    console.log(`🧾 getTotalBillsAmount → ${rangeType.toUpperCase()}:`, date);

    const { startDate, endDate } = this.getDateRange(date, rangeType);

    const toLocalISODate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

    const startISO = toLocalISODate(startDate);
    const endISO = toLocalISODate(endDate);

    console.log('➡️ Desde:', startISO);
    console.log('➡️ Hasta:', endISO);

    const billsRef: CollectionReference<DocumentData> = collection(
      this.firestore,
      'bills'
    );

    const q = query(
      billsRef,
      where('bills_date', '>=', startISO),
      where('bills_date', '<=', endISO)
    );

    const snapshot = await getDocs(q);

    let total = 0;
    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      total += data.bills_total || 0;
    });

    console.log('💸 Total encontrado:', total);
    return total;
  }

  async getPurchasesByDate(date: string) {
    console.log('📅 Día:', date);

    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(purchasesRef, where('shop_date', '==', date));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getPurchasesByWeek(date: string, rangeType: any) {
    const { startDate, endDate } = this.getDateRange(date, rangeType);

    const startISO = startDate.toISOString().slice(0, 10);
    const endISO = endDate.toISOString().slice(0, 10);

    console.log('📆 Semana:', date);
    console.log('➡️ Desde (ISO):', startISO);
    console.log('➡️ Hasta (ISO):', endISO);

    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(
      purchasesRef,
      where('shop_date', '>=', startISO),
      where('shop_date', '<=', endISO)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log('📦 Resultados encontrados:', results.length);
    snapshot.docs.forEach((d) => console.log('🧾', d.id, d.data()));
    return results;
  }

  async getPurchasesByMonth(date: string, rangeType: any) {
    console.log('🗓 Mes:', date);
    const { startDate, endDate } = this.getDateRange(date, rangeType);

    const toLocalISODate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

    const startISO = toLocalISODate(startDate);
    const endISO = toLocalISODate(endDate);

    console.log('➡️ Desde (local ISO):', startISO);
    console.log('➡️ Hasta (local ISO):', endISO);

    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(
      purchasesRef,
      where('shop_date', '>=', startISO),
      where('shop_date', '<=', endISO)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log('📦 Resultados encontrados:', results.length);
    snapshot.docs.forEach((d) => console.log('🧾', d.id, d.data()));
    return results;
  }

  async getPurchasesByYear(date: string, rangeType: any) {
    console.log('📅 Año:', date);
    const { startDate, endDate } = this.getDateRange(date, rangeType);

    const startISO = startDate.toISOString().slice(0, 10);
    const endISO = endDate.toISOString().slice(0, 10);

    console.log('➡️ Desde (ISO):', startISO);
    console.log('➡️ Hasta (ISO):', endISO);

    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(
      purchasesRef,
      where('shop_date', '>=', startISO),
      where('shop_date', '<=', endISO)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log('📦 Resultados encontrados:', results.length);
    snapshot.docs.forEach((d) => console.log('🧾', d.id, d.data()));
    return results;
  }

  getDateRange(date: string, rangeType: 'day' | 'week' | 'month' | 'year') {
    let startDate: Date;
    let endDate: Date;

    switch (rangeType) {
      case 'day': {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case 'week': {
        const [year, weekStr] = date.split('-W');
        const week = parseInt(weekStr, 10);

        const simple = new Date(Number(year), 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOweekStart = new Date(simple);
        if (dayOfWeek <= 4)
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

        startDate = new Date(ISOweekStart);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(ISOweekStart);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case 'month': {
        const [year, month] = date.split('-').map(Number);
        startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
        break;
      }

      case 'year': {
        const year = parseInt(date, 10);
        startDate = new Date(year, 0, 1, 0, 0, 0, 0);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        break;
      }

      default:
        throw new Error(`Rango de fecha no soportado: ${rangeType}`);
    }

    return { startDate, endDate };
  }
}
