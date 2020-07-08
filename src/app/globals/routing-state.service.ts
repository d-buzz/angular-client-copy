import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RoutingStateService {
  private history: Array<string>;
  private data: Array<string>;
  private url: string;
  private searchkey: string;
  constructor(private router: LocationStrategy) {
    this.history = [];
    this.data = [];
  }

  public loadRouting() {
    this.history = [...this.history, this.router.path()];
  }

  public loadData(data){
    this.cacheData(data);
    this.data = [...this.data, data];
  }

  public saveSearchkey(searchkey){
    this.searchkey = searchkey;
  }

  public getSearchKey(): string {
    return this.searchkey;
  }
  
  cacheData(data){
    localStorage.setItem('viewpost', JSON.stringify(data));
  }

  public getData(): string[] {
    return this.data;
  }
  
  public getHistory(): string[] {
    return this.history;
  }

  public getPreviousUrl(): string {
    return this.history[this.history.length - 2] || '/';
  }

  public getCurrentUrl(): string {
    return this.history[this.history.length - 1] || '/';
  }

  public getCurrentData(): string {
    let viewpost = localStorage.getItem('viewpost');
    if(viewpost){
      return JSON.parse(viewpost);
    }
    return null;
  }
  
  set previousUrl(url: string) {
    this.url = url;
  }
  get previousUrl() {
    return this.url;
  }
}
