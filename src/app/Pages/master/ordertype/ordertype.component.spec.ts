import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdertypeComponent } from './ordertype.component';

describe('OrdertypeComponent', () => {
  let component: OrdertypeComponent;
  let fixture: ComponentFixture<OrdertypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdertypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdertypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
