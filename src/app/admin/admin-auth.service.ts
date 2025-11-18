import { Injectable, computed, signal } from '@angular/core';

const ADMIN_EMAIL = 'admin@afrodeal.com';
const ADMIN_PASSWORD = 'Admin';
const STORAGE_KEY = 'afrodeal-admin-session';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private adminState = signal<boolean>(this.readSession());

  isAuthenticated = computed(() => this.adminState());

  login(email: string, password: string): boolean {
    const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    this.adminState.set(ok);
    this.persistSession(ok);
    return ok;
  }

  logout() {
    this.adminState.set(false);
    this.persistSession(false);
  }

  private readSession(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  private persistSession(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  }
}
