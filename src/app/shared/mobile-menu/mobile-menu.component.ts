import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { WalletComponent } from '../profile/wallet/wallet.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnd, Router } from '@angular/router';
import { NewPostComponent } from '../s-left/new-post/new-post.component';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss']
})
export class MobileMenuComponent implements OnInit {
  @Input() auth_username : any;
  @Output() refreshList = new EventEmitter();
  
  notif_counter: any = {};
  wallet_info: any = {};
  navigationSubscription: any;
  feed: any = 'user-feed';
  url: any = [];
  env:any;

  constructor(private _globals: GlobalService, private _auth: AuthService, 
    private _modal: NgbModal, private _router: Router) { 
    this.wallet_info =  this._auth.walletInfo;
    this.env = this._globals.ENV;
    if(!this.auth_username){
      this.auth_username = this._auth.authorName;
    }
    this.navigationSubscription = this._router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        let getUrl = this._globals.ROUTER_STATE;
        if (getUrl) {
          this.url = getUrl;
          this.feed = getUrl[2];

          if(getUrl[1] === ""){
            this.feed = 'user-feed';
          }else{
            this.feed = getUrl[1];
            if(getUrl[2] !== undefined){
              this.feed = getUrl[2];
            }
          }
          if (this.feed === undefined) {
            this.feed = getUrl[1];
          }
        }
      }
    });
  }

  ngOnInit() {
    this.getNotifCounter();
  }

  gotoHome(){
    this._globals.ROUTER.navigate(['/']);
  }

  gotoTrending(){
    this._globals.ROUTER.navigate(['/home/trending']);
  }

  gotoLatest(){
    this._globals.ROUTER.navigate(['/home/latest']);
  }

  gotoNotifs(){
    this._globals.ROUTER.navigate(['/notifications']);
  }

  gotoSearch(){
    this._globals.ROUTER.navigate(['/search-results']);
  }

  viewWallet() {
    let modalRef = this._modal.open(WalletComponent);
    modalRef.componentInstance.wallet_info = this.wallet_info;
  }

  getNotifCounter() {
    this._auth.getNotifCounter(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.notif_counter = res.data;
      }
    });
  }

  createPost(){
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    const modalRef = this._modal.open(NewPostComponent, ngbModalOptions);
    modalRef.result.then(
      (data: any) => {
        if (data && data == 'true') {
          this.refreshFeed();
        }
      },
      (reason: any) => { });
  }

  refreshFeed() {
    this.refreshList.emit(true);
  }
}
