import { Component, OnInit, ViewEncapsulation, Renderer } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationsComponent implements OnInit {
  notifs: any = [];
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

  ngOnInit() {
    this.getNotifications();
  }

  getNotifications() {
    if (!this.fetched_all) {
      this.fetching = true;
      this._auth.getNotifications(this.auth_username, this.limit, this.offset).subscribe((res: any) => {
        this.fetching = false;
        if (res.status === 200 && res.count > 0) {
          this.total_count = res.count;
          this.notifs = res.data;
          this.notifs.forEach(notif => {
            notif.created = new Date(notif.date);
            let url = notif.url.split('/');
            notif.url_author = url[0];
            notif.url_permlink = url[1];
            if (notif.type === 'reply' || notif.type === 'reply_comment') {
              notif.url_author = notif.username;
              let parent_url = notif.parent_url;
              if (parent_url) {
                notif.url_permlink = parent_url.split('/')[1];
              }
            }
            notif.sender_metadata = JSON.parse(notif.sender_metadata);
          });
        }
      });
    }
  }

  refreshList($event) {
    if ($event) {
        this.getNotifications();
    }
}

  showMoreNotif(event) {
    if (event) {
      if (this.total_count !== 0) {
        if (this.notifs.length >= this.total_count) {
          this.fetched_all = true;
        } else {
          this.limit += 10;
        }
        this.getNotifications();
      }
    }
  }
}
