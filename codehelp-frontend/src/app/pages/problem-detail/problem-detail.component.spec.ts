import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemDetailComponent } from './problem-detail.component';

describe('ProblemDetail', () => {
  let component: ProblemDetailComponent;
  let fixture: ComponentFixture<ProblemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
