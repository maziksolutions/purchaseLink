import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCategoryComponent } from './page-category.component';

describe('PageCategoryComponent', () => {
  let component: PageCategoryComponent;
  let fixture: ComponentFixture<PageCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
