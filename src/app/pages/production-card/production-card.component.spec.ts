import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionCardComponent } from './production-card.component';

describe('ProductionCardComponent', () => {
  let component: ProductionCardComponent;
  let fixture: ComponentFixture<ProductionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
