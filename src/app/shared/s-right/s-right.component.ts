import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { GlobalService } from 'src/app/globals/global.service';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { FormControl } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-s-right',
  templateUrl: './s-right.component.html',
  styleUrls: ['./s-right.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SRightComponent implements OnInit {
  @Input() showtrends: boolean;
  @Input() showtofollow: boolean;
  @Input() data: any;
  tags: any = [];
  fetching: boolean = false;
  limit: number = 0;
  search_key: FormControl = new FormControl();
  is_searching: boolean = false;
  navigationSubscription: any;

  constructor(private _feed: FeedService, private _global: GlobalService,
    private _routingState: RoutingStateService, private router: Router) {
    this.limit = this._global.ENV.TREND_TAGS_LIMIT;
    if (this.showtrends === undefined) {
      this.showtrends = true;
    }

    if (this.showtofollow === undefined) {
      this.showtofollow = true;
    }

    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        let getUrl = this._global.ROUTER_STATE;
        if (getUrl) {
          if (getUrl[1] !== undefined) {
            let current_url = getUrl[1];
            this.is_searching = current_url === 'search-results';
          }
        }
      }
    });
  }

  ngOnInit() {
    this.getTrendingTags();
  }

  getTrendingTags() {
    this.fetching = true;
    this._feed.getTrendingTags(this.limit).subscribe((res: any) => {
      this.fetching = false;
      if (res.status === 200) {
        this.tags = res.data;
      }
    });
  }

  gotoTrends() {
    this._global.ROUTER.navigate(['/trends']);
  }

  searchItems() {
    let search_key = this.search_key.value;
    if (search_key !== null) {
      this._routingState.saveSearchkey(search_key);
      this._global.ROUTER.navigate(['/search-results']);
    }
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
