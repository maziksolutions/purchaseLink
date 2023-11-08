import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionNewComponent } from './requisition-new.component';

describe('RequisitionNewComponent', () => {
  let component: RequisitionNewComponent;
  let fixture: ComponentFixture<RequisitionNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequisitionNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequisitionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
