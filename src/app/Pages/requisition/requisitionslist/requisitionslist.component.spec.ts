import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionslistComponent } from './requisitionslist.component';

describe('RequisitionslistComponent', () => {
  let component: RequisitionslistComponent;
  let fixture: ComponentFixture<RequisitionslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequisitionslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequisitionslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
