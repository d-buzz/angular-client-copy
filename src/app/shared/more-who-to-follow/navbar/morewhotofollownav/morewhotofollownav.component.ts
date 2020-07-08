import { Component, OnInit } from '@angular/core';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-morewhotofollownav',
  templateUrl: './morewhotofollownav.component.html',
  styleUrls: ['./morewhotofollownav.component.scss']
})
export class MorewhotofollownavComponent implements OnInit {

  constructor(private _routingState: RoutingStateService, private _global: GlobalService) { }

  ngOnInit() {
  }

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._global.ROUTER.navigate([backurl]);
  }
}
