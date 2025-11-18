import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Timestamp,
  doc,
  getDoc,
  addDoc,
  collection,
  collectionData,
  query,
  where
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  ownerId: string;
  condition: 'neuf' | 'occasion';
  location?: string;
  photos?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  addListing(listing: Listing) {
    const ref = collection(this.firestore, 'listings');
    return addDoc(ref, {
      ...listing,
      status: listing.status ?? 'pending',
      createdAt: Timestamp.now()
    });
  }

  getApprovedListings(): Observable<Listing[]> {
    const ref = collection(this.firestore, 'listings');
    const q = query(ref, where('status', '==', 'approved'));
    return collectionData(q, { idField: 'id' }) as Observable<Listing[]>;
  }

  getPendingListings(): Observable<Listing[]> {
    const ref = collection(this.firestore, 'listings');
    const q = query(ref, where('status', '==', 'pending'));
    return collectionData(q, { idField: 'id' }) as Observable<Listing[]>;
  }

  async getListingById(id: string): Promise<Listing | null> {
    const snap = await getDoc(doc(this.firestore, 'listings', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Listing) };
  }

  async uploadPhotos(files: File[], ownerId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const path = `listings/${ownerId}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  }

  async updateStatus(listingId: string, status: 'approved' | 'rejected') {
    const docRef = (await import('@angular/fire/firestore')).doc(this.firestore, 'listings', listingId);
    const updateFn = (await import('@angular/fire/firestore')).updateDoc;
    return updateFn(docRef, { status });
  }
}
