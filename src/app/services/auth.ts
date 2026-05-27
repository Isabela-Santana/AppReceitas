// src/app/services/auth.ts
// Serviço de autenticação com Firebase Authentication + Firestore

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth      = inject(Auth);
  private firestore = inject(Firestore);
  private router    = inject(Router);

  // Observable do usuário Firebase — componentes podem se inscrever
  readonly firebaseUser$ = user(this.auth);

  get uidAtual(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  // ── LOGIN ────────────────────────────────────────────────
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  // ── CADASTRO ─────────────────────────────────────────────
  async register(nome: string, email: string, password: string, username: string = ''): Promise<void> {
    // 1. Cria o usuário no Firebase Authentication
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // 2. Atualiza o displayName
    await updateProfile(cred.user, { displayName: nome });

    // 3. Gera as iniciais automaticamente
    const iniciais = nome.split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');

    // 4. Cria o documento do usuário no Firestore
    const usernameFormatado = username.toLowerCase() || email.split('@')[0].toLowerCase();

    await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
      uid:              cred.user.uid,
      nome,
      username:         usernameFormatado,
      email,
      fotoUrl:          null,
      iniciais,
      bio:              '',
      receitasPostadas: 0,
      receitasCurtidas: 0,
      receitasSalvas:   0,
      seguidores:       0,
      notificacoes:     0,
      criadoEm:         serverTimestamp(),
      atualizadoEm:     serverTimestamp(),
    });

    // 5. Reserva o username (para evitar duplicatas)
    if (usernameFormatado) {
      await setDoc(doc(this.firestore, 'usernames', usernameFormatado), {
        uid: cred.user.uid,
      });
    }
  }

  // ── LOGOUT ───────────────────────────────────────────────
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // ── RECUPERAR SENHA ──────────────────────────────────────
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  // ── BUSCAR USUÁRIO ATUAL ─────────────────────────────────
  async getUsuarioAtual(): Promise<Usuario | null> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return null;

    const snap = await getDoc(doc(this.firestore, 'usuarios', uid));
    if (!snap.exists()) return null;

    return { uid: snap.id, ...snap.data() } as Usuario;
  }

  // ── ATUALIZAR FOTO ───────────────────────────────────────
  async atualizarFoto(fotoUrl: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    await updateDoc(doc(this.firestore, 'usuarios', uid), {
      fotoUrl,
      atualizadoEm: serverTimestamp(),
    });

    // Atualiza também no Firebase Auth
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, { photoURL: fotoUrl });
    }
  }

  // ── ATUALIZAR PERFIL ─────────────────────────────────────
  async atualizarPerfil(dados: { nome?: string; username?: string; bio?: string }): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const update: any = { ...dados, atualizadoEm: serverTimestamp() };

    // Recalcula as iniciais se o nome mudou
    if (dados.nome) {
      update.iniciais = dados.nome.split(' ')
        .filter((p: string) => p.length > 0)
        .slice(0, 2)
        .map((p: string) => p[0].toUpperCase())
        .join('');

      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, { displayName: dados.nome });
      }
    }

    await updateDoc(doc(this.firestore, 'usuarios', uid), update);
  }
}
