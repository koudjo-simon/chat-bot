import { CanActivateFn } from '@angular/router';
import { NavigationService } from '../navigation.service';
import { inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const navService = inject(NavigationService);
  if (!navService.isAuthenticated()) {
    navService.logout();
    return false;
  }
  return true;
};
