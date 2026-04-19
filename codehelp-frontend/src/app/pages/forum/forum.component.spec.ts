import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumComponent } from './forum.component';

describe('Forum', () => {
  let component: ForumComponent;
  let fixture: ComponentFixture<ForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
