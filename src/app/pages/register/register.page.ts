// src/app/pages/register/register.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonButton, IonInput, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, atOutline, mailOutline,
  lockClosedOutline, eyeOutline, eyeOffOutline,
  restaurantOutline, arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const p = control.get('password')?.value;
  const c = control.get('confirmPassword')?.value;
  return p === c ? null : { senhasDiferentes: true };
}

function semEspacosValidator(control: AbstractControl): ValidationErrors | null {
  return /\s/.test(control.value) ? { temEspaco: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonContent, IonButton, IonInput, IonIcon, IonSpinner,
  ],
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  showPassword = false;
  showConfirm  = false;
  loading      = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      personOutline, atOutline, mailOutline,
      lockClosedOutline, eyeOutline, eyeOffOutline,
      restaurantOutline, arrowBackOutline
    });
  }

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        nome:            ['', [Validators.required, Validators.minLength(2)]],
        username:        ['', [Validators.required, Validators.minLength(3), semEspacosValidator]],
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: senhasIguaisValidator }
    );
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm()  { this.showConfirm  = !this.showConfirm; }

  async onRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const { nome, username, email, password } = this.registerForm.value;
    try {
      await this.authService.register(nome, email, password, username);
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (err: any) {
      const alert = await this.alertCtrl.create({
        header: 'Erro ao criar conta',
        message: err?.message || 'Não foi possível criar a conta.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.loading = false;
    }
  }
}