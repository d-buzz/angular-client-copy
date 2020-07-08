import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  _listeners = new Subject<any>();
  constructor(private _socket: Socket) { }

  get socket(): any {
    return this._socket;
  }

  public register($username: string): void {
    this._emit('register', { username: $username });
  }

  listen(): Observable<any> {
    return this._listeners.asObservable();
  }

  event($method: string, $data: any): void {
    this._listeners.next({
      method: $method,
      data: $data,
    });
  }

  async newPost($data: any): Promise<void> {
    await this._emit('new-post', $data);
  }

  async _emit($channel: string, $data: any): Promise<void> {
    await this._socket.emit($channel, $data);
  }

}
