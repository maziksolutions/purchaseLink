import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenaviRightComponent } from './sidenavi-right.component';

describe('SidenaviRightComponent', () => {
  let component: SidenaviRightComponent;
  let fixture: ComponentFixture<SidenaviRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidenaviRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenaviRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
