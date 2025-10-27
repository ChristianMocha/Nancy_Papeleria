import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, collection, setDoc, serverTimestamp, writeBatch, where, query, Timestamp, getDocs } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  public firestore = inject(Firestore);


  async savePurchase(purchaseData: any) {
    const purchaseCollection = collection(this.firestore, 'purchases');
    const newPurchaseRef = doc(purchaseCollection);
    purchaseData.shop_id = newPurchaseRef.id;
    purchaseData.shop_crea_date = serverTimestamp(),
  
    await setDoc(newPurchaseRef, purchaseData);
  
    return purchaseData;
  }

  updateMultipleProducts(products: any[]) {
    const batch = writeBatch(this.firestore);
  
    products.forEach(p => {
      const productRef = doc(this.firestore, `category/${p.prod_category_id}/products/${p.prod_id}`);
      batch.update(productRef, {
        ...p,
        prod_update_date: new Date()
      });
    });
  
    return batch.commit();
  }

  async getPurchasesByDate(date: string) {
    const purchasesRef = collection(this.firestore, 'purchases');
    const q = query(
      purchasesRef,
      where('shop_date', '>=', date),
      where('shop_date', '<=', date)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }



}
