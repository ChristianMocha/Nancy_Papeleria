import { inject, Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public firestore = inject(Firestore);
  public auth = inject(Auth);

  public mainAuth = getAuth(); // sesión actual de admin

  // Crear una app secundaria solo para crear usuarios
  public secondaryApp = initializeApp(environment.firebase, 'Secondary');
  public secondaryAuth = getAuth(this.secondaryApp);

  async registerUserWithoutLoggingOut(user: any) {
    const userCredential = await createUserWithEmailAndPassword(
      this.secondaryAuth,
      user.emp_email,
      user.emp_password
    );

    return userCredential.user.uid;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
  }

  async getUserRole(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data()?.['role'] : null;
  }

  getUser(): Observable<any> {
    return user(this.auth);
  }

  getUserLocalStorage() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getRole(): string | null {
    const user: any = this.getUserLocalStorage();
    return user ? user.emp_role : null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isEmployee(): boolean {
    return this.getRole() === 'employee';
  }

  isLogged(): boolean {
    return !!this.getUser();
  }

  getUserLocalStorageAsync(): Promise<any> {
    return new Promise((resolve) => {
      const user = localStorage.getItem('currentUser');
      if (user) resolve(JSON.parse(user));
      else resolve(null);
    });
  }
}
