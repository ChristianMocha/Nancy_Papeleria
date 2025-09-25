import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, docData, deleteDoc, doc, Query, setDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../modules/shared/models/category';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

 constructor(private firestore: Firestore) {}

  addCategory(category: Category) {
    const newDocRef = doc(collection(this.firestore, 'category'));
    console.log(newDocRef);
      category.cat_id = newDocRef.id;

  // 🔹 usa setDoc en lugar de addDoc (porque ya definiste el ID)
  return setDoc(newDocRef, category);
  }

getCategories(): Observable<Category[]> {
  const catsRef = collection(this.firestore, 'category') as Query<Category>;
  return collectionData(catsRef, { idField: 'cat_id' }) as Observable<Category[]>;
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
