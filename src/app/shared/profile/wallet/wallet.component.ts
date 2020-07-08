import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  wallet_info: any = {};
  constructor(public activeModal: NgbActiveModal, private _globals: GlobalService,private _auth: AuthService) {
   
   }

  ngOnInit() {
    this.wallet_info = this._auth.walletInfo;
  }
  
  gotoProfile(author){
    this.activeModal.dismiss('Cross click')
    this._globals.ROUTER.navigate(['/profile',author]);
  }
}
