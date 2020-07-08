import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';
import { FeedService } from 'src/app/globals/feed.service';
import { TwitterService } from 'src/app/globals/twitter.service';

@Component({
  selector: 'app-main-profile',
  templateUrl: './main-profile.component.html',
  styleUrls: ['./main-profile.component.scss']
})
export class MainProfileComponent implements OnInit {
  profile: any = [];
  username: any = '';
  auth_username: any = '';
  following: boolean = false;
  fetching: boolean = false;

  constructor(private _auth: AuthService, private _globals: GlobalService, private _feed: FeedService, private _twitter: TwitterService) {
    let getUrl = this._globals.ROUTER_STATE;
    if (getUrl && getUrl[2]) {
      this.username = getUrl[2].replace('@','');
      this.profile.username = this.username;
    }
    this.auth_username = this._auth.authorName;
  }

  ngOnInit() {
    if (!this.username) {
      this.getProfileMetadata();
    } else {
      if (this.username === this.auth_username) {
        this.getProfileMetadata();
      } else {
        this.getAuthorDataFromApi();
      }
    }
  }

  getAuthorDataFromApi(){
    this.fetching = true;
    this._auth.getAuthorMetadata(this.username).subscribe((res: any) => {
      if (res.status === 200) {
        this.mapAccount(res.data);
      } else {
        this.fetching = false;
        this._globals.toastFire('No data fetched for this user from HIVE API', 'error');
        setTimeout(() => {
         this.getAuthorDataFromApi();
        }, 3000);
      }
    });
  }
  getProfileMetadata() {
    let metadata = this._auth.getSteemconnectData();
    if (metadata) {
      this.username = metadata.name;
      let profile_name = this.username;
      if(metadata.json_metadata){
        let json_metadata = JSON.parse(metadata.json_metadata);
        if(json_metadata && json_metadata.profile){
          let profile = json_metadata.profile;
          this.profile = profile;
          if(profile.name){
            profile_name = profile.name
          }
        }
      }

      this.profile.name = profile_name;
      this.profile.username = this.username;
      this.profile.profile_image = this._auth.getProfileImage(this.profile.username);
      this.profile.cover_image = this._auth.getCoverImage(this.profile.username);
      this.profile.joined_date = metadata.created;
      this.profile.is_verified = metadata.is_verified;
      this.profile.follower_count = metadata.follower_count;
      this.profile.following_count = metadata.following_count;
      this.profile.twitter_account = metadata.twitter_account;
      this.getFollowCounter();
      this.checkIfAuthIsFollowed();
      this.getSaysCount();
      this.getCurrentVotingPower();
      this.checkIfAuthorIsFollowed();
      this.checkIfVerified();
    }
  }

  getProfileImage(){
    this._auth.getImageLinks(this.profile.username).subscribe((res:any) => {
      if(res.status === 200){
        this.profile.profile_image = res.data.profile_image;
        this.profile.cover_image = res.data.cover_image;
      }
    });
  }
  
  mapAccount(data: any) {
    let profile:any = {};
    let account = data[0];
    let profile_name = this.username;
    if (account) {
      if (account.json_metadata) {
        let metadata = JSON.parse(account.json_metadata);
        if (metadata && metadata.profile) {
          profile = metadata.profile;
        }
      }else{
        if (account.posting_json_metadata) {
          let metadata = JSON.parse(account.posting_json_metadata);
          if (metadata && metadata.profile) {
            profile = metadata.profile;
          }
        }
      }

      if(profile){
        this.profile = profile;
        if (profile.name) {
          profile_name = profile.name;
        }
        if (profile.profile_image) {
          this.profile.profile_image = this._globals.ENV.STEEMIT_IMAGE_URL + profile.profile_image;
        }
        if (profile.cover_image) {
          this.profile.cover_image = this._globals.ENV.STEEMIT_IMAGE_URL + profile.cover_image
        }
      }
      this.profile.username = this.username;
      this.profile.name = profile_name;
      if(!this.profile.profile_image || !this.profile.cover_image){
        this.getProfileImage();
      }
      this.profile.is_verified = account.is_verified;
      this.profile.twitter_account = account.twitter_account;
      this.profile.joined_date = account.created;
      this.checkIfAuthIsFollowed();
      this.getFollowCounter();
    }
  }

  checkIfAuthIsFollowed() {
    this._auth.isFollowing(this.auth_username, this.username).subscribe((res: any) => {
      if (res.status == 200) {
        this.profile.auth_is_followed = res.data;
      }
    });
  }

  getFollowCounter() {
    if (this.profile) {
      this._auth.getFollowCounter(this.profile.username).subscribe((res: any) => {
        this.fetching = false;
        if (res.status === 200) {
          this.profile.following_count = res.data.following_count;
          this.profile.follower_count = res.data.follower_count;
          this.checkIfVerified();
          this.checkIfAuthorIsFollowed();
          this.getCurrentVotingPower();
          this.getSaysCount();
        } else {
          // this._globals.toastFire('Failed to fetch follow counter from HIVE API', 'error');
         setTimeout(() => {
           this.getFollowCounter();
         }, 3000);
        }
      });
    }
  }

  getCurrentVotingPower() {
    if (this.profile) {
      this._auth.getVotingPower(this.auth_username).subscribe((res: any) => {
        if (res.status === 200) {
          let voting_power: any = res.data;
          if(!voting_power){
            voting_power = 0;
          }
          this.profile.voting_power = voting_power;
          localStorage.setItem('voting_power', voting_power);
        }
      });
    }
  }

  checkIfAuthorIsFollowed() {
    this.profile.is_following = false;
    if (this.username !== this.auth_username) {
      this._auth.isFollowing(this.username, this.auth_username).subscribe((res: any) => {
        if (res.status == 200) {
          this.profile.is_following = res.data;
        }
      });
    }
  }

  getSaysCount() {
    if (this.profile.username) {
      this._feed.getBlogCounter(this.profile.username).subscribe((res: any) => {
        if (res.status === 200) {
          this.profile.post_count = res.data.blogs;
          this.profile.comment_count = res.data.comments
        }
      });
    }
  }

  checkIfVerified() {
    this._twitter.checkIfVerified(this.profile.username).subscribe((res: any) => {
      if (res.status === 200) {
        this.profile.is_verified = res.data;
      }
    });
  }
}
