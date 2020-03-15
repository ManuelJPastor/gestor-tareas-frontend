import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectoresFormComponent } from './sectores-form.component';

describe('SectoresFormComponent', () => {
  let component: SectoresFormComponent;
  let fixture: ComponentFixture<SectoresFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectoresFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
