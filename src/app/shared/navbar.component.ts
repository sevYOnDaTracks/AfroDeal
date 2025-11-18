import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserProfile } from '../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
                <div class="flex items-center gap-3">
          <ng-container *ngIf="profile(); else guestLinks">
            <div class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm">
              <ng-container *ngIf="profile()?.photoURL; else fallbackAvatar">
                <img [src]="profile()?.photoURL || ''" alt="Avatar" class="h-9 w-9 rounded-full object-cover border border-slate-200" (error)="clearPhoto()" />
              </ng-container>
              <ng-template #fallbackAvatar>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-fuchsia-200 text-xs font-bold text-slate-900 uppercase">
                  {{ initials() }}
                </div>
              </ng-template>
              <div class="flex flex-col leading-none">
                <span class="max-w-[200px] truncate cursor-pointer hover:text-orange-700" (click)="navigateAccount()">
                  {{ displayLabel() }}
                </span>
              </div>
              <a class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 transition hover:border-orange-400/80 hover:text-slate-900" routerLink="/publish">
                Publier
              </a>
              <button class="text-xs font-semibold text-orange-700 hover:underline" (click)="logout()">
                Déconnexion
              </button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <button class="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-orange-400/80 hover:text-slate-900 lg:inline-flex" routerLink="/login">
              Se connecter
            </button>
            <a class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 transition hover:border-orange-400/80 hover:text-slate-900" routerLink="/publish">
              Publier
            </a>
          </ng-template>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly displayLabel = computed(() => {
    const p = this.profile();
    return p?.displayName || p?.email || '';
  });
  protected readonly initials = computed(() => {
    const label = this.displayLabel().trim();
    if (!label) return '';
    const [first, second] = label.split(' ');
    if (second) return (first[0] + second[0]).toUpperCase();
    return label.slice(0, 2).toUpperCase();
  });

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.auth.profile$.subscribe((p) => this.profile.set(p));
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  clearPhoto() {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, photoURL: null });
    }
  }

  navigateAccount() {
    this.router.navigate(['/account']);
  }
}



