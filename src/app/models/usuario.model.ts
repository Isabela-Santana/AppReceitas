// src/app/models/usuario.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface Usuario {
  uid:              string;
  nome:             string;
  username:         string;
  email:            string;
  fotoUrl:          string | null;
  iniciais:         string;
  bio:              string;
  receitasPostadas: number;
  receitasCurtidas: number;
  receitasSalvas:   number;
  seguidores:       number;
  notificacoes:     number;
  criadoEm?:        Timestamp;
  atualizadoEm?:    Timestamp;
}

export type UsuarioUpdate = Partial<Pick<Usuario, 'nome' | 'username' | 'bio' | 'fotoUrl'>>;
