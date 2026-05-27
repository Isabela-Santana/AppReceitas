import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonButton, IonInput, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, restaurantOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonSpinner,
  ],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, restaurantOutline });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (err: any) {
      const alert = await this.alertCtrl.create({
        header: 'Erro ao entrar',
        message: err?.message || 'Email ou senha incorretos.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.loading = false;
    }
  }

  async onForgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Recuperar senha',
      inputs: [{ name: 'email', type: 'email', placeholder: 'Seu email' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Enviar', handler: async (data) => { await this.authService.resetPassword(data.email); } },
      ],
    });
    await alert.present();
  }
}