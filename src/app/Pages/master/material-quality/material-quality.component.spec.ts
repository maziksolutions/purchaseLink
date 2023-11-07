import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialQualityComponent } from './material-quality.component';

describe('MaterialQualityComponent', () => {
  let component: MaterialQualityComponent;
  let fixture: ComponentFixture<MaterialQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialQualityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
