import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, doc, addDoc, setDoc, updateDoc,
  deleteDoc, getDoc, getDocs, query, where, orderBy,
  limit, serverTimestamp, increment, runTransaction
} from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Receita } from '../models/receita.model';

@Injectable({ providedIn: 'root' })
export class ReceitaService {
  private firestore = inject(Firestore);
  private auth      = inject(Auth);
  private storage   = inject(Storage);

  private get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  // ── LEITURA E LISTAGEM ─────────────────────────────────────

  async buscarPorId(id: string): Promise<Receita | null> {
    try {
      const snap = await getDoc(doc(this.firestore, 'receitas', id));
      if (!snap.exists()) return null;
      const receita = { id: snap.id, ...snap.data(), curtido: false, salvo: false } as Receita;
      if (this.uid) await this.preencherEstadoLocal([receita]);
      return receita;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async listar(): Promise<Receita[]> {
    const q = query(collection(this.firestore, 'receitas'), where('ativo', '==', true), orderBy('criadoEm', 'desc'), limit(30));
    const snap = await getDocs(q);
    const receitas = snap.docs.map(d => ({ id: d.id, ...d.data(), curtido: false, salvo: false } as Receita));
    if (this.uid && receitas.length > 0) await this.preencherEstadoLocal(receitas);
    return receitas;
  }

  async buscar(termo: string): Promise<Receita[]> {
    if (!termo.trim()) return [];
    const t = termo.toLowerCase().trim();
    const q = query(
      collection(this.firestore, 'receitas'),
      where('ativo', '==', true),
      where('tituloLower', '>=', t),
      where('tituloLower', '<=', t + '\uf8ff'),
      limit(20)
    );
    const snap = await getDocs(q);
    const receitas = snap.docs.map(d => ({ id: d.id, ...d.data(), curtido: false, salvo: false } as Receita));
    if (this.uid && receitas.length > 0) await this.preencherEstadoLocal(receitas);
    return receitas;
  }

  // ── MÉTODOS PARA O PERFIL (OS QUE ESTAVAM A FALTAR) ──────────

  async listarPorAutor(usuarioId: string): Promise<Receita[]> {
    const q = query(
      collection(this.firestore, 'receitas'),
      where('autorId', '==', usuarioId),
      where('ativo', '==', true),
      orderBy('criadoEm', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), curtido: false, salvo: false } as Receita));
  }

  async listarCurtidas(usuarioId: string): Promise<Receita[]> {
    const q = query(
      collection(this.firestore, 'curtidas'),
      where('userId', '==', usuarioId),
      orderBy('criadoEm', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const ids = snap.docs.map(d => d.data()['receitaId'] as string);
    if (ids.length === 0) return [];

    const receitas = await Promise.all(ids.map(id => this.buscarPorId(id)));
    return receitas
      .filter((r): r is Receita => r !== null && r.ativo)
      .map(r => ({ ...r, curtido: true }));
  }

  async listarSalvas(usuarioId: string): Promise<Receita[]> {
    const q = query(
      collection(this.firestore, 'salvos'),
      where('userId', '==', usuarioId),
      orderBy('salvoEm', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const ids = snap.docs.map(d => d.data()['receitaId'] as string);
    if (ids.length === 0) return [];

    const receitas = await Promise.all(ids.map(id => this.buscarPorId(id)));
    return receitas
      .filter((r): r is Receita => r !== null && r.ativo)
      .map(r => ({ ...r, salvo: true }));
  }

  // ── ESCRITA E ACÇÕES ───────────────────────────────────────

  async criar(receita: Omit<Receita, 'id' | 'curtidas' | 'curtido' | 'salvo' | 'ativo'>): Promise<string> {
    const uid = this.uid;
    if (!uid) throw new Error('Não autenticado');
    const ref = await addDoc(collection(this.firestore, 'receitas'), {
      ...receita,
      autorId: uid,
      tituloLower: receita.titulo.toLowerCase(),
      curtidas: 0,
      ativo: true,
      criadoEm: serverTimestamp(),
    });
    await updateDoc(doc(this.firestore, 'usuarios', uid), { receitasPostadas: increment(1) });
    return ref.id;
  }

  async curtir(receitaId: string, isCurtido: boolean): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    const curtidaRef = doc(this.firestore, 'curtidas', `${uid}_${receitaId}`);
    const receitaRef = doc(this.firestore, 'receitas', receitaId);
    await runTransaction(this.firestore, async (tx) => {
      if (isCurtido) {
        tx.set(curtidaRef, { userId: uid, receitaId, criadoEm: serverTimestamp() });
        tx.update(receitaRef, { curtidas: increment(1) });
      } else {
        tx.delete(curtidaRef);
        tx.update(receitaRef, { curtidas: increment(-1) });
      }
    });
  }

  async salvar(receitaId: string, isSalvo: boolean): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    const salvoRef = doc(this.firestore, 'salvos', `${uid}_${receitaId}`);
    const userRef  = doc(this.firestore, 'usuarios', uid);
    if (isSalvo) {
      await setDoc(salvoRef, { userId: uid, receitaId, salvoEm: serverTimestamp() });
      await updateDoc(userRef, { receitasSalvas: increment(1) });
    } else {
      await deleteDoc(salvoRef);
      await updateDoc(userRef, { receitasSalvas: increment(-1) });
    }
  }

  // ── IMAGENS E STORAGE ──────────────────────────────────────

  async uploadImagem(path: string, dataUrl: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadString(storageRef, dataUrl, 'data_url');
    return getDownloadURL(storageRef);
  }

  async atualizarImagem(receitaId: string, novaUrl: string): Promise<void> {
    const receitaRef = doc(this.firestore, 'receitas', receitaId);
    await updateDoc(receitaRef, { imagem: novaUrl });
  }

  // ── HELPERS PRIVADOS ───────────────────────────────────────

  private async preencherEstadoLocal(receitas: Receita[]): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    await Promise.all(receitas.map(async (r) => {
      const [cSnap, sSnap] = await Promise.all([
        getDoc(doc(this.firestore, 'curtidas', `${uid}_${r.id}`)),
        getDoc(doc(this.firestore, 'salvos', `${uid}_${r.id}`))
      ]);
      r.curtido = cSnap.exists();
      r.salvo = sSnap.exists();
    }));
  }
}