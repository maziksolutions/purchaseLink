import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfeventComponent } from './wfevent.component';

describe('WfeventComponent', () => {
  let component: WfeventComponent;
  let fixture: ComponentFixture<WfeventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfeventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WfeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
