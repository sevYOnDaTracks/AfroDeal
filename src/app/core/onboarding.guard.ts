import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { AuthService } from './auth.service';

export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return combineLatest([auth.user$, auth.profile$]).pipe(
    map(([user, profile]) => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }
      if (profile?.profileComplete) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
