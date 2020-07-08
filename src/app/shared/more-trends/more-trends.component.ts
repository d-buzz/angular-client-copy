import { Component, OnInit } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { GlobalService } from 'src/app/globals/global.service';
import { RoutingStateService } from 'src/app/globals/routing-state.service';

@Component({
  selector: 'app-more-trends',
  templateUrl: './more-trends.component.html',
  styleUrls: ['./more-trends.component.scss']
})
export class MoreTrendsComponent implements OnInit {
  tags:any = [];
  fetching: boolean = false;
  constructor(private _feed: FeedService, private _global: GlobalService) { 
  }

  ngOnInit() {
    this.getTrendingTags();
  }

  getTrendingTags(){
    this.fetching = true;
    this._feed.getTrendingTags(100).subscribe((res:any) => {
      this.fetching = false;
      if(res.status === 200){
        this.tags = res.data;
      }else{
        this._global.toastFire('Failed to fetch tags', 'error');
      }
    });
  }
}
