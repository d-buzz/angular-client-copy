import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { RoutingStateService } from 'src/app/globals/routing-state.service';

@Component({
  selector: 'app-profilenav',
  templateUrl: './profilenav.component.html',
  styleUrls: ['./profilenav.component.scss']
})
export class ProfilenavComponent implements OnInit {
  @Input() profile : any;

  constructor(private _routingState: RoutingStateService, private _globals: GlobalService) {
  }

  ngOnInit() {}

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._globals.ROUTER.navigate([backurl]);
  }
}
