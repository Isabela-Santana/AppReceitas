// src/app/pages/busca/busca.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonContent, IonButtons, IonBackButton,
  IonSearchbar, IonIcon, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, sadOutline, heartOutline } from 'ionicons/icons';
import { ReceitaService } from '../../services/receita';
import { Receita } from '../../models/receita.model';

@Component({
  selector: 'app-busca',
  templateUrl: './busca.page.html',
  styleUrls: ['./busca.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonContent, IonButtons, IonBackButton,
    IonSearchbar, IonIcon, IonSkeletonText,
  ],
})
export class BuscaPage {

  termoBusca = '';
  resultados: Receita[] = [];
  buscando = false;

  constructor(
    private receitaService: ReceitaService,
    private router: Router,
  ) {
    addIcons({ searchOutline, sadOutline, heartOutline });
  }

  async onBusca() {
    if (!this.termoBusca.trim()) {
      this.resultados = [];
      return;
    }
    this.buscando = true;
    try {
      this.resultados = await this.receitaService.buscar(this.termoBusca);
    } finally {
      this.buscando = false;
    }
  }

  verReceita(receita: Receita) {
    this.router.navigate(['/tabs/receita', receita.id]);
  }

  trackById(_: number, receita: Receita) { return receita.id; }
}