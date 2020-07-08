import { Component, OnInit, Renderer, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit {
  @Input() notifs: any;
  @Input() loading: boolean = false;
  @Input() fetchedall: boolean = false;
  @Output() fetchNewNotifs = new EventEmitter();

  fetching: boolean = false;
  auth_username: any = null;
  limit: number = 20;
  offset: number = 0;
  total_count: number = 0;
  fetched_all: boolean = false;
  hide_alert: boolean = true;

  constructor(private _auth: AuthService, private _globals: GlobalService, private renderer: Renderer) {
    this.auth_username = this._auth.authorName;
  }

  @HostListener('window:scroll', ['$event'])
  ngOnInit() {
    let that = this;
    this.renderer.listen('window', 'scroll', (event) => {
      if (document.getElementById('allnotif')) {
        let scrollContainer = document.getElementById('allnotif');
        const threshold = 150;
        const position = window.innerHeight + window.scrollY;
        const height = scrollContainer.scrollHeight;
        if (position >= (height - threshold)) {
          if (!that.loading) {
            that.fetchNewList()
          }
        }
      }
    });
  }

  fetchNewList() {
    this.fetchNewNotifs.emit(true);
  }

  markAsRead(notif) {
    if (notif.is_read == 0) {
      this._auth.notifMarkAsRead(notif.id).subscribe((res: any) => {
        if (res.status === 200) {
          notif.is_read = 1;
          if (notif.type !== 'follow') {
            this.viewPost(notif);
          } else {
            this.gotoProfile(notif.sender);
          }
        }
      });
    } else {
      if (notif.type !== 'follow') {
        this.viewPost(notif);
      } else {
        this.gotoProfile(notif.sender);
      }
    }
  }

  viewPost(notif) {
    this._globals.ROUTER.navigate(['/post', notif.url_author, notif.url_permlink]);
  }

  gotoProfile(username) {
    this._globals.ROUTER.navigate(['/profile', username]);
  }
}
