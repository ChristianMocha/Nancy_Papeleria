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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../modules/shared/models/category';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly dateService = inject(DateService);

  constructor(private firestore: Firestore) {}

  addCategory(category: Category) {
    category.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    const newDocRef = doc(collection(this.firestore, 'category'));
    console.log(newDocRef);
    category.cat_id = newDocRef.id;

    return setDoc(newDocRef, category);
  }

  getCategories(): Observable<Category[]> {
    const catsRef = collection(this.firestore, 'category') as Query<Category>;
    return collectionData(catsRef, { idField: 'cat_id' }) as Observable<
      Category[]
    >;
  }

  deleteCategory(idCategory: string) {
    const docRef = doc(this.firestore, `category/${idCategory}`);
    return deleteDoc(docRef);
  }

  getCategoryById(id: string): Observable<any> {
    const docRef = doc(this.firestore, `category/${id}`);
    return docData(docRef, { idField: 'id' });
  }
}
