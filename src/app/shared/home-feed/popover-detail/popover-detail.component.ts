import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-popover-detail',
  templateUrl: './popover-detail.component.html',
  styleUrls: ['./popover-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopoverDetailComponent implements OnInit {
  @Input() data: any;
  author: string = '';
  followers: any = [];
  followers_info: any = [];
  is_following: boolean = false;
  auth_username: any = '';
  twitter_verification_enable : boolean = false;
  constructor(private _globals: GlobalService, private _auth: AuthService) { }

  ngOnInit() {
    this.auth_username = this._auth.authorName;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
    if(this.data){
      if(this.data.author_accounts.author_profile === undefined){
        this.data.author_accounts.author_profile = this.data.author_accounts.author_metadata;
      }
      
      this.author = this.data.author ? this.data.author : this.data.author_accounts.author;
      if (this.data.author_accounts.author_profile.profile && typeof this.data.author_accounts.author_profile.profile.about !== "undefined") {
        this.data.author_accounts.author_profile.profile.about = this._globals.limitString(this.data.author_accounts.author_profile.profile.about, 55);
      }
    }
    this.checkIfAuthorIsFollowed();
    this.getAuthorFollowers();
  }

  getAuthorFollowers() {
    let follower_limit = this._globals.ENV.POPOVER_FOLLOWER_LIMIT;
    this._auth.getFollowers(this.author, follower_limit).subscribe((res: any) => {
      if (res.status === 200) {
        let followers = res.data;
        this.followers_info = followers;
        this.followers_info.forEach((follower, i) => {
          let profile_pic = '';
          if(follower.metadata !== undefined && follower.metadata.profile_image !== undefined){
            profile_pic = this._globals.ENV.STEEMIT_IMAGE_URL + follower.metadata.profile_image;
          }
          this.followers_info[i].author_profile_pic = profile_pic;
        });
      }
    });
  }

  checkIfAuthorIsFollowed(){
    if(this.auth_username){
      this._auth.isFollowing(this.author, this.auth_username).subscribe((res: any) => {
        if (res.status == 200) {
          this.is_following = res.data;
        }
      });
    }
  }
}
