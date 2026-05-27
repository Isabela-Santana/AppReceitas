// src/app/pages/perfil/perfil.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSkeletonText, ToastController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart, heartOutline, bookmark, bookmarkOutline,
  settingsOutline, gridOutline, restaurantOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';
import { ReceitaService } from '../../services/receita';
import { Receita } from '../../models/receita.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonSkeletonText,
  ],
})
export class PerfilPage implements ViewWillEnter {

  usuario: Usuario | null = null;
  receitasPostadas: Receita[] = [];
  receitasCurtidas: Receita[] = [];
  receitasSalvas: Receita[] = [];
  abaAtiva: 'postadas' | 'curtidas' | 'salvas' = 'postadas';

  constructor(
    private authService: AuthService,
    private receitaService: ReceitaService,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      heart, heartOutline, bookmark, bookmarkOutline,
      settingsOutline, gridOutline, restaurantOutline,
      shareSocialOutline,
    });
  }

    async ionViewWillEnter() {
    const aba = this.route.snapshot.data['aba'] 
      || this.route.snapshot.queryParams['aba'];
    
    if (aba === 'curtidas') this.abaAtiva = 'curtidas';
    else if (aba === 'salvas') this.abaAtiva = 'salvas';
    else this.abaAtiva = 'postadas';

    this.usuario = await this.authService.getUsuarioAtual();
    if (this.usuario) {
      const [postadas, curtidas, salvas] = await Promise.all([
        this.receitaService.listarPorAutor(this.usuario.uid),
        this.receitaService.listarCurtidas(this.usuario.uid),
        this.receitaService.listarSalvas(this.usuario.uid),
      ]);
      this.receitasPostadas = postadas;
      this.receitasCurtidas = curtidas;
      this.receitasSalvas = salvas;
    }
  }

  verReceita(receita: Receita) {
    this.router.navigate(['/tabs/receita', receita.id]);
  }

  async descurtir(receita: Receita, event: Event) {
    event.stopPropagation();
    await this.receitaService.curtir(receita.id, false);
    this.receitasCurtidas = this.receitasCurtidas.filter(r => r.id !== receita.id);
    const toast = await this.toastCtrl.create({
      message: 'Curtida removida.', duration: 1500, position: 'bottom',
    });
    await toast.present();
  }

  async dessalvar(receita: Receita, event: Event) {
    event.stopPropagation();
    await this.receitaService.salvar(receita.id, false);
    this.receitasSalvas = this.receitasSalvas.filter(r => r.id !== receita.id);
    const toast = await this.toastCtrl.create({
      message: 'Receita removida das salvas.', duration: 1500, position: 'bottom',
    });
    await toast.present();
  }

  trackById(_: number, receita: Receita) { return receita.id; }
}