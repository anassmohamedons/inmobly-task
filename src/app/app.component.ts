import { Component } from '@angular/core';
import { NetworkService } from './shared/services/network/network.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'inMobly task'
  // Used to hold the state of the network connection
  connected = true
  // Used to check if the network status was changed from last time
  statusChanged = false

  constructor(connection: NetworkService) {
    // Initialize the connected variable with the current state of the network
    this.connected = navigator.onLine

    // Subscribe to network state changes, and update above variables accordingly
    connection.connectionChanged.subscribe(status => {
      this.connected = status
      this.statusChanged = true
    })
  }

  // Method to reload the current page
  reload = () => document.location.reload()
}
