import { Injectable } from '@angular/core';
import { GlobalService } from '../globals/global.service';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { LocationStrategy } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private redirect_url : string;
  private history : Array<any>;

  constructor(private _globals: GlobalService, private _router: Router, private _cookieService: CookieService, private url : LocationStrategy) {
    this.redirect_url = '/';
    this.history = [];
  }

  set redirectURL(url : string){
    this.redirect_url = url;
  }

  get redirectURL(){
    return this.redirect_url;
  }
  
  get previousUrl(){
    return this.history[this.history.length-1];
  }

  get accessToken() {
    let token = sessionStorage.getItem('access_token');
    if (!token) {
      token = localStorage.getItem('access_token');
    }

    return token;
  }

  get hasToken() {
    let token = sessionStorage.getItem('access_token');
    if (!token) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      return true;
    }
    return false;
  }

  get metaData(){
    let metadata = '';
    let steemconnect = this.getSteemconnectData();
    if(steemconnect && steemconnect.json_metadata){
      metadata =  JSON.parse(steemconnect.json_metadata);
    }
    return metadata;
  }

  get authorName(){
    let name = '';
    let steemconnect = this.getSteemconnectData();
    if(steemconnect){
      name = steemconnect.name;
    }
    return name;
  }

  get authorID(){
    let steemid = '';
    let steemconnect = this.getSteemconnectData();
    if(steemconnect){
      steemid = steemconnect.id;
    }
    return steemid;
  }

  
  get isMember(){
    let is_member:any = localStorage.getItem('is_subscribed');
    return is_member==1 ? true : false;
  }

  get votingPower(){
    let voting_power:any = localStorage.getItem('voting_power');
    if(voting_power){
      return parseInt(voting_power);
    }
    return 0;
  }

  get isVerified():boolean{
    let is_verified = false;
    let steemconnect = this.getSteemconnectData();
    if(steemconnect){
      is_verified = steemconnect.is_verified==1;
    }
    return is_verified;
  }

  get authorAccount(){
    let mapped = {};
    let account = this.getSteemconnectData();
    let metadata:any = this.metaData;
    if(metadata.profile){
      let profile = metadata.profile;
      mapped = {
        user_id: account.id,
        author: account.name,
        author_name: profile.name || account.name,
        author_profile_pic: account.profile_image,
        author_profile: { profile: profile },
        following_count: account.following_count,
        follower_count: account.follower_count,
        created: account.created,
        voting_power: account.voting_power,
        is_verified: account.is_verified
      };
    }

    return mapped;
  }

  get walletInfo(){
    let wallet_info = {};
    let wallet = localStorage.getItem('wallet_info');
    if(wallet){
      wallet_info = JSON.parse(wallet);
    }
    return wallet_info;
  }

  public setTokenToCookie(){
    if(this.accessToken){
      this._cookieService.set('access_token',this.accessToken);
    }
  }

  public getProfileImage(username: string=''){
    let steemconnect = this.getSteemconnectData();
    if(steemconnect){
      return steemconnect.profile_image;
    }
    return this._globals.ENV.API_HOST + '/profiles/'+username+'.jpg';
  }

  public getCoverImage(username: string=''){
    let steemconnect = this.getSteemconnectData();
    if(steemconnect){
      return steemconnect.cover_image;
    }
    return this._globals.ENV.API_HOST + '/covers/'+username+'.jpg';
  }

  public saveRoutes(){
    this.history = [...this.history, this.url.path()];
  }
  
  public getSteemconnectData() {
    let steem = sessionStorage.getItem('steemconnect');
    if (!steem) {
      steem = localStorage.getItem('steemconnect');
    }
    return JSON.parse(steem);
  }

  public checkToken(token) {
    if (token) {
      this.checkAuthToken(token).subscribe((res: any) => {
        if (res.data.steemconnect) {
          let info = res.data.steemconnect;
          sessionStorage.setItem('steemconnect', JSON.stringify(info));
          localStorage.setItem('steemconnect', JSON.stringify(info));
          this._cookieService.set('steemconnect_name',res.data.steemconnect.name);
        }
      });
    } else {
      this._router.navigate(['/login']);
    }
  }

  public logout(){
    localStorage.clear();
    sessionStorage.clear();
    this._cookieService.deleteAll();
  }

  public setAccessToken(token: any) {
    if (token) {
      sessionStorage.setItem('access_token', token);
      localStorage.setItem('access_token', token);
      this._cookieService.set('access_token',token);
    }
  }

  setWalletInfo(){
    this.getAccountWalletInfo().subscribe((res:any) => {
      if(res.status === 200 && res.data){
        localStorage.setItem('wallet_info', JSON.stringify(res.data));
      }
    });
  }

  public signinSteemconnect() {
    return this._globals.publicGetMethod('/auth');
  }

  public hiveLogout() {
    return this._globals.publicPostMethod('/auth/logout');
  }

  public checkAuthToken(token) {
    return this._globals.publicGetMethod('/auth/?access_token=' + token);
  }

  public isAuthenticated(){
    return this._globals.publicGetMethod('/auth/check');
  }

  public getImageLinks(author : string='') {
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/image-links/@'+author);
  }

  public getAuthorMetadata(author : string=''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/@'+author);
  }

  public getMultipleAuthorMetadata(data : any){
    return this._globals.publicPostMethod('/account/multiple',data);
  }

  public getFollowCounter(author: string=''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/followers-count/@'+author);
  }

  public getFollowers(author: string = '', limit: number = 10){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/followers/'+limit+'/@'+author);
  }

  public getFollowing(author: string = '', limit: number = 10){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/following/'+limit+'/@'+author);
  }

  public isFollowing(author: string='', auth_username: string){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/isfollowing/@'+auth_username+'/@'+author);
  }

  public isSubscribed(author: string = ''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/check-subscription/@'+author);
  }

  public getNotifications(author: string = '', limit: number = 10, offset: number = 0){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/notifications/@'+author+'/'+limit+'/'+offset);
  }

  public notifMarkAsRead(notif_id: number){
    return this._globals.publicGetMethod('/account/notifications/mark-as-read/'+notif_id);
  }

  public notifAllMarkAsRead(){
    return this._globals.publicPostMethod('/account/notifications/mark-all-as-read');
  }

  public notifClearAll(){
    return this._globals.publicPostMethod('/account/notifications/clear-all');
  }

  public getNotifCounter(author: string = ''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/notifications/counter/@'+author);
  }

  public getAccountWalletInfo(author: string = ''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/wallet-info/@'+author);
  }

  public getVotingPower(author: string = ''){
    if(author == ''){
      author = this.authorName;
    }
    return this._globals.publicGetMethod('/account/voting-power/@'+author);
  }
}
