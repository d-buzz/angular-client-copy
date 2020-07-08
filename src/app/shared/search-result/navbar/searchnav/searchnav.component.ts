import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-searchnav',
  templateUrl: './searchnav.component.html',
  styleUrls: ['./searchnav.component.scss']
})
export class SearchnavComponent implements OnInit {
  @Input() query: any = null;
  @Output() startSearch = new EventEmitter();
  search_key: FormControl = new FormControl();
  
  constructor(private _routingState: RoutingStateService, private _globals: GlobalService) {
  }

  ngOnInit() {

  }

  lookupItems(){
    this.startSearch.emit(this.search_key.value);
  }

  backUrl(){
    let backurl = this._routingState.getPreviousUrl();
    this._globals.ROUTER.navigate([backurl]);
  }
}
