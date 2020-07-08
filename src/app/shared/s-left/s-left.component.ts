import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/authentication/auth.service';
import { NewPostComponent } from './new-post/new-post.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/globals/global.service';
import Swal from 'sweetalert2';
import { PostService } from 'src/app/globals/post.service';
import { TwitterService } from 'src/app/globals/twitter.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-s-left',
  templateUrl: './s-left.component.html',
  styleUrls: ['./s-left.component.scss']
})
export class SLeftComponent implements OnInit {
  @Input() data: any;
  @Output() refreshList = new EventEmitter();
  public menuItems: any[];
  public sideItems: any[];
  public isCollapsed = true;
  auth_username: string = '';
  auth_profilepic: any = '';
  feed: any = 'user-feed';
  url: any = [];
  navigationSubscription: any;
  is_verified: boolean = true;
  is_subscribed: boolean = true;
  subscribing: boolean = false;
  twitter_verification_enable : boolean = false;
  notif_counter: any = {
    read: 0,
    unread:0
  };
  constructor(
    private router: Router,
    private _auth: AuthService,
    private modalService: NgbModal,
    private _globals: GlobalService,
    private _post: PostService,
    private _twitter: TwitterService,
    private _clipboard: ClipboardService

  ) {
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      this.isCollapsed = true;
      if (event instanceof NavigationEnd) {
        let getUrl = this._globals.ROUTER_STATE;
        if (getUrl) {
          this.url = getUrl;
          this.feed = getUrl[2];
          if ((getUrl[1] !== 'profile' && getUrl[1] !== 'notifications') && this.feed == undefined) {
            this.feed = 'user-feed';
          }

          if (this.feed === undefined) {
            this.feed = getUrl[1];
          }
        }
        this.is_subscribed = this._auth.isMember;
      }
    });
  }

  ngOnInit() {
    if (this.data) {
      let auth = this.data.auth;
      this.auth_username = auth.auth_username;
      if (auth.profile_pic === undefined) {
        this._auth.getImageLinks(this.auth_username).subscribe((res: any) => {
          if (res.status === 200) {
            this.auth_profilepic = res.data.profile_image;
          }
        });
      } else {
        this.auth_profilepic = auth.profile_pic;
      }
    } else {
      this.auth_username = this._auth.authorName;
      this.auth_profilepic = this._auth.getProfileImage(this.auth_username);
    }

    let local_sub =  localStorage.getItem('local_subscribed');
    if(!local_sub){
      this.checkIfSubscribed();
    }
   
    this.checkIfVerified();
    this.getNotifCounter();
  }

  refreshFeed() {
    this.refreshList.emit(true);
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  open() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    const modalRef = this.modalService.open(NewPostComponent, ngbModalOptions);
    modalRef.result.then(
      (data: any) => {
        if (data && data == 'true') {
          this.refreshFeed();
        }
      },
      (reason: any) => { });
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
        Swal.fire({
          title: 'Logging out...',
          allowEscapeKey: false,
          allowOutsideClick: false,
          showLoaderOnConfirm: true,
          onOpen: () => {
            Swal.showLoading();
            this._auth.hiveLogout().subscribe((res: any) => {
              if (res.status === 200) {
                this._auth.logout();
                Swal.stopTimer();
                this._globals.ROUTER.navigate(['/login']);
                this._globals.toastFire('Logged out successfully', 'success');
              } else {
                this._globals.toastFire('Something went wrong. Please try again later', 'error');
              }
            });
          }
        });
      }
    })
  }

  subscribeCommunity() {
    this.subscribing = true;
    Swal.fire({
      title: 'Subscribing...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showLoaderOnConfirm: true,
      onOpen: () => {
        Swal.showLoading();
        this._post.subscribeCommunity().subscribe((res: any) => {
          this.subscribing = false;
          if (res.status === 200) {
            localStorage.setItem('is_subscribed', "1");
            this.is_subscribed = true;
            Swal.stopTimer();
            Swal.fire({
              title: 'Subscribed successfully to dBuzz!',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            })
          } else {
            this._globals.toastFire(res.data, 'error');
          }
        });
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
        Swal.fire({
          title: 'Unsubscribing...',
          allowEscapeKey: false,
          allowOutsideClick: false,
          showLoaderOnConfirm: true,
          onOpen: () => {
            Swal.showLoading();
            this._post.unsubscribeCommunity().subscribe((res: any) => {
              this.subscribing = false;
              if (res.status === 200) {
                this.is_subscribed = false;
                localStorage.setItem('is_subscribed', '0');
                Swal.stopTimer();
                Swal.fire({
                  title: 'Unsubscribed successfully to dBuzz!',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false,
                })
              } else {
                this._globals.toastFire(res.data, 'error');
              }
            });
          }
        });


      }
    })
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
            title: 'Account Verification',
            text: 'dBuzz offers verified accounts the ability to publish content from Twitter to the Hive Blockchain automatically. Copy the generated text/code and Tweet it to your followers on Twitter',
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
                } else {
                  Swal.fire(res.msg);
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

  getNotifCounter() {
    this._auth.getNotifCounter(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.notif_counter = res.data;
      }
    });
  }
}
