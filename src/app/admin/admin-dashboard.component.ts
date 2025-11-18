import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { AdminDataService, AdminCategory, AdminListing, AdminUser } from './admin-data.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ListingService } from '../listings/listing.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  private auth = inject(AdminAuthService);
  private router = inject(Router);
  private data = inject(AdminDataService);
  private fb = inject(FormBuilder);
  private listingsSvc = inject(ListingService);

  proUsers$: Observable<AdminUser[]> = this.data.getProUsers();
  categories$: Observable<AdminCategory[]> = this.data.getCategories();
  listings$: Observable<AdminListing[]> = this.data.getListings();

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  creatingCategory = false;
  errorCategory: string | null = null;

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  async addCategory() {
    this.errorCategory = null;
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.creatingCategory = true;
    try {
      const { name, description } = this.categoryForm.value;
      await this.data.addCategory({ name: name!, description: description ?? '' });
      this.categoryForm.reset();
    } catch (err: any) {
      this.errorCategory = err?.message ?? 'Impossible d’ajouter la catégorie';
    } finally {
      this.creatingCategory = false;
    }
  }

  updateStatus(listingId: string, status: 'approved' | 'rejected') {
    this.listingsSvc.updateStatus(listingId, status);
  }
}
