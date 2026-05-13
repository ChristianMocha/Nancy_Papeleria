import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  docData,
  deleteDoc,
  doc,
  Query,
  setDoc,
  Timestamp,
  updateDoc,
  getCountFromServer,
} from '@angular/fire/firestore';
import { from, Observable, switchMap } from 'rxjs';
import { Category } from '../modules/shared/models/category';
import { DateService } from './date.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly dateService = inject(DateService);
  private readonly authService = inject(AuthService);

  constructor(private firestore: Firestore) {}

  addCategory(category: Category) {
    category.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    category.created_by = this.authService.getUserLocalStorage();
    const newDocRef = doc(collection(this.firestore, 'category'));
    category.cat_id = newDocRef.id;

    return setDoc(newDocRef, category);
  }

  getCategories(): Observable<any[]> {
  const catsRef = collection(this.firestore, 'category');

  return collectionData(catsRef, { idField: 'cat_id' }).pipe(
    switchMap((categories: any[]) => {
      const promises = categories.map(async (cat) => {
        const productsRef = collection(
          this.firestore,
          `category/${cat.cat_id}/products`
        );

        const snapshot = await getCountFromServer(productsRef);

        return {
          ...cat,
          productCount: snapshot.data().count,
        };
      });

      return from(Promise.all(promises));
    })
  );
}

  deleteCategory(idCategory: any) {
    const docRef = doc(this.firestore, `category/${idCategory}`);
    return deleteDoc(docRef);
  }

  getCategoryById(id: string): Observable<any> {
    const docRef = doc(this.firestore, `category/${id}`);
    return docData(docRef, { idField: 'id' });
  }

  updateCategory(id: string, data: any) {
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    data['updated_by'] = this.authService.getUserLocalStorage();
    const employeeRef = doc(this.firestore, `category/${id}`);
    return updateDoc(employeeRef, data);
  }
}
