import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from '../../../core/services/socketIo.service';
import { PlayerDto, RoomDto } from '../../../core/services/game.service';
import { MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent extends BaseCoreAbstract implements OnDestroy {
  roomId: string;
  role = 'operative';
  room: RoomDto = new RoomDto();
  player: PlayerDto = new PlayerDto();

  private subscriptions: Subscription = new Subscription();

  constructor(
    private socketIoService: SocketioService,
    private route: ActivatedRoute,
    private router: Router,
    protected override messageService: MessageService
  ) {
    super(messageService);
  }

  ngOnInit(): void {
    if (this.socketIoService.currentPlayer) {
      this.initRoom();
    }
    else {
      this.router.navigate(["/"]);
    }
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }

  initRoom() {
    this.roomId = this.route.snapshot.paramMap.get('id') ?? 'undeficed';
    this.player = this.socketIoService.currentPlayer;
    this.room = this.socketIoService.currentRoom;

    this.subscriptions.add(this.recieveJoinedPlayers());
    this.subscriptions.add(this.recieveStartGame());
    this.subscriptions.add(this.recieveGameUpdate());

    this.socketIoService.playerJoinRoom(this.player, this.room);
  }

  recieveJoinedPlayers() {
    this.socketIoService.recieveJoinedPlayers().subscribe(roomU => {
      this.popMessage(roomU.updateMessage, 'Info', 'info');

      let newRoom: RoomDto = {
        roomId: roomU.roomId,
        statusId: 1,
        playerList: roomU.playerList,
        gameStarted: roomU.gameStarted,
        roomOwnerId: roomU.roomOwnerId
      }

      this.socketIoService.currentRoom = newRoom;
      this.room = newRoom;
    });
  }

  recieveStartGame() {
    this.socketIoService.recieveStartGame().subscribe((room) => {
      this.room = room;
    });
  }

  recieveGameUpdate() {
    this.socketIoService.recieveRoomUpdate(this.roomId).subscribe((room) => {
      this.room = room;
    });
  }

  updateRoom(room: RoomDto) {
    this.socketIoService.sendRoomUpdate(room);
  }
}
