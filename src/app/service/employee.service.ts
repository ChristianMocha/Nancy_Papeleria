import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  docData,
  deleteDoc,
  doc,
  Query,
  setDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  fromRef,
  getDocs,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Employees } from '../modules/shared/models/employe';
import { DateService } from './date.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  public firestore = inject(Firestore);

  private readonly dateService = inject(DateService);
    private readonly authService = inject(AuthService);

  private collectionName = 'employees';

  addEmployee(employee: any) {
    console.log(employee);
    employee.created_at = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    employee.created_by = this.authService.getUserLocalStorage();
    const employeesRef = doc(collection(this.firestore, this.collectionName));
    employee.emp_id = employeesRef.id;
    return setDoc(employeesRef, employee);
  }

  updateEmployee(id: string, data: Partial<any>) {
    data['updated_at'] = Timestamp.fromDate(
      this.dateService.getDateTimeStamp()
    );
    data['updated_by'] = this.authService.getUserLocalStorage();
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
    return collectionData(employeesRef, { idField: 'emp_id' }) as Observable<
      Employees[]
    >;
  }

async getEmployeeById(emp_id: string): Promise<Employees | null> {
    try {
      const employeesRef = collection(this.firestore, this.collectionName);
      const q = query(employeesRef, where('emp_uid', '==', emp_id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null; // No se encontró
      }

      const docSnap = querySnapshot.docs[0];
      return { emp_uid: docSnap.id, ...docSnap.data() } as Employees;
    } catch (error) {
      console.error('Error al buscar empleado:', error);
      return null;
    }
  }

  deleteEmployee(id: string) {
    const employeeRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(employeeRef);
  }
}
