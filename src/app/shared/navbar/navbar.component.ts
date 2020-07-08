import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/authentication/auth.service';
import Swal from 'sweetalert2';
import { GlobalService } from 'src/app/globals/global.service';
import { TwitterService } from 'src/app/globals/twitter.service';
import { PostService } from 'src/app/globals/post.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() data : any;
  @Input() feed : any;
  @Output() refreshList = new EventEmitter();
  
  public isCollapsed = true;
  auth_username: string = '';
  auth_profilepic: any = '';
  profile: any = [];
  postModal : any = '';
  is_verified: boolean = false;
  is_subscribed: boolean = false;
  subscribing: boolean = false;
  is_trending_feed: boolean = false;
  twitter_verification_enable : boolean = false;

  constructor(public location: Location, private _auth: AuthService, 
    private _globals: GlobalService, private _twitter: TwitterService, 
    private _post: PostService, private _clipboard: ClipboardService) {

    this.profile = this._auth.authorAccount;
    this.auth_username = this._auth.authorName;
    this.auth_profilepic = this.profile.author_profile_pic;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
  }

  ngOnInit() {
    if(!this._auth.authorName && this.data){
      this.profile = this.data;
      this.auth_username = this.profile.auth.auth_username;
      this.profile.author_name = this.auth_username;
      this.auth_profilepic = this._auth.getProfileImage(this.auth_username);
      if(this.profile.auth.profile_pic === undefined){
        this._auth.getImageLinks(this.auth_username).subscribe((res:any) => {
          if(res.status === 200){
            this.auth_profilepic = res.data.profile_image;
          }
        });
      }
     
    }
    this.is_subscribed = this._auth.isMember;
    if(this.feed == undefined){
      this.feed = 'home';
    }

    let local_sub =  localStorage.getItem('local_subscribed');
    if(!local_sub){
      this.checkIfSubscribed();
    }
    this.getFollowCounter();
    this.checkIfVerified();
  }

  isHome() {
    var titlee = this.location.prepareExternalUrl(this.location.path());

    if (titlee === '#/home') {
      return true;
    }
    else {
      return false;
    }
  }
  isDocumentation() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee === '#/documentation') {
      return true;
    }
    else {
      return false;
    }
  }

  getFollowCounter() {
    if (this.profile) {
      this._auth.getFollowCounter(this.auth_username).subscribe((res: any) => {
        if (res.status === 200) {
          this.profile.following_count = res.data.following_count;
          this.profile.follower_count = res.data.follower_count;
        }
      });
    }
  }

  refreshFeed() {
    this.refreshList.emit(true);
  }

  logout() {
    Swal.fire({
      title: 'Logout dBuzz?',
      text: "You can always log back in at anytime.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Logout'
    }).then((result) => {
      if (result.value) {
        this._auth.logout();
        this._globals.ROUTER.navigate(['/login']);
        this._globals.toastFire('Logged out successfully', 'success');
      }
    })
  }

  gotoTrending(){
    this.isCollapsed = !this.isCollapsed;
    this._globals.ROUTER.navigate(['/home/trending']);
  }

  gotoSearch(){
    this.isCollapsed = !this.isCollapsed;
    this._globals.ROUTER.navigate(['/search-results']);
  }

  gotoLatest(){
    this.isCollapsed = !this.isCollapsed;
    this._globals.ROUTER.navigate(['/home/latest']);
  }

  gotoProfile(){
    this.isCollapsed = !this.isCollapsed;
    this._globals.ROUTER.navigate(['/profile']);
  }

  checkIfVerified() {
    this._twitter.checkIfVerified(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.is_verified = res.data;
      }
    });
  }

  checkIfSubscribed() {
    this._auth.isSubscribed(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.is_subscribed = res.data;
        let is_subscribed: any = res.data ? 1 : 0;
        localStorage.setItem('is_subscribed', is_subscribed);
      }
    });
  }

  subscribeCommunity() {
    this.subscribing = true;
    this._post.subscribeCommunity().subscribe((res: any) => {
      this.subscribing = false;
      if (res.status === 200) {
        this.is_subscribed = true;
        this._globals.toastFire(res.data, 'success');
      } else {
        this._globals.toastFire(res.data, 'error');
      }
    });
  }

  unsubscribeCommunity() {
    Swal.fire({
      title: 'Unsubscribe dBuzz?',
      text: "You can always subscribe back at anytime",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Unsubscribe'
    }).then((result) => {
      if (result.value) {
        this.subscribing = true;
        this._post.unsubscribeCommunity().subscribe((res: any) => {
          this.subscribing = false;
          if (res.status === 200) {
            this.is_subscribed = false;
            this._globals.toastFire(res.data, 'success');
          } else {
            this._globals.toastFire(res.data, 'error');
          }
        });
      }
    })
  }

  verifyAccount() {
    this.checkIfVerified();
    if (this.is_verified) {
      Swal.fire('Your account was already verified');
    } else {
      this._twitter.getGeneratedId(this.auth_username).subscribe((res: any) => {
        if (res.status === 200 && res.data) {
          this._twitter.checkIfHasDuplicate(res.data).subscribe((res2: any) => {
            let has_duplicate = false;
            let dups = res2.data;
            if(res2.status === 200 && dups){
              if((dups.twitter_id !== "" && dups.twitter_id !== null) && dups.is_verified === 0){
                has_duplicate = true;
              }
            }
            if(has_duplicate){
              Swal.fire({
                icon: 'info',
                title: 'Your Account Verification is on progress',
                html: 'This twitter Account: <b>@' + dups.duplicate.screenname + '</b> has been used to verify dBuzz account of <b>('+dups.duplicate.username+').</b> Please use another twitter account. Discover the Buzz on @dbuzzAPP <br/> #Hive: <b>' + res.data + '</b>',
                footer: '<small>To verify your account, copy the generated text/code and Tweet it to your followers on Twitter.</small>',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Copy',
              }).then((result) => {
                if (result.value) {
                  if (this.copyText(res.data)) {
                    Swal.fire('Copied to clipboard')
                  }
                }
              });
            }else{
              Swal.fire({
                icon: 'info',
                title: 'Your Account Verification is on progress',
                html: 'Discover the Buzz on @dbuzzAPP #Hive: <b> ' + res.data + '</b>',
                footer: '<small>To verify your account, copy the generated text/code and Tweet it to your followers on Twitter.</small>',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Copy',
              }).then((result) => {
                if (result.value) {
                  if (this.copyText(res.data)) {
                    Swal.fire('Copied to clipboard')
                  }
                }
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Account verification',
            text: 'dBuzz offers verified accounts the ability to publish content from Twitter to the Hive Blockchain automatically.',
            footer: '<small><i> DISCLAIMER: dBuzz is a 3rd-party application and is not in any way affiliated with Twitter, Inc. <i></small>',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Generate now',
          }).then((result) => {
            if (result.value) {
              this._twitter.generateIdForTwitter().subscribe((res: any) => {
                if (res.status === 200) {
                  Swal.fire({
                    icon: 'info',
                    title: 'Generated ID:',
                    text: res.data.generated_id,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Copy',
                  }).then((result) => {
                    if (result.value) {
                      if (this.copyText(res.data.generated_id)) {
                        Swal.fire('Copied to clipboard')
                      }
                    }
                  });
                }
              });
            }
          })
        }
      });
    }
  }

  copyText(text) {
    return this._clipboard.copyFromContent(text);
  }

}
