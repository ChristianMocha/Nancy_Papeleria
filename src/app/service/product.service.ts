import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { docData } from 'rxfire/firestore';
import { collectionGroup, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

 constructor(private firestore: Firestore) {}

  addProductToCategory(categoryId: string, product: any) {
    const productsRef = collection(this.firestore, `category/${categoryId}/products`);
    return addDoc(productsRef, product);
  }

  getProductsByCategory(categoryId: string): Observable<any[]> {
    const productsRef = collection(this.firestore, `category/${categoryId}/products`);
    return collectionData(productsRef, { idField: 'id' });
  }

  getAllProducts(): Observable<any[]> {
    const productsRef = collectionGroup(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' });
  }

  updateProduct(categoryId: string, productId: string, data: Partial<any>) {
    const productRef = doc(this.firestore, `category/${categoryId}/products/${productId}`);
    return updateDoc(productRef, data);
  }

  deleteProduct(categoryId: string, productId: string) {
    const docRef = doc(this.firestore, `category/${categoryId}/products/${productId}`);
    return deleteDoc(docRef);
  }

}
