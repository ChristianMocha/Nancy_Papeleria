import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public firestore = inject(Firestore);
  public auth = inject(Auth);

  async registerUser(user: any): Promise<string> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      user.emp_email,
      user.emp_password
    );
  
    // Devuelve solo el UID
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
}
