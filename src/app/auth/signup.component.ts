import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../core/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);
  loading = signal(false);

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['particulier' as UserRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = await this.auth.handleRedirectResult();
      if (user?.uid) {
        const profile = await this.auth.getProfile(user.uid);
        this.navigateAfterAuth(profile?.profileComplete);
      }
    } catch (err: any) {
      // ignore si pas de redirect
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.loading.set(true);
      const { email, password, displayName, role } = this.form.value;
      const user = await this.auth.signUpEmail({
        email: email!,
        password: password!,
        displayName: displayName!,
        role: role!
      });
      const profile = user?.uid ? await this.auth.getProfile(user.uid) : null;
      this.navigateAfterAuth(profile?.profileComplete);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Création de compte impossible');
    } finally {
      this.loading.set(false);
    }
  }

  async signupWithGoogle() {
    this.error.set(null);
    try {
      this.loading.set(true);
      const user = await this.auth.signInWithGoogle();
      const profile = user?.uid ? await this.auth.getProfile(user.uid) : null;
      this.navigateAfterAuth(profile?.profileComplete);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Connexion Google impossible');
    } finally {
      this.loading.set(false);
    }
  }

  private navigateAfterAuth(profileComplete?: boolean | null) {
    if (profileComplete) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/onboarding']);
    }
  }
}
