import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from 'src/app/globals/post.service';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-view-upvotes',
  templateUrl: './view-upvotes.component.html',
  styleUrls: ['./view-upvotes.component.scss']
})
export class ViewUpvotesComponent implements OnInit {
  @Input() data;
  auth_username: string = '';
  limit: number = 10;
  offset: number = 0;
  showing: boolean = false;
  count: number = 0;
  upvoters: any = [];
  show_more: boolean = false;
  voters: any = [];
  mapped_voters: any = [];
  twitter_verification_enable : boolean = false;
  
  constructor(public activeModal: NgbActiveModal, private _post: PostService, 
    private _globals: GlobalService, private _auth: AuthService) {
      this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
    }

  ngOnInit() {
    this.auth_username = this._auth.authorName;
    if(this.data.length > 0){
      this.data.forEach(voter => {
        if(parseInt(voter.rshares) > 0){
          this.voters.push(voter.voter);
        }
      });
      this.count = this.voters.length;
      this.mapAuthorAccounts();
      if(this.count > this.limit){
        this.show_more = true;
      }
    }
  }

  mapAuthorAccounts(){
    this.showing = true;
    let voters = { usernames: JSON.stringify(this.voters) };
    this._auth.getMultipleAuthorMetadata(voters).subscribe((res:any) => {
      if(res.status === 200 && res.data.length > 0){
        let ind = 0;
        res.data.forEach(info => {
          let mapped = {};
          if(info.json_metadata){
            let metadata = JSON.parse(info.json_metadata);
            if(metadata && metadata.profile){
              let profile = metadata.profile;
              let author_name = info.name;
              if(profile.name !== undefined){
                author_name = profile.name;
              } 
              mapped = {
                author: info.name,
                author_name: author_name,
                author_about: profile.about ? this._globals.limitString(profile.about,80) : '',
                author_profile_pic: profile.profile_image ? this._globals.ENV.STEEMIT_IMAGE_URL + profile.profile_image : profile.profile_image,
                is_verified: info.is_verified
              }
            }else{
              mapped = {
                author: info.name,
                author_name: info.name,
                author_about: '',
                author_profile_pic: '',
                is_verified: info.is_verified
              }
            }
          }else{
            mapped = {
              author: info.name,
              author_name: info.name,
              author_about: '',
              author_profile_pic: '',
              is_verified: info.is_verified
            }
          }

          let account:any = {}
          account.author_accounts = mapped
          this._auth.isFollowing(info.name, this.auth_username).subscribe((res1: any) => {
            account.voter_is_followed = false;
            if (res1.status == 200) {
              account.voter_is_followed = res1.data;
            }
            this.mapped_voters.push(account);
            ind++;
            if(ind === res.data.length){
              this.showing = false;
              this.loadData(this.limit);
            }
          });
        });
      }else{
        this.showing = false;
        this._globals.toastFire('Failed to fetch data from HIVE API','error');
      }
    });
  }


  loadData(limit){
    this.upvoters = this.mapped_voters.slice(this.offset,limit);
    if(this.limit >= this.count){
      this.show_more = false;
    }
  }

  follow(data:any){
    data.is_following = true;
    let param = { author: data.author_accounts.author };
    if(data.voter_is_followed){
      this._post.unfollowAuthor(param).subscribe((res:any) => {
        data.is_following = false;
        if(res.status === 200){
          data.voter_is_followed = false;
          this._globals.toastFire('Unfollowed successfully','success');
        }else{
          this._globals.toastFire(res.data,'error');
        }
      });
    }else{
      this._post.followAuthor(param).subscribe((res:any) => {
        data.is_following = false;
        if(res.status === 200){
          data.voter_is_followed = true;
          this._globals.toastFire('Followed successfully','success');
        }else{
          this._globals.toastFire(res.data,'error');
        }
      });
    }
  }

  gotoProfile(author){
    this.activeModal.dismiss('Cross click')
    this._globals.ROUTER.navigate(['/profile',author]);
  }

  showMore(){
    this.showing = true;
    if(this.count > this.limit){
      this.limit += 5;
      if(this.limit > this.count){
        this.limit = this.count;
      }
      this.loadData(this.limit);
      this.showing = false;
    }else{
      this.showing = false;
    }
  }
}
