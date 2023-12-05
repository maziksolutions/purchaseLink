import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionTrackingComponent } from './requisition-tracking.component';

describe('RequisitionTrackingComponent', () => {
  let component: RequisitionTrackingComponent;
  let fixture: ComponentFixture<RequisitionTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequisitionTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequisitionTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
