import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RobotService } from '../../../services/robot.service';

@Component({
  selector: 'kd-robot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './robot.component.html',
  styleUrls: ['./robot.component.scss'],
})
export class RobotComponent {
  userText = '';
  translation = '';
  loading = false;

  constructor(private robotService: RobotService) {
    this.robotService.response$.subscribe((res) => {
      this.translation = res;
      this.loading = false; // stop loading when response arrives
    });
  }

  sendText() {
    if (!this.userText.trim()) return;

    this.loading = true;
    this.translation = ''; // clear previous translation
    this.robotService.sendText(this.userText);
  }

  clear() {
    this.userText = '';
    this.translation = '';
  }
}
