// src/app/pages/receita/receita.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonBackButton, IonFooter, IonSkeletonText,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, heart, bookmarkOutline, bookmark,
  checkmark, shareSocialOutline
} from 'ionicons/icons';
import { ReceitaService } from '../../services/receita'; 
import { Receita } from '../../models/receita.model';

@Component({
  selector: 'app-receita',
  templateUrl: './receita.page.html',
  styleUrls: ['./receita.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonBackButton, IonFooter, IonSkeletonText,
  ],
})
export class ReceitaPage implements OnInit {

  receita: Receita | null = null;
  ingredientesChecked: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService,
    private toastCtrl: ToastController,
  ) {
    addIcons({ heartOutline, heart, bookmarkOutline, bookmark, checkmark, shareSocialOutline });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // CORREÇÃO 1: Verificamos se o ID existe antes de buscar
    if (id) {
      const data = await this.receitaService.buscarPorId(id);
      if (data) {
        this.receita = data;
        // Inicializa os checkboxes apenas se houver ingredientes
        if (this.receita.ingredientes) {
          this.ingredientesChecked = new Array(this.receita.ingredientes.length).fill(false);
        }
      }
    }
  }

  toggleIngrediente(index: number) {
    this.ingredientesChecked[index] = !this.ingredientesChecked[index];
  }

  async curtir() {
    // CORREÇÃO 2: "if (!this.receita?.id)" resolve o erro de 'id undefined'
    if (!this.receita || !this.receita.id) return;

    const novoEstado = !this.receita.curtido;
    this.receita.curtido = novoEstado;
    this.receita.curtidas += novoEstado ? 1 : -1;
    
    try {
      await this.receitaService.curtir(this.receita.id, novoEstado);
    } catch (error) {
      console.error("Erro ao curtir:", error);
      // Reverte se der erro
      this.receita.curtido = !novoEstado;
      this.receita.curtidas += !novoEstado ? 1 : -1;
    }
  }

  async salvarReceita() {
    // CORREÇÃO 3: Garantindo que o ID é string para o serviço
    if (!this.receita || !this.receita.id) return;

    const novoEstadoSalvo = !this.receita.salvo;
    this.receita.salvo = novoEstadoSalvo;
    
    try {
      await this.receitaService.salvar(this.receita.id, novoEstadoSalvo);
      
      const toast = await this.toastCtrl.create({
        message: novoEstadoSalvo ? 'Receita salva!' : 'Removida dos salvos.',
        duration: 2000, 
        position: 'bottom', 
        cssClass: 'toast-vinho',
      });
      await toast.present();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.receita.salvo = !novoEstadoSalvo;
    }
  }

  async compartilhar() {
    if (!this.receita) return;
    console.log('Compartilhando:', this.receita.titulo);
  }
}