import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss']
})
export class NoticesComponent implements OnInit {
  env:any;
  constructor(private _global: GlobalService) { 
    this.env = this._global.ENV;
  }

  ngOnInit() {
  
  }

}
