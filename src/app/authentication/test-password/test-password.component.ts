import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-test-password',
  templateUrl: './test-password.component.html',
  styleUrls: ['./test-password.component.scss']
})
export class TestPasswordComponent implements OnInit {
  loginForm: FormGroup;
  private has_token: any;
  passToggleOpen: boolean = false;
  passInputType: string = 'password';
  env:any;
  focus2;

  constructor(private _global: GlobalService, private _auth: AuthService) { 
    this.env = this._global.ENV;
    this.has_token = this._auth.hasToken;
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
    });

    if(this.env.APP_DEMO === false){
      if(!this.has_token){
        this._global.ROUTER.navigate(['/login']);
      }else{
        this._global.ROUTER.navigate(['/']);
      }
    }else{
      let password = localStorage.getItem("dpassword");
      if(password){
        this._global.ROUTER.navigate(['/']);
      }
    }
  }

  login(){
    let password = this.loginForm.value.password;
    if(password === this.env.STEEM_DEMO_PASS){
      localStorage.setItem("dpassword",password)
      this.steemConnectLogin();
      this._global.toastFire('Demo start now','success');
    }else{
      this._global.toastFire('Incorrect password','error');
    }
  }

  showPassword() {
    this.passToggleOpen = !this.passToggleOpen;
    if (this.passToggleOpen) {
      this.passInputType = 'text';
    } else {
      this.passInputType = 'password';
    }
  }

  steemConnectLogin(){
    if(!this.has_token){
      this._auth.signinSteemconnect().subscribe((res: any) => {
        if(res.status == 200){
          window.location.href = res.data;
        }else{
          Swal.fire('Error','Failed to fetch steemconnect auth url','error');
        }
      });
    }else{
      this._global.ROUTER.navigate(['/']);
    }
  }
}
