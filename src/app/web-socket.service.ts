import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket;

  constructor() {
  }

  setupSocketConnection(job) {
    console.log('setup socket');
    this.socket = io(environment.websocket_url);


    const observable = new Observable(observer => {

      // connect and disconnect handling
      this.socket.on('connect', () => {console.log('Connected'); })
        .on('connect_error', () => {observer.error('Oh no! There is no connection to the server.'); } )
        .on('disconnect', () => {observer.error('Oh no! The server has disconnected.'); } );

      // // server check in
      // this.socket.on('checkin', (arg, ack) => {
      //   console.log('checkin received, sending ack');
      //   ack('received');
      // });


      // start listening for any type: message sent by the server
      this.socket.on('message', (msg) => {
        console.log('message:');
        console.log(msg);

        if (msg.data === 'Connected') {
          this.submitJob(job);
        }

        // else?
      });

      // subscribe to job progress
      this.socket.on('jobProgress', payload => {
        observer.next({type: 'jobProgress', payload});
      });

      // subscribe to job finishing
      this.socket.on('jobFinished', payload => {
        observer.next({type: 'jobFinished', payload});
      });

      // socket.on("jobProgress", payload => {
      //   console.log(`==== jobProgress for payload.job_id}`);
      //   console.log(`${payload.progress} complete`);
      //   this._feedback.innerHTML = `Calculating ${payload.progress}%`;
      //   this._progressBar.value = payload.progress;
      //   console.log("==== End progress report");
      // });


      return () => {
        this.socket.disconnect();
      };
    });
    return observable;



    // this.getMessages();
  }


  submitJob(job) {
    console.log('submit job');
    this.socket.emit('submitJob', job);
  }

}
