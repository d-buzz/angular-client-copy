import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-witness',
  templateUrl: './witness.component.html',
  styleUrls: ['./witness.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WitnessComponent implements OnInit {

  @Input() searching: boolean = false;
  @Input() data: any = [];
  twitter_verification_enable : boolean = false;


  constructor(private _globals: GlobalService) {
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
   }

  ngOnInit() {
  }

}
