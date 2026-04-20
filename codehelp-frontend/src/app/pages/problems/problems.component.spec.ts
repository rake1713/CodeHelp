import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemsComponent } from './problems.component';

describe('ProblemsComponent', () => {
  let component: ProblemsComponent;
  let fixture: ComponentFixture<ProblemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
