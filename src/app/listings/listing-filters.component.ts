import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ListingFilters {
  categoryId?: string;
  condition?: 'neuf' | 'occasion' | '';
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Component({
  selector: 'app-listing-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <select class="rounded-lg border border-slate-200 bg-white px-3 py-2" [(ngModel)]="filters.categoryId" (ngModelChange)="emit()">
        <option value="">Catégorie</option>
        <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
      </select>
      <select class="rounded-lg border border-slate-200 bg-white px-3 py-2" [(ngModel)]="filters.condition" (ngModelChange)="emit()">
        <option value="">État</option>
        <option value="neuf">Neuf</option>
        <option value="occasion">Occasion</option>
      </select>
      <input class="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2" type="number" placeholder="Min" [(ngModel)]="filters.minPrice" (ngModelChange)="emit()" />
      <input class="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2" type="number" placeholder="Max" [(ngModel)]="filters.maxPrice" (ngModelChange)="emit()" />
    </div>
  `
})
export class ListingFiltersComponent {
  @Output() filtersChange = new EventEmitter<ListingFilters>();
  @Input() categories: { id?: string; name?: string }[] = [];
  filters: ListingFilters = { condition: '', categoryId: '', minPrice: null, maxPrice: null };

  emit() {
    this.filtersChange.emit(this.filters);
  }
}
