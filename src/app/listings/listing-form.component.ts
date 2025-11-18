import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from './listing.service';
import { AdminDataService, AdminCategory } from '../admin/admin-data.service';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-form.component.html'
})
export class ListingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private listings = inject(ListingService);
  private categoriesService = inject(AdminDataService);
  private auth = inject(AuthService);
  private router = inject(Router);

  categories$: Observable<AdminCategory[]> = this.categoriesService.getCategories();
  loading = signal(false);
  error = signal<string | null>(null);
  selectedFiles: File[] = [];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: ['', [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    condition: ['neuf', Validators.required],
    location: ['']
  });

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      if (!u) {
        this.router.navigate(['/login']);
      }
    });
  }

  async submit() {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth['auth']?.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loading.set(true);
    try {
      const { title, description, price, categoryId, condition, location } = this.form.value;
      const photoList = this.selectedFiles.length
        ? await this.listings.uploadPhotos(this.selectedFiles, user.uid)
        : [];
      await this.listings.addListing({
        title: title!,
        description: description!,
        price: Number(price),
        categoryId: categoryId!,
        condition: condition as 'neuf' | 'occasion',
        location: location || '',
        photos: photoList,
        ownerId: user.uid,
        status: 'pending'
      });
      this.form.reset({ condition: 'neuf' });
      this.selectedFiles = [];
      this.router.navigate(['/listings']);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Impossible de publier');
    } finally {
      this.loading.set(false);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length) {
      this.selectedFiles = Array.from(files);
    }
  }
}
