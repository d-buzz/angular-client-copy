import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { GlobalService } from 'src/app/globals/global.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LoginOptionsComponent } from 'src/app/shared/login-options/login-options.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  private has_token: any;
  env: any;
  constructor(private _auth: AuthService,
    private _global: GlobalService, private modalService: NgbModal) {
    this.has_token = this._auth.hasToken;
    this.env = this._global.ENV;
    
  }

  ngOnInit() {
    if (this.has_token) {
      this._global.ROUTER.navigate(['/']);
    }
  }

  loginOptions(){
    if(this.env.HIVE_KEYCHAIN_ENABLE){
      let ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        centered: true
      };
      this.modalService.open(LoginOptionsComponent,ngbModalOptions);
    }else{
      this.hivesignerLogin();
    }
  }

  hivesignerLogin(){
    this._auth.signinSteemconnect().subscribe((res: any) => {
      if (res.status == 200) {
        window.location.href = res.data;
      } else {
        Swal.fire('Error', 'Failed to fetch steemconnect auth url', 'error');
      }
    });
  }

  signIn() {
    if (this.env.APP_DEMO == false) {
      if (!this.has_token) {
        this.loginOptions();
      } else {
        this._global.ROUTER.navigate(['/']);
      }
    } else {
      let password = localStorage.getItem("dpassword");
      if (!password) {
        this._global.ROUTER.navigate(['/manager']);
      } else {
        if (!this.has_token) {
          this.loginOptions();
        } else {
          this._global.ROUTER.navigate(['/']);
        }
      }
    }
  }
}
window.addEventListener('load', loadEvent => {
  let window: any = loadEvent.currentTarget;
  if (window.hive_keychain) {
    let hive_keychain = window.hive_keychain;
    window.hive_keychain = hive_keychain;
    hive_keychain.requestHandshake(function () {
      console.log('Handshake received!');
    });
  }
});