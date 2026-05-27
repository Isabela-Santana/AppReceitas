// src/app/guards/guest-guard.ts
// Impede que usuários já logados acessem login/cadastro
// Se logado, redireciona para /tabs/home

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map(u => u ? router.createUrlTree(['/tabs/home']) : true)
  );
};
