import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TgtUxlibComponent } from './tgt-uxlib.component';

describe('TgtUxlibComponent', () => {
  let component: TgtUxlibComponent;
  let fixture: ComponentFixture<TgtUxlibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TgtUxlibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TgtUxlibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
