import { Observable } from "rxjs";

export interface FilterObserver {
  filter$: Observable<string>;
  setFilter(filterValue: string): void;
}