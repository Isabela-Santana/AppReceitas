import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home', // Redireciona para a home por padrão (o guard cuidará se não estiver logado)
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard], // Se já estiver logado, manda para a home
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard], // Se já estiver logado, manda para a home
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard], // Protege todas as rotas filhas
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'curtidas',
        loadComponent: () =>
          import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
        data: { aba: 'curtidas' }
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
      },
      {
        path: 'receita/:id',
        loadComponent: () =>
          import('./pages/receita/receita.page').then(m => m.ReceitaPage),
      },
      {
        path: 'busca',
        loadComponent: () =>
          import('./pages/busca/busca.page').then(m => m.BuscaPage),
      },
      {
        path: 'nova-receita',
        loadComponent: () =>
          import('./pages/nova-receita/nova-receita.page').then(m => m.NovaReceitaPage),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage),
      },
      {
        // Movida para dentro das tabs para manter a navegação consistente
        path: 'notificacoes',
        loadComponent: () =>
          import('./pages/notificacoes/notificacoes.page').then(m => m.NotificacoesPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  // Páginas externas mas que precisam de login
  {
    path: 'editar-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editar-perfil/editar-perfil.page').then(m => m.EditarPerfilPage),
  },
  {
    path: 'termos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/termos/termos.page').then(m => m.TermosPage),
  },
  {
    path: 'privacidade',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/privacidade/privacidade.page').then(m => m.PrivacidadePage),
  },
  // Wildcard: se a rota não existir, tenta jogar para o início das tabs
  {
    path: '**',
    redirectTo: 'tabs/home',
  },
];