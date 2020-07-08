import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {
  private api_prefix: string;
  constructor(private _globals: GlobalService) {
    this.api_prefix = '/twitter';
  }

  public checkIfVerified(author:any){
    return this._globals.publicGetMethod(this.api_prefix+'/check-status/@'+author);
  }

  public generateIdForTwitter(){
    return this._globals.publicPostMethod(this.api_prefix+'/generate-id',{});
  }

  public getGeneratedId(author:any){
    return this._globals.publicGetMethod(this.api_prefix+'/generated-id/@'+author);
  }

  public checkIfHasDuplicate(generated_id:any){
    return this._globals.publicGetMethod(this.api_prefix+'/get-by-generated-id/'+generated_id);
  }
}
