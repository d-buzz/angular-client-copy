import { Component, OnInit } from '@angular/core';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-moretrendsnav',
  templateUrl: './moretrendsnav.component.html',
  styleUrls: ['./moretrendsnav.component.scss']
})
export class MoretrendsnavComponent implements OnInit {

  constructor(private _routingState: RoutingStateService, private _global: GlobalService) { }

  ngOnInit() {
  }

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._global.ROUTER.navigate([backurl]);
  }

}
