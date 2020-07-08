import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { PostService } from 'src/app/globals/post.service';

@Component({
  selector: 'app-more-who-to-follow',
  templateUrl: './more-who-to-follow.component.html',
  styleUrls: ['./more-who-to-follow.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MoreWhoToFollowComponent implements OnInit {

  follow_list: any = [];
  fetching: boolean = false;
  auth_username: string = '';
  twitter_verification_enable : boolean = false;

  constructor(private _feed: FeedService, private _global: GlobalService, 
    private _auth: AuthService, private _post: PostService) { }

  ngOnInit() {
    this.twitter_verification_enable = this._global.ENV.TWITTER_VERIFICATON_ENABLE;
    this.auth_username = this._auth.authorName;
    this.getWhotofollow();
  }

  getWhotofollow(){
    if(this.auth_username){
      this.fetching = true;
      this._feed.getWhoToFollow(this.auth_username,100).subscribe((res:any) => {
        if(res.status === 200){
          this.follow_list = res.data;
        }
        this.fetching = false;
      });
    }
  }

  
  followAuthor(data:any,i:number){
    data.is_following = true;
    let param = { author: data.author };
    this._post.followAuthor(param).subscribe((res:any) => {
      data.is_following = false;
      data.followed = false;
      if(res.status === 200){
        data.followed = true;
        this._global.toastFire('Followed successfully','success');
      }else{
        this._global.toastFire(res.data,'error');
      }
    });
  }
}
