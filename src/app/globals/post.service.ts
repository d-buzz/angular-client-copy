import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private api_prefix: string;
  constructor(private _globals: GlobalService) { 
    this.api_prefix = '/post';
  }

  public createPost(data){
    return this._globals.publicPostMethod(this.api_prefix+'/create-post',data);
  }

  public upvote(data){
    return this._globals.publicPostMethod(this.api_prefix+'/vote',data);
  }

  public downvote(data){
    return this._globals.publicPostMethod(this.api_prefix+'/downVote',data);
  }

  public followAuthor(data){
    return this._globals.publicPostMethod(this.api_prefix+'/follow',data);
  }

  public unfollowAuthor(data){
    return this._globals.publicPostMethod(this.api_prefix+'/unfollow',data);
  }

  public comment(data){
    return this._globals.publicPostMethod(this.api_prefix+'/comment',data);
  }

  public reblog(data){
    return this._globals.publicPostMethod(this.api_prefix+'/reblog',data);
  }

  public getContent(category,username,permlink){
    let url = category + '/@' + username + '/' + permlink;
    return this._globals.publicGetMethod('/'+url);
  }

  public subscribeCommunity(){
    return this._globals.publicPostMethod(this.api_prefix+'/community/subscribe',{});
  }

  public unsubscribeCommunity(){
    return this._globals.publicPostMethod(this.api_prefix+'/community/unsubscribe',{});
  }

  public flagPost(data){
    return this._globals.publicPostMethod(this.api_prefix+'/community/flag-post',data);
  }
}
