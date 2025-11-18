import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListingService, Listing } from './listing.service';
import { AdminDataService, AdminCategory } from '../admin/admin-data.service';
import { ReportService } from '../reports/report.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './listing-detail.component.html'
})
export class ListingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private listings = inject(ListingService);
  private categories = inject(AdminDataService);
  private reports = inject(ReportService);
  private fb = inject(FormBuilder);

  listing = signal<Listing | null>(null);
  category = signal<AdminCategory | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  reportMessage = signal<string | null>(null);

  reportForm = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Annonce introuvable');
      this.loading.set(false);
      return;
    }
    try {
      const data = await this.listings.getListingById(id);
      this.listing.set(data);
      if (data?.categoryId) {
        this.categories.getCategories().subscribe((cats) => {
          const match = cats.find((c) => c.id === data.categoryId);
          if (match) this.category.set(match);
        });
      }
    } catch (err: any) {
      this.error.set(err?.message ?? 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async submitReport() {
    this.reportMessage.set(null);
    if (this.reportForm.invalid || !this.listing()) {
      this.reportForm.markAllAsTouched();
      return;
    }
    try {
      await this.reports.reportListing(this.listing()!.id!, this.reportForm.value.reason!);
      this.reportForm.reset();
      this.reportMessage.set('Signalement envoyé.');
    } catch (err: any) {
      this.reportMessage.set(err?.message ?? 'Impossible de signaler');
    }
  }
}
