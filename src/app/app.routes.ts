import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { OnboardingComponent } from './auth/onboarding.component';
import { SignupComponent } from './auth/signup.component';
import { AccountComponent } from './account/account.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminLoginComponent } from './admin/admin-login.component';
import { HomeComponent } from './home/home.component';
import { ListingFormComponent } from './listings/listing-form.component';
import { ListingListComponent } from './listings/listing-list.component';
import { ListingDetailComponent } from './listings/listing-detail.component';
import { authGuard } from './core/auth.guard';
import { onboardingGuard } from './core/onboarding.guard';
import { noAuthGuard } from './core/no-auth.guard';
import { adminGuard } from './admin/admin.guard';
import { verifiedGuard } from './core/verified.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [noAuthGuard] },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  { path: 'publish', component: ListingFormComponent, canActivate: [authGuard, verifiedGuard] },
  { path: 'listings', component: ListingListComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [onboardingGuard, authGuard] },
  { path: '**', redirectTo: '' }
];
