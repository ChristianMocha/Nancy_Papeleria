import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { docData } from 'rxfire/firestore';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private collectionName = 'employees';

 constructor(private firestore: Firestore) {}


  addEmployee(employee: any) {
    const employeesRef = collection(this.firestore, this.collectionName);
    return addDoc(employeesRef, employee);
  }

  updateEmployee(id: string, data: Partial<any>) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(employeeRef, data);
  }

  getEmployees(): Observable<any[]> {
    const employeesRef = collection(this.firestore, this.collectionName);
    return collectionData(employeesRef, { idField: 'id' }) as Observable<any[]>;
  }

  getEmployeeById(id: string): Observable<any | undefined> {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(employeeRef, { idField: 'id' }) as Observable<any | undefined>;
  }

  deleteEmployee(id: string) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
