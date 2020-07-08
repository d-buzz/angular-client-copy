import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-login-options',
  templateUrl: './login-options.component.html',
  styleUrls: ['./login-options.component.scss']
})
export class LoginOptionsComponent implements OnInit {
  loginHiveForm: FormGroup;
  logging_in: boolean = false;
  has_hivekeychain: boolean = false;
  constructor(public activeModal: NgbActiveModal, private _auth: AuthService, 
    private _global: GlobalService) { }

  ngOnInit() {
    this.loginHiveForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
    });
    window.app_host = this._global.ENV.APP_HOST;
    if(window.hive_keychain){
      this.has_hivekeychain = true;
    }
  }

  hivekeychainLogin(){
    let username = this.loginHiveForm.value.username;
    var time: any = new Date().getTime() / 1000;
    var timestamp:any = parseInt(time,10);
    var signedMessageObj = { type: 'login', app: 'dbuzz.app' };
    var messageObj:any = {
      signed_message: signedMessageObj,
      authors: [username],
      timestamp: timestamp
    };
    
    var self = this;
    self.setLoggingState(true);
    window.hive_keychain.requestSignBuffer(username, JSON.stringify(messageObj), 'Posting', function(response) {
      if(response.success){
        messageObj.signatures = [response.result];
        let token = btoa(JSON.stringify(messageObj));
        window.location.href = window.app_host+'/?access_token='+token+'&username='+username+'&expires_in=604800&state=true';
        self.setLoggingState(false);
      }else{
        self._global.toastFire('Login failed. Please double check your keychain configuration and try again','error');
        self.setLoggingState(false);
      }
    });
  }

  setLoggingState(state){
    this.logging_in = state;
    if(!state){
      this.activeModal.dismiss();
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

  installForChrome(){
    let url = 'https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep?hl=en';
    window.open(url, '_blank');
  }

  installForFirefox(){
    let url = 'https://addons.mozilla.org/en-US/firefox/addon/hive-keychain/';
    window.open(url, '_blank');
  }
}
