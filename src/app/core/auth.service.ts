import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  getDoc,
  serverTimestamp,
  setDoc
} from '@angular/fire/firestore';
import { Observable, map, of, switchMap } from 'rxjs';

export type UserRole = 'particulier' | 'pro';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  role?: UserRole | null;
  photoURL?: string | null;
  profileComplete?: boolean;
  createdAt?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  user$ = authState(this.auth);

  profile$: Observable<UserProfile | null> = this.user$.pipe(
    switchMap((user) => {
      if (!user) return of(null);
      const ref = doc(this.firestore, 'users', user.uid);
      return docData(ref).pipe(
        map((data) => {
          if (!data) return null;
          return { ...(data as UserProfile) };
        })
      );
    })
  );

  async signUpEmail(params: { email: string; password: string; displayName: string; role: UserRole }) {
    const cred = await createUserWithEmailAndPassword(this.auth, params.email, params.password);
    await updateProfile(cred.user, { displayName: params.displayName });
    await this.upsertProfile({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: params.displayName,
      role: params.role,
      photoURL: cred.user.photoURL ?? null,
      phoneNumber: cred.user.phoneNumber ?? null
    });
    return cred.user;
  }

  async signInEmail(params: { email: string; password: string }) {
    const cred = await signInWithEmailAndPassword(this.auth, params.email, params.password);
    return cred.user;
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const cred = await this.run(() => signInWithPopup(this.auth, provider));
      await this.persistUserFromCred(cred.user);
      return cred.user;
    } catch (err: any) {
      // Fallback redirect si popup bloqué (mobile / navigateur)
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        await this.run(() => signInWithRedirect(this.auth, provider));
        const result = await this.run(() => getRedirectResult(this.auth));
        if (result?.user) {
          await this.persistUserFromCred(result.user);
          return result.user;
        }
      }
      throw err;
    }
  }

  async handleRedirectResult() {
    const result = await this.run(() => getRedirectResult(this.auth));
    if (result?.user) {
      await this.persistUserFromCred(result.user);
      return result.user;
    }
    return null;
  }

  async completeProfile(params: { displayName: string; role: UserRole; phoneNumber?: string }) {
    const current = this.auth.currentUser;
    if (!current) throw new Error('No authenticated user');
    await updateProfile(current, { displayName: params.displayName });
    await this.upsertProfile({
      uid: current.uid,
      email: current.email,
      displayName: params.displayName,
      role: params.role,
      phoneNumber: params.phoneNumber ?? current.phoneNumber ?? null,
      photoURL: current.photoURL,
      profileComplete: true
    });
  }

  async updateProfileInfo(params: { displayName?: string; role?: UserRole; phoneNumber?: string | null; photoURL?: string | null }) {
    const current = this.auth.currentUser;
    if (!current) throw new Error('No authenticated user');
    if (params.displayName) {
      await updateProfile(current, { displayName: params.displayName });
    }
    await this.upsertProfile({
      uid: current.uid,
      email: current.email,
      displayName: params.displayName ?? current.displayName,
      role: params.role,
      phoneNumber: params.phoneNumber ?? current.phoneNumber ?? null,
      photoURL: params.photoURL ?? current.photoURL,
      profileComplete: true
    });
  }

  async logout() {
    await signOut(this.auth);
  }

  private async upsertProfile(profile: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    role?: UserRole | null;
    photoURL?: string | null;
    profileComplete?: boolean | null;
  }) {
    const ref = doc(this.firestore, 'users', profile.uid);
    const existingSnap = await getDoc(ref);
    const existing = existingSnap.exists() ? (existingSnap.data() as UserProfile) : null;

    const displayName = profile.displayName ?? existing?.displayName ?? null;
    const role = profile.role ?? existing?.role ?? null;
    const phoneNumber = profile.phoneNumber ?? existing?.phoneNumber ?? null;
    const photoURL = profile.photoURL ?? existing?.photoURL ?? null;
    const email = profile.email ?? existing?.email ?? null;
    const computedComplete = Boolean(displayName && role);
    const profileComplete = profile.profileComplete ?? computedComplete ?? existing?.profileComplete ?? false;
    const createdAt = existing?.createdAt ?? serverTimestamp();

    await setDoc(
      ref,
      {
        uid: profile.uid,
        email,
        displayName,
        phoneNumber,
        role,
        photoURL,
        profileComplete,
        createdAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(doc(this.firestore, 'users', uid));
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserProfile;
  }

  private async persistUserFromCred(user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }) {
    await this.upsertProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: null,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber
    });
  }

  private run<T>(fn: () => Promise<T>): Promise<T> {
    return runInInjectionContext(this.injector, fn);
  }
}
