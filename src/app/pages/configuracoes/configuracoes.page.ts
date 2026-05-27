// src/app/pages/configuracoes/configuracoes.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonBackButton, IonList, IonItem,
  IonLabel, IonNote, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, lockClosedOutline,
  documentTextOutline, shieldOutline, informationCircleOutline,
  logOutOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonBackButton, IonList, IonItem,
    IonLabel, IonNote,
  ],
})
export class ConfiguracoesPage {

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      personOutline, lockClosedOutline,
      documentTextOutline, shieldOutline, informationCircleOutline,
      logOutOutline
    });
  }

  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  verTermos() {
    this.router.navigate(['/termos']);
  }

  verPrivacidade() {
    this.router.navigate(['/privacidade']);
  }

  async alterarSenha() {
    const alert = await this.alertCtrl.create({
      header: 'Alterar Senha',
      inputs: [
        { name: 'atual', type: 'password', placeholder: 'Senha atual' },
        { name: 'nova',  type: 'password', placeholder: 'Nova senha'  },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async () => {
            const toast = await this.toastCtrl.create({
              message: 'Senha alterada! ✓', duration: 1500, position: 'bottom',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  async sair() {
    const alert = await this.alertCtrl.create({
      header: 'Sair da conta',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}