// src/app/pages/nova-receita/nova-receita.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonInput, IonTextarea, IonSpinner,
  IonBackButton, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, cameraOutline, addCircleOutline, trashOutline
} from 'ionicons/icons';
import { ReceitaService } from '../../services/receita';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-nova-receita',
  templateUrl: './nova-receita.page.html',
  styleUrls: ['./nova-receita.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonInput, IonTextarea, IonSpinner, IonBackButton,
  ],
})
export class NovaReceitaPage {

  form: FormGroup;
  ingredientes: string[] = [''];
  passos: string[] = [''];
  imagemPreview: string | null = null;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private receitaService: ReceitaService,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    addIcons({ checkmarkOutline, cameraOutline, addCircleOutline, trashOutline });
    
    this.form = this.fb.group({
      titulo:    ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', Validators.required],
      tempo:     ['', Validators.required],
    });
  }

  // ── CONTROLE DINÂMICO DE INPUTS ──

  trackByIndex(index: number): number {
    return index;
  }

  onIngredienteChange(index: number, event: any) {
    this.ingredientes[index] = event.detail.value ?? '';
  }

  onPassoChange(index: number, event: any) {
    this.passos[index] = event.detail.value ?? '';
  }

  adicionarIngrediente() {
    this.ingredientes = [...this.ingredientes, ''];
  }

  removerIngrediente(i: number) {
    this.ingredientes = this.ingredientes.filter((_, idx) => idx !== i);
  }

  adicionarPasso() {
    this.passos = [...this.passos, ''];
  }

  removerPasso(i: number) {
    this.passos = this.passos.filter((_, idx) => idx !== i);
  }

  escolherFoto() {
    // Placeholder para integração com Camera do Capacitor
    this.imagemPreview = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
  }

  // ── LÓGICA DE SALVAMENTO ──

  async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ingredientesValidos = this.ingredientes.filter(i => i && i.trim());
    const passosValidos = this.passos.filter(p => p && p.trim());

    if (ingredientesValidos.length === 0 || passosValidos.length === 0) {
      this.exibirToast('Adicione pelo menos 1 ingrediente e 1 passo.', 'warning');
      return;
    }

    this.salvando = true;
    try {
      // 1. Busca dados do usuário logado
      const usuario = await this.authService.getUsuarioAtual();
      
      // 2. Monta o objeto de dados (usamos any para evitar conflitos de tipos da Interface)
      const dadosReceita: any = {
        titulo:       this.form.value.titulo,
        descricao:    this.form.value.descricao,
        tempo:        this.form.value.tempo,
        imagemUrl:    this.imagemPreview || 'https://via.placeholder.com/400x200?text=Receita',
        autor:        usuario?.nome || 'Anônimo',
        autorId:      usuario?.uid || '0',
        autorInicial: usuario?.iniciais || 'AN',
        ingredientes: ingredientesValidos,
        passos:       passosValidos
      };

      // 3. Chama o serviço (o service injetará 'ativo', 'criadoEm', etc)
      await this.receitaService.criar(dadosReceita as any);

      // 4. Sucesso
      await this.exibirToast('Receita publicada com sucesso!', 'success');
      this.router.navigate(['/tabs/home'], { replaceUrl: true });

    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      this.exibirToast('Erro ao publicar. Verifique sua conexão.', 'danger');
    } finally {
      this.salvando = false;
    }
  }

  private async exibirToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: cor,
      cssClass: cor === 'success' ? 'toast-vinho' : ''
    });
    await toast.present();
  }
}