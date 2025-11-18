import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingService, Listing } from './listing.service';
import { Observable, combineLatest, map, Subject, startWith } from 'rxjs';
import { AdminDataService } from '../admin/admin-data.service';
import { ListingFiltersComponent, ListingFilters } from './listing-filters.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, ListingFiltersComponent, RouterModule],
  templateUrl: './listing-list.component.html'
})
export class ListingListComponent {
  private listings = inject(ListingService);
  private categoriesService = inject(AdminDataService);

  listings$: Observable<Listing[]> = this.listings.getApprovedListings();
  categories$: Observable<{ id: string; name: string }[]> = this.categoriesService.getCategories().pipe(
    map((cats) => cats.map((c) => ({ id: c.id || '', name: c.name || '' })))
  );

  private filtersSubject = new Subject<ListingFilters>();
  filteredListings$: Observable<Listing[]> = combineLatest([
    this.listings$,
    this.filtersSubject.asObservable().pipe(map((f) => f || {}), startWith({}))
  ]).pipe(map(([listings, filters]) => this.applyFilters(listings, filters)));

  onFiltersChange(filters: ListingFilters) {
    this.filtersSubject.next(filters);
  }

  private applyFilters(listings: Listing[], filters: ListingFilters): Listing[] {
    return listings.filter((l) => {
      if (filters.categoryId && l.categoryId !== filters.categoryId) return false;
      if (filters.condition && l.condition !== filters.condition) return false;
      if (filters.minPrice != null && filters.minPrice !== undefined && l.price < filters.minPrice) return false;
      if (filters.maxPrice != null && filters.maxPrice !== undefined && l.price > filters.maxPrice) return false;
      return true;
    });
  }
}
