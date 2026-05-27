import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  query, 
  orderBy 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Receita } from '../models/receita.model';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  // Injeção correta para evitar erros de contexto
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  listar(): Observable<Receita[]> {
    // 1. Referência da coleção no Firebase
    const receitasRef = collection(this.firestore, 'receitas');
    
    // 2. Criar a consulta (Aqui é onde o INDEX que o Firebase pediu trabalha)
    const q = query(receitasRef, orderBy('titulo', 'asc'));

    // 3. Retorna os dados em tempo real
    return collectionData(q, { idField: 'id' }) as Observable<Receita[]>;
  }
}