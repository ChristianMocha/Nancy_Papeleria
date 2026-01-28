import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  collectionGroup,
  updateDoc,
  setDoc,
  getDocs,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { docData } from 'rxfire/firestore';
import {
  CollectionReference,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { DateService } from './date.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public readonly dateService = inject(DateService);
  private readonly authService = inject(AuthService);
  private lastVisible: any = null;

  constructor(private firestore: Firestore) {}

  addProductToCategory(categoryId: string, product: any) {
    const productRef = doc(
      collection(this.firestore, `category/${categoryId}/products`),
    );

    product.prod_id = productRef.id;
    product.prod_status = true;
    product.prod_start_date = this.dateService.getDate();
    product.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp(),
    );
    product.created_by = this.authService.getUserLocalStorage();
    return setDoc(productRef, product);
  }

  getAllProducts(): Observable<any[]> {
    const productsRef = collectionGroup(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'prod_id' });
  }

  getProductsWinners(limitCount: number = 10) {
    const productsRef = collectionGroup(this.firestore, 'products');

    const q = query(
      productsRef,
      where('prod_sold_pount', '>', 0),
      orderBy('prod_sold_pount', 'desc'),
      limit(limitCount),
    );

    return collectionData(q, { idField: 'prod_id' });
  }

  async getProductsPaginated(
    pageSize: number = 10,
    nextPage: boolean = false,
  ): Promise<any[]> {
    const productsRef = collectionGroup(this.firestore, 'products');

    let q;
    if (nextPage && this.lastVisible) {
      q = query(
        productsRef,
        orderBy('prod_start_date', 'desc'),
        startAfter(this.lastVisible),
        limit(pageSize),
      );
    } else {
      q = query(
        productsRef,
        orderBy('prod_start_date', 'desc'),
        limit(pageSize),
      );
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      prod_id: doc.id,
      ...doc.data(),
    }));

    // Guarda el último documento para la próxima página
    this.lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return products;
  }

  resetPagination() {
    this.lastVisible = null;
  }

  getProductById(categoryId: string, productId: string): Observable<any> {
    const productRef = doc(
      this.firestore,
      `category/${categoryId}/products/${productId}`,
    );
    return docData(productRef, { idField: 'id' });
  }

  updateProduct(categoryId: string, productId: string, data: any) {
    const productRef = doc(
      this.firestore,
      `category/${categoryId}/products/${productId}`,
    );
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp(),
    );
    data['updated_by'] = this.authService.getUserLocalStorage();
    data.prod_update_date = this.dateService.getDate();
    return updateDoc(productRef, data);
  }

  deleteProduct(categoryId: string, productId: string) {
    const docRef = doc(
      this.firestore,
      `category/${categoryId}/products/${productId}`,
    );
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
  async getAllProductsCostTotalClient(): Promise<number> {
    const productsRef = collectionGroup(this.firestore, 'products');
    const snapshot = await getDocs(productsRef);

    let totalCost = 0;
    snapshot.forEach((doc) => {
      const data: any = doc.data();

      // sacar valores con fallback y convertir a número
      const unitCost = Number(data.prod_sale_price) || 0;
      const qty = Number(data.prod_quantity_available) || 0;

      // sumar costo * cantidad
      totalCost += unitCost * qty;
    });

    return totalCost;
  }

  getProductsByCategory(categoryId: string): Observable<any[]> {
    const productsRef = collection(
      this.firestore,
      `category/${categoryId}/products`,
    );
    return collectionData(productsRef, { idField: 'prod_id' });
  }

  async searchProducts(term: string): Promise<any[]> {
    if (!term.trim()) return [];

    const termLower = term.toLowerCase();
    const allProductsSnap = await getDocs(
      collectionGroup(this.firestore, 'products'),
    );
    const allProducts = allProductsSnap.docs.map((d) => ({
      prod_id: d.id,
      ...d.data(),
    }));

    const filtered = allProducts.filter((p: any) => {
      const name = (p.prod_name_lower || p.prod_name || '')
        .toString()
        .toLowerCase();
      const code = (p.prod_code || '').toString().toLowerCase();
      return name.includes(termLower) || code.includes(termLower);
    });

    return filtered;
  }
}
