import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService {
  private autoSaveSubject = new Subject<any>();

  autoSave$ = this.autoSaveSubject.asObservable();

  constructor() { }

  triggerAutoSave(data: any) {
    this.autoSaveSubject.next(data);
  }
}
