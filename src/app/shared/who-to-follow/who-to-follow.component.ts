import { Component, OnInit, Input } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { PostService } from 'src/app/globals/post.service';
@Component({
  selector: 'app-who-to-follow',
  templateUrl: './who-to-follow.component.html',
  styleUrls: ['./who-to-follow.component.scss'],
})
export class WhoToFollowComponent implements OnInit {
  @Input() data : any;
  @Input() showtofollow : boolean;
  limit: number = 0;
  follow_list: any = [];
  fetching: boolean = false;
  auth_username: string = '';
  twitter_verification_enable : boolean = false;

  constructor(private _feed: FeedService, private _global: GlobalService, 
    private _auth: AuthService, private _post: PostService) { 
    this.limit = this._global.ENV.TO_FOLLOW_LIMIT;
    this.twitter_verification_enable = this._global.ENV.TWITTER_VERIFICATON_ENABLE;
  }

  ngOnInit() {
    if (this.data) {
      let auth = this.data.auth;
      this.auth_username = auth.auth_username;
    } else {
      this.auth_username = this._auth.authorName;
    }
    this.getWhotofollow();
  }

  getWhotofollow(){
    if(this.auth_username){
      this.fetching = true;
      this._feed.getWhoToFollow(this.auth_username,this.limit).subscribe((res:any) => {
        if(res.status === 200){
          this.follow_list = res.data;
        }
        this.fetching = false;
      });
    }
  }

  followAuthor(data:any,i:number){
    data.is_following = true;
    data.followed = false;
    let param = { author: data.author };
    this._post.followAuthor(param).subscribe((res:any) => {
      data.is_following = false;
      if(res.status === 200){
        data.followed = true;
        this._global.toastFire('Followed successfully','success');
      }else{
        this._global.toastFire(res.data,'error');
      }
    });
  }

  showMore(){
      this._global.ROUTER.navigate(['/tofollow']);
  }
}
