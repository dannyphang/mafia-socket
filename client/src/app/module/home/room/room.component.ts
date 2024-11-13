import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from '../../../core/services/socketIo.service';
import { CharacterDto, GameService, PlayerDto, RoomDto, UpdatePlayerDto } from '../../../core/services/game.service';
import { MessageService } from 'primeng/api';
import { BaseCoreAbstract } from '../../../core/shared/base/base-core.abstract';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent extends BaseCoreAbstract implements OnDestroy {
  roomId: string;
  room: RoomDto = new RoomDto();
  player: PlayerDto = new PlayerDto();
  characterList: CharacterDto[] = [];

  constructor(
    private socketIoService: SocketioService,
    private route: ActivatedRoute,
    private router: Router,
    protected override messageService: MessageService,
    private gameService: GameService
  ) {
    super(messageService);
  }

  ngOnInit(): void {
    console.log(this.socketIoService.currentPlayer)
    if (this.socketIoService.currentPlayer) {
      this.initRoom();
      this.gameService.getAllCharacter().subscribe({
        next: res => {
          if (res.isSuccess) {
            this.characterList = res.data;
          }
        }
      });
    }
    else {
      this.router.navigate(["/"]);
    }
  }
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.playerQuited(this.player);
    this.socketIoService.disconnectSocket();

  }

  initRoom() {
    this.roomId = this.route.snapshot.paramMap.get('id') ?? 'undeficed';
    this.player = this.socketIoService.currentPlayer;
    this.room = this.socketIoService.currentRoom;

    this.socketIoService.connect();

    this.recieveJoinedPlayers()
    this.recieveStartGame()
    this.recieveGameUpdate()

    this.socketIoService.playerJoinRoom(this.player, this.room);
  }

  playerQuited(player: PlayerDto) {
    this.room.playerList = this.room.playerList.filter(p => p.playerId !== player.playerId);
    this.updateRoom(this.room);
  }

  recieveJoinedPlayers() {
    this.socketIoService.recieveJoinedPlayers().subscribe(roomU => {
      this.popMessage(roomU.updateMessage, 'Info', 'info');

      let newRoom: RoomDto = {
        roomId: roomU.roomId,
        statusId: 1,
        playerList: roomU.playerList,
        gameStarted: roomU.gameStarted,
        roomOwnerId: roomU.roomOwnerId,
        gameOrder: roomU.gameOrder
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
    room.playerList.forEach(p => {
      let updatePlayer: UpdatePlayerDto = {
        playerId: p.playerId,
        characterId: p.characterId
      }
      this.gameService.updatePlayer(updatePlayer).subscribe(res => {

      });
    })

    this.socketIoService.sendRoomUpdate(room);
  }
}
