// src/app/models/receita.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface Receita {
  id:           string;
  titulo:       string;
  descricao:    string;
  imagemUrl:    string;
  autor:        string;
  autorId:      string;
  autorInicial: string;
  tempo:        string;
  curtidas:     number;
  curtido:      boolean;  // estado local — não persiste no Firestore
  salvo:        boolean;  // estado local — não persiste no Firestore
  ingredientes: string[];
  passos:       string[];
  ativo:        boolean;
  criadoEm:     Timestamp | Date;
}

export interface Notificacao {
  id:             string;
  destinatarioId: string;
  remetenteId:    string;
  remetenteNome:  string;
  remetenteFoto:  string;
  tipo:           'curtida';
  receitaId:      string;
  receitaTitulo:  string;
  lida:           boolean;
  criadoEm:       Timestamp;
}
