import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaReceitaPage } from './nova-receita.page';

describe('NovaReceitaPage', () => {
  let component: NovaReceitaPage;
  let fixture: ComponentFixture<NovaReceitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovaReceitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
