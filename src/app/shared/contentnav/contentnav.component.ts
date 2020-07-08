import { Component, OnInit } from '@angular/core';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-contentnav',
  templateUrl: './contentnav.component.html',
  styleUrls: ['./contentnav.component.scss']
})
export class ContentnavComponent implements OnInit {

  constructor(private _routingState: RoutingStateService, private _globals: GlobalService) { }

  ngOnInit() {
  }

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._globals.ROUTER.navigate([backurl]);
  }
}
