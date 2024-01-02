import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReqQtyComponent } from './edit-req-qty.component';

describe('EditReqQtyComponent', () => {
  let component: EditReqQtyComponent;
  let fixture: ComponentFixture<EditReqQtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditReqQtyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReqQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
