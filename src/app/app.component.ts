import { Component } from '@angular/core';
import { NetworkService } from './shared/services/network/network.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'inMobly task'
  connected = true
  statusChanged = false

  constructor(connection: NetworkService) {
    this.connected = navigator.onLine
    connection.connectionChanged.subscribe(status => {
      this.connected = status
      this.statusChanged = true
    })
  }

  reload = () => document.location.reload()
}
