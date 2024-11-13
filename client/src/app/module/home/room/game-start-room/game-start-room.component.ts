import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterDto, GameService, PlayerDto, RoomDto } from '../../../../core/services/game.service';
import { ActivatedRoute } from '@angular/router';
import { SocketioService } from '../../../../core/services/socketIo.service';
import { MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../../../core/shared/base/base-core.abstract';

@Component({
  selector: 'app-game-start-room',
  templateUrl: './game-start-room.component.html',
  styleUrl: './game-start-room.component.scss'
})
export class GameStartRoomComponent extends BaseCoreAbstract implements OnInit, OnChanges {
  @Input() room: RoomDto = new RoomDto();
  @Output() updateRoom: EventEmitter<RoomDto> = new EventEmitter<RoomDto>();

  selectedCharacterList: CharacterDto[] = [];
  currentPlayer: PlayerDto = new PlayerDto();
  currentCharacter: CharacterDto = new CharacterDto();
  dialogVisible: boolean = false;

  constructor(
    private socketIoService: SocketioService,
    private route: ActivatedRoute,
    private gameService: GameService,
    protected override messageService: MessageService,
  ) {
    super(messageService);
  }

  ngOnInit() {
    this.currentPlayer = this.socketIoService.currentPlayer;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && changes['room'].currentValue) {
      this.gameService.getSelectedCharacterListByRoomId(this.room.roomId).subscribe({
        next: res => {
          this.selectedCharacterList = res.data;
          this.currentCharacter = this.selectedCharacterList.find(c => c.characterId === this.currentPlayer.characterId) ?? new CharacterDto();
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

  userBtn(player: PlayerDto) {
    if (this.currentCharacter.characterOrder === this.room.gameOrder) {
      this.dialogVisible = true;
    }
    else {
      this.popMessage('You cannot do any action in this turn.', "Error", "error");
    }
  }
}
