import { Component, OnInit } from '@angular/core';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-notificationsnav',
  templateUrl: './notificationsnav.component.html',
  styleUrls: ['./notificationsnav.component.scss']
})
export class NotificationsnavComponent implements OnInit {

  constructor(private _routingState: RoutingStateService, private _global: GlobalService, private _auth: AuthService) { }

  ngOnInit() {
  }

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._global.ROUTER.navigate([backurl]);
  }

  markAllAsRead(){
    this._auth.notifAllMarkAsRead().subscribe((res:any) => {
      if(res.status === 400){
        this._global.toastFire('Failed to change status',400);
      }else{
        location.reload()
      }
    });
  }

  clearAll(){
    this._auth.notifClearAll().subscribe((res:any) => {
      if(res.status === 400){
        this._global.toastFire('Failed to change status',400);
      }else{
        location.reload()
      }
    });
  }
}
