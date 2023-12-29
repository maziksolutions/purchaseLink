import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRefPopUpViewComponent } from './order-ref-pop-up-view.component';

describe('OrderRefPopUpViewComponent', () => {
  let component: OrderRefPopUpViewComponent;
  let fixture: ComponentFixture<OrderRefPopUpViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderRefPopUpViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRefPopUpViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
