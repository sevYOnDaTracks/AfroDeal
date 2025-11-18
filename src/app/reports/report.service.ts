import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private firestore = inject(Firestore);

  reportListing(listingId: string, reason: string) {
    const ref = collection(this.firestore, 'reports');
    return addDoc(ref, {
      targetType: 'listing',
      targetId: listingId,
      reason,
      status: 'open',
      createdAt: Timestamp.now()
    });
  }
}
