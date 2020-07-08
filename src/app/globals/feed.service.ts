import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { AuthService } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private api_prefix: string;
  private trendingFeeds : any = null;
  private latestFeeds : any = null;
  private userFeeds : any = null;
  constructor(private _globals: GlobalService, private _auth: AuthService) { 
    this.api_prefix = '/feed';
  }

  set trendingFeedResponse(data : any){
    this.trendingFeeds = data;
  }
  get trendingFeedResponse(){
    return this.trendingFeeds;
  }

  set userFeedResponse(data : any){
    this.userFeeds = data;
  }
  get userFeedResponse(){
    return this.userFeeds;
  }

  set latestFeedResponse(data : any){
    this.latestFeeds = data;
  }
  get latestFeedResponse(){
    return this.latestFeeds;
  }

  public getTrendingPost(limit=10,offset=0){
    return this._globals.publicGetMethod(this.api_prefix+'/trending/'+this._globals.ENV.PRIMARY_TAG+'/'+limit+'/'+offset);
  }

  public getLatestPost(limit=10,offset=0){
    return this._globals.publicGetMethod(this.api_prefix+'/latest/'+this._globals.ENV.PRIMARY_TAG+'/'+limit+'/'+offset);
  }

  public getUserFeed(author = "",limit=10,offset=0){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod(this.api_prefix+'/user-feed/'+author+'/'+limit+'/'+offset);
  }

  public getBlogPost(author="",limit=10,offset=0){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod(this.api_prefix+'/blog/'+author+'/'+limit+'/'+offset);
  }
  
  public getContent(author: string, permlink: string){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod('/'+this._globals.ENV.PRIMARY_TAG+'/@'+author+'/'+permlink);
  }

  public getContentReplies(author: string, permlink: string){
    return this._globals.publicGetMethod('/replies/' + author + '/' + permlink);
  }
  
  public getAllReplies(author: string,limit: number = 10){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod('/all-replies'+'/'+author+'/'+limit);
  }
  public isContentVoter(voter:string, author: string, permlink: string){
    return this._globals.publicGetMethod('/is-voter/'+ voter + '/' + author + '/' + permlink);
  }

  public getActiveVoters(author: string, permlink: string){
    return this._globals.publicGetMethod('/active-voters/'+ author + '/' + permlink);
  }

  public getActiveRebloggers(author: string, permlink: string){
    return this._globals.publicGetMethod('/active-rebloggers/'+ author + '/' + permlink);
  }

  public getTrendingTags(limit: number){
    return this._globals.publicGetMethod('/trending-tags/'+limit);
  }

  public getWhoToFollow(author: string = "", limit:number = 10){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod('/who-to-follow/'+author+'/'+limit);
  }

  public lookupWitness(q: string, limit:number = 10, offset: number=0){
    return this._globals.publicGetMethod('/lookup-witness/'+q+'/'+limit+'/'+offset);
  }

  public lookupPeople(q: string, limit:number = 10, offset: number=0){
    return this._globals.publicGetMethod('/lookup-user/'+q+'/'+limit+'/'+offset);
  }

  public lookupLatest(q: string, limit:number = 10, offset: number=0){
    return this._globals.publicGetMethod('/lookup-latest/'+q+'/'+limit+'/'+offset);
  }

  public getMentions(author: string="", limit: number=10, offset: number=0){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod('/mentions/'+author+'/'+limit+'/'+offset);
  }

  public getBlogCounter(author: string=""){
    if(author==""){
      author = this._auth.authorName;
    }
    return this._globals.publicGetMethod('/blog-counter/'+author);
  }

  public getLinkMetadata(url: string=""){
    return this._globals.publicGetMethod('/url-get-metadata?url='+url);
  }
}
