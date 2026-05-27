// src/app/pages/editar-perfil/editar-perfil.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonAvatar, IonInput, IonTextarea, IonButton, IonIcon,
  ActionSheetController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, imagesOutline, trashOutline, close } from 'ionicons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonAvatar, IonInput, IonTextarea, IonButton, IonIcon,
  ],
})
export class EditarPerfilPage implements OnInit {

  nome:     string = '';
  username: string = '';
  email:    string = '';
  bio:      string = '';
  fotoUrl:  string = '';
  salvando  = false;

  private authService     = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl       = inject(ToastController);

  constructor() {
    addIcons({ cameraOutline, imagesOutline, trashOutline, close });
  }

  async ngOnInit() {
    const usuario = await this.authService.getUsuarioAtual();
    if (usuario) {
      this.nome     = usuario.nome;
      this.username = usuario.username;
      this.email    = usuario.email;
      this.bio      = usuario.bio;
      this.fotoUrl  = usuario.fotoUrl || '';
    }
  }

  async alterarFoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      cssClass: 'wine-action-sheet',
      buttons: [
        {
          text: 'Escolher da Galeria',
          icon: 'images-outline',
          handler: () => this.selecionarArquivo(),
        },
        {
          text: 'Remover Foto',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => { this.fotoUrl = ''; },
        },
        { text: 'Cancelar', icon: 'close', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private selecionarArquivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file: File = e.target.files[0];
      if (!file) return;
      // Converte para Data URL para preview local
      const reader = new FileReader();
      reader.onload = (ev) => { this.fotoUrl = ev.target?.result as string; };
      reader.readAsDataURL(file);
      // Para upload real no Firebase Storage, use o StorageService aqui
    };
    input.click();
  }

  async salvar() {
    this.salvando = true;
    try {
      await this.authService.atualizarPerfil({
        nome:     this.nome,
        username: this.username,
        bio:      this.bio,
      });

      if (this.fotoUrl && this.fotoUrl.startsWith('data:')) {
        await this.authService.atualizarFoto(this.fotoUrl);
      }

      const toast = await this.toastCtrl.create({
        message:  'Perfil atualizado com sucesso! ✓',
        duration: 2000,
        color:    'dark',
        position: 'bottom',
      });
      await toast.present();
    } catch (err: any) {
      const toast = await this.toastCtrl.create({
        message:  err?.message || 'Erro ao salvar perfil.',
        duration: 2000,
        color:    'danger',
        position: 'bottom',
      });
      await toast.present();
    } finally {
      this.salvando = false;
    }
  }
}
