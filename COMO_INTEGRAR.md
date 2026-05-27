# ✅ Como integrar o Firebase ao AppReceitas

## O que já está feito neste projeto:
- `src/main.ts` — Firebase Auth + Firestore + Storage configurados
- `src/app/services/auth.ts` — Login, cadastro, logout, recuperar senha, atualizar perfil
- `src/app/services/receita.ts` — Listar, criar, curtir, salvar, buscar, deletar
- `src/app/guards/auth-guard.ts` — Proteção de rotas real
- `src/app/models/` — Interfaces atualizadas
- `src/app/pages/notificacoes/` — Carrega do Firestore
- `src/app/pages/editar-perfil/` — Salva no Firestore
- `firestore.rules` — Regras de segurança prontas

## O único passo que VOCÊ precisa fazer:

### Colocar as suas credenciais Firebase em:
`src/environments/environment.ts`

As credenciais já estão no arquivo — só verifique se são as suas.

---

## Índice de erros comuns e como resolver

### Erro: "Missing or insufficient permissions"
→ Você não publicou as regras do Firestore ainda.
→ Veja o Passo 3 abaixo.

### Erro: "auth/operation-not-allowed"
→ O método Email/Senha não está ativo no Firebase Console.
→ Veja o Passo 2 abaixo.

### Erro: "@angular/fire/storage not found"
→ Rode: npm install @angular/fire firebase

---

## Passo 1 — Verificar se o @angular/fire está instalado

Abra o terminal no VS Code (Ctrl + `) e rode:
```
npm install
```
Se aparecer erro de "@angular/fire/auth not found", rode também:
```
npm install @angular/fire@latest firebase@latest
```

## Passo 2 — Ativar Email/Senha no Firebase Console

1. Acesse https://console.firebase.google.com
2. Clique no seu projeto "app-receitas-f059b"
3. Menu lateral → Authentication → Começar
4. Aba "Método de login" → Email/senha → Ativar → Salvar

## Passo 3 — Publicar as Regras do Firestore

1. No Firebase Console → Firestore Database → aba "Regras"
2. Apague o conteúdo atual
3. Copie TODO o conteúdo do arquivo `firestore.rules` deste projeto
4. Cole e clique em "Publicar"

## Passo 4 — Testar

No terminal:
```
ionic serve
```

Teste na ordem:
1. Criar uma conta (Register)
2. Fazer login
3. Criar uma receita
4. Curtir uma receita
5. Verificar no Firebase Console → Firestore → as collections aparecem
