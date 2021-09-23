import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sisc-decision-support-tool2';

  public constructor(private titleService: Title) { }

  ngOnInit() {
    this.setTitle('SISC');
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
