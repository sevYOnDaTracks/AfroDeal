import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserProfile, UserRole } from '../core/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html'
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  profile = signal<UserProfile | null>(null);

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    role: ['particulier' as UserRole, Validators.required],
    phoneNumber: ['']
  });

  ngOnInit() {
    this.auth.profile$.subscribe((p) => {
      this.profile.set(p);
      if (p?.displayName) this.form.patchValue({ displayName: p.displayName });
      if (p?.role) this.form.patchValue({ role: p.role });
      if (p?.phoneNumber) this.form.patchValue({ phoneNumber: p.phoneNumber });
      if (p?.profileComplete) {
        this.router.navigate(['/']);
      }
    });
  }

  async submit() {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.loading.set(true);
      const { displayName, role, phoneNumber } = this.form.value;
      await this.auth.completeProfile({
        displayName: displayName!,
        role: role!,
        phoneNumber: phoneNumber || undefined
      });
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Impossible de finaliser le profil');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
