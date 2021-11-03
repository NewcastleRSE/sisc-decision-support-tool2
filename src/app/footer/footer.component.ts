import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Output() openInfo = new EventEmitter();
  @Output() startTutorial = new EventEmitter();

  constructor() {
  }

  openInfoDialog() {
    this.openInfo.emit();
  }

  startTutorialWalkthrough() {
    this.startTutorial.emit();
  }

}
