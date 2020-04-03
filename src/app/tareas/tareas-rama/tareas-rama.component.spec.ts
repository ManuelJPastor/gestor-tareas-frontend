import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TareasRamaComponent } from './tareas-rama.component';

describe('TareasRamaComponent', () => {
  let component: TareasRamaComponent;
  let fixture: ComponentFixture<TareasRamaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TareasRamaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TareasRamaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
