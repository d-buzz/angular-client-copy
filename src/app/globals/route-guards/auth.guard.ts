import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from '../global.service';
import { RoutingStateService } from '../routing-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _auth: AuthService, private _globals: GlobalService,
    private _routingState: RoutingStateService) {
  }

  canActivate(): boolean {
    this._routingState.loadRouting();
    if (!this._auth.hasToken) {
      this._globals.ROUTER.navigate(['/login']);
      return false;
    }
    return true;
  }
}
