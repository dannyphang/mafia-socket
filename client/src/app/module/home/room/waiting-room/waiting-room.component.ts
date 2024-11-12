import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PlayerDto, RoomDto } from '../../../../core/services/game.service';
import { SocketioService } from '../../../../core/services/socketIo.service';
import { BaseCoreAbstract } from '../../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.scss'
})
export class WaitingRoomComponent extends BaseCoreAbstract implements OnInit, OnChanges {
  @Input() room: RoomDto = new RoomDto();
  @Output() updateRoom: EventEmitter<RoomDto> = new EventEmitter<RoomDto>();

  dialogVisible: boolean = false;
  selectedPlayer: PlayerDto = new PlayerDto();

  constructor(
    private socketIoService: SocketioService,
    protected override messageService: MessageService
  ) {
    super(messageService);
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && changes['room'].currentValue) {
      // console.log(this.room);
    }
  }

  gameGameBtn() {
    this.updateRoom.emit({
      ...this.room,
      gameStarted: true
    })
  }

  userBtn(player: PlayerDto) {
    if (this.room.roomOwnerId === this.socketIoService.currentPlayer.playerId) {
      this.dialogVisible = true;
      this.selectedPlayer = player;
    }
    else {
      this.popMessage('Only the room owner have the permission to do this action.', "Error", "error");
    }
  }

  kickPlayer() {
    this.room.playerList = this.room.playerList.filter(p => p.playerId != this.selectedPlayer.playerId);
    this.socketIoService.sendRoomUpdate(this.room);
    this.dialogVisible = false;
  }

  assignOwner() {
    this.room.roomOwnerId = this.selectedPlayer.playerId;
    this.socketIoService.sendRoomUpdate(this.room);
    this.dialogVisible = false;
  }
}
