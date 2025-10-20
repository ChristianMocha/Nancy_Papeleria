import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, collectionGroup, updateDoc, setDoc, getDocs } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { docData } from 'rxfire/firestore';
import { CollectionReference, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

 constructor(private firestore: Firestore) {}

  addProductToCategory(categoryId: string, product: any) {
    const productRef = doc(collection(this.firestore, `category/${categoryId}/products`));
    product.prod_id = productRef.id;
    product.prod_status = true;
    product.prod_start_date = new Date();
    return setDoc(productRef, product);
  }

  getAllProducts(): Observable<any[]> {
    const productsRef = collectionGroup(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'prod_id' });
  }

  updateProduct(categoryId: string, productId: string, data: any) {
    const productRef = doc(this.firestore, `category/${categoryId}/products/${productId}`);
    data.prod_update_date = new Date();
    return updateDoc(productRef, data);
  }

  deleteProduct(categoryId: string, productId: string) {
    const docRef = doc(this.firestore, `category/${categoryId}/products/${productId}`);
    return deleteDoc(docRef);
  }

async getAllProductsCostTotal(): Promise<number> {
  const productsRef = collectionGroup(this.firestore, 'products');
  const snapshot = await getDocs(productsRef);

  let totalCost = 0;
  snapshot.forEach((doc) => {
    const data: any = doc.data();

    // sacar valores con fallback y convertir a número
    const unitCost = Number(data.prod_purchase_cost) || 0;
    const qty = Number(data.prod_quantity_available) || 0;

    // sumar costo * cantidad
    totalCost += unitCost * qty;
  });

  return totalCost;
}


  getProductsByCategory(categoryId: string) {
    const productsRef = collection(this.firestore,'products') as CollectionReference;
    const q = query(productsRef, where('prod_category_id', '==', categoryId));

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    );
  }

}
