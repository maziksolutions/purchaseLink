import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyColumnsPopUpComponent } from './modify-columns-pop-up.component';

describe('ModifyColumnsPopUpComponent', () => {
  let component: ModifyColumnsPopUpComponent;
  let fixture: ComponentFixture<ModifyColumnsPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyColumnsPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyColumnsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
