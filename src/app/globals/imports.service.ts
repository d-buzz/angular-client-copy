import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ImportsService {
  private env: any = environment;

  constructor(private http: HttpClient,
    private router: Router,
    private activeRoute: ActivatedRoute) { }

  get ROUTER(): Router {
    return this.router;
  }

  get ACTIVATED_ROUTE() {
    return this.activeRoute;
  }

  get HTTP(): HttpClient {
    return this.http;
  }

  get ENV(): any {
    return this.env;
  }
}
