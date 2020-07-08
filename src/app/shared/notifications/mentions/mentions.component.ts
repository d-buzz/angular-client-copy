import { Component, OnInit, HostListener } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.scss']
})
export class MentionsComponent implements OnInit {
  notifs: any = [];
  fetching: boolean = false;
  auth_username: any = null;
  limit: number = 20;
  offset: number = 0;
  total_count: number = 0;
  fetched_all: boolean = false;
  twitter_verification_enable : boolean = false;

  constructor(private _auth: AuthService, private _feeds: FeedService, private _globals: GlobalService) {
    this.auth_username = this._auth.authorName;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
  }

  @HostListener('window:scroll', ['$event'])
  ngOnInit() {
    this.getMentions();
  }

  getMentions() {
    if(this.total_count !== 0){
      if(this.notifs.length >= this.total_count){
        this.fetched_all = true;
      }else{
        this.limit += 10;
      }
    }
    
    if(!this.fetched_all){
      this.fetching = true;
      this._feeds.getMentions(this.auth_username, this.limit, this.offset).subscribe((res: any) => {
        this.fetching = false;
        if (res.status === 200 && res.count > 0) {
          this.total_count = res.count;
          this.notifs = res.data;
        }
      });
    }
  }

}
