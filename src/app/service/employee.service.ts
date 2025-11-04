import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, docData, deleteDoc, doc, Query, setDoc, updateDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Employees } from '../modules/shared/models/employe';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private collectionName = 'employees';

 constructor(private firestore: Firestore) {}


  addEmployee(employee: any) {
    console.log(employee);
    const employeesRef = doc(collection(this.firestore, this.collectionName));
      employee.emp_id = employeesRef.id;
    return setDoc(employeesRef, employee);
  }



  updateEmployee(id: string, data: Partial<any>) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(employeeRef, data);
  }

  async toggleStatus(empId: string, currentStatus: boolean): Promise<void> {
    const employeeRef = doc(this.firestore, this.collectionName, empId);
    const newStatus = !currentStatus;

    try {
      await updateDoc(employeeRef, { emp_status: newStatus });
      console.log(`Estado de empleado ${empId} actualizado a ${newStatus}`);
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
      throw err;
    }
  }
  
  getEmployees(): Observable<Employees[]> {
    const employeesRef = collection(this.firestore, 'employees');
    return collectionData(employeesRef, { idField: 'emp_id' }) as Observable<Employees[]>;
  }


  getEmployeeById(id: string): Observable<Employees | undefined> {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(employeeRef, { idField: 'emp_id' }) as Observable<Employees | undefined>;
  }

  deleteEmployee(id: string) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
