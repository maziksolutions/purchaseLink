import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRefDirectPopUpComponent } from './order-ref-direct-pop-up.component';

describe('OrderRefDirectPopUpComponent', () => {
  let component: OrderRefDirectPopUpComponent;
  let fixture: ComponentFixture<OrderRefDirectPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderRefDirectPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRefDirectPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
