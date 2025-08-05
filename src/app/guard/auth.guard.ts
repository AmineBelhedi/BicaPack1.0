
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust the import path as needed
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']); // Redirect to login page
    return of(false);
  }

  // Get expected roles from route data
  const expectedRoles = route.data['roles'] as string[];

  return authService.getProfile().pipe(
    map(profile => {
      if (expectedRoles && expectedRoles.length > 0) {
        // Check if user's role is included in the expected roles
        const hasRole = expectedRoles.includes(profile.role);
        if (hasRole) {
          return true; // User has the required role
        } else {
          router.navigate(['/auth/access']); // Redirect to forbidden page
          return false; // User does not have the required role
        }
      }
      return true; // No specific role required, just ensure the user is logged in
    }),
    catchError(error => {
      console.error('Role check error', error);
      router.navigate(['/auth/login']); // Redirect to login page
      return of(false);
    })
  );
};
