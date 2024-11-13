import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterDto, GameService, PlayerDto, RoomDto } from '../../../../core/services/game.service';
import { ActivatedRoute } from '@angular/router';
import { SocketioService } from '../../../../core/services/socketIo.service';

@Component({
  selector: 'app-game-start-room',
  templateUrl: './game-start-room.component.html',
  styleUrl: './game-start-room.component.scss'
})
export class GameStartRoomComponent implements OnInit, OnChanges {
  @Input() room: RoomDto = new RoomDto();
  @Output() updateRoom: EventEmitter<RoomDto> = new EventEmitter<RoomDto>();

  selectedCharacterList: CharacterDto[] = [];
  currentPlayer: PlayerDto = new PlayerDto();

  constructor(
    private socketIoService: SocketioService,
    private route: ActivatedRoute,
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.currentPlayer = this.socketIoService.currentPlayer;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && changes['room'].currentValue) {
      this.gameService.getSelectedCharacterListByRoomId(this.room.roomId).subscribe({
        next: res => {
          this.selectedCharacterList = res.data
        }
      })
    }
  }

  endGameBtn() {
    this.updateRoom.emit({
      ...this.room,
      gameStarted: false
    })
  }


}
