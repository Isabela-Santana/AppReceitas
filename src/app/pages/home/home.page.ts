import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonContent, IonButtons,
  IonButton, IonIcon, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonBadge, IonCard, IonCardContent,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, heart, bookmarkOutline, bookmark,
  searchOutline, notificationsOutline, timeOutline,
  cafeOutline, chevronDownOutline
} from 'ionicons/icons';

// Importação dos seus serviços e modelos
import { ReceitaService } from '../../services/receita.service';
import { AuthService } from '../../services/auth';
import { Receita } from '../../models/receita.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonContent, IonButtons,
    IonButton, IonIcon, IonRefresher, IonRefresherContent,
    IonSkeletonText, IonBadge, IonCard, IonCardContent
  ],
})
export class HomePage implements OnInit {
  // Injeção de dependências moderna
  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  receitas: Receita[] = [];
  receitasDestaque: Receita[] = [];
  isLoading = true;
  usuarioIniciais = '';
  private receitaSub?: Subscription;

  constructor() {
    // Registro dos ícones utilizados no HTML
    addIcons({
      heartOutline, heart, bookmarkOutline, bookmark,
      searchOutline, notificationsOutline, timeOutline,
      cafeOutline, chevronDownOutline
    });
  }

  ngOnInit() {
    this.carregarDados();
  }

  async ionViewWillEnter() {
    // Busca as iniciais do usuário logado
    const usuario = await this.authService.getUsuarioAtual();
    if (usuario) {
      this.usuarioIniciais = usuario.iniciais || 'U';
    }
  }

  carregarDados() {
    this.isLoading = true;

    // Cancela subscrição anterior se existir para evitar vazamento de memória
    if (this.receitaSub) {
      this.receitaSub.unsubscribe();
    }

    // Escuta os dados do Firebase em tempo real através do Service
    this.receitaSub = this.receitaService.listar().subscribe({
      next: (res) => {
        this.receitas = res;
        // Define as primeiras 4 receitas como destaque
        this.receitasDestaque = res.slice(0, 4);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar receitas:', err);
        this.isLoading = false;
        this.exibirToast('Erro ao carregar dados do servidor.');
      }
    });
  }

  async onRefresh(event: any) {
    // O subscribe já atualiza automaticamente, mas o refresher dá o feedback visual
    this.carregarDados();
    event.target.complete();
  }

  // Navegação
  irParaBusca() { this.router.navigate(['/tabs/busca']); }
  irParaNotificacoes() { this.router.navigate(['/tabs/notificacoes']); }
  verReceita(receita: Receita) { this.router.navigate(['/tabs/receita', receita.id]); }

  // Ações de Interação
  async curtir(receita: Receita, event: Event) {
    event.stopPropagation();
    // Logica de interface rápida (Optimistic Update)
    receita.curtido = !receita.curtido;
    receita.curtidas += receita.curtido ? 1 : -1;
    
    // Tenta salvar no Firebase (ajuste o método no service se necessário)
    try {
      // await this.receitaService.curtir(receita.id, receita.curtido);
    } catch (e) {
      this.exibirToast('Erro ao processar curtida.');
    }
  }

  async salvar(receita: Receita, event: Event) {
    event.stopPropagation();
    receita.salvo = !receita.salvo;
    
    // Feedback visual
    const mensagem = receita.salvo ? ' Receita salva!' : 'Removida dos salvos.';
    this.exibirToast(mensagem);
    
    // Tenta salvar no Firebase
    try {
      // await this.receitaService.salvar(receita.id, receita.salvo);
    } catch (e) {
      console.error(e);
    }
  }

  private async exibirToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 1500,
      position: 'bottom',
      cssClass: 'toast-vinho' // Estilo que definimos no SCSS
    });
    await toast.present();
  }

  trackById(_: number, receita: Receita) {
    return receita.id;
  }

  // Limpeza ao destruir o componente
  ngOnDestroy() {
    if (this.receitaSub) {
      this.receitaSub.unsubscribe();
    }
  }
}