import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface AdminCategory {
  id?: string;
  name: string;
  description?: string;
}

export interface AdminUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
}

export interface AdminListing {
  id?: string;
  title: string;
  price?: number;
  ownerId?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private firestore = inject(Firestore);

  getProUsers(): Observable<AdminUser[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('role', '==', 'pro'));
    return collectionData(q, { idField: 'uid' }) as Observable<AdminUser[]>;
  }

  getCategories(): Observable<AdminCategory[]> {
    const ref = collection(this.firestore, 'categories');
    return collectionData(ref, { idField: 'id' }) as Observable<AdminCategory[]>;
  }

  addCategory(category: AdminCategory) {
    const ref = collection(this.firestore, 'categories');
    return addDoc(ref, {
      name: category.name,
      description: category.description ?? ''
    });
  }

  getListings(): Observable<AdminListing[]> {
    const ref = collection(this.firestore, 'listings');
    return collectionData(ref, { idField: 'id' }) as Observable<AdminListing[]>;
  }
}
