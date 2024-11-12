import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../core/services/socketIo.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  constructor(
    private socketIoService: SocketioService,
  ) {
    this.socketIoService.connect();
  }
}
