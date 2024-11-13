import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CharacterDto, PlayerDto, RoomDto } from '../../../../core/services/game.service';
import { SocketioService } from '../../../../core/services/socketIo.service';
import { BaseCoreAbstract } from '../../../../core/shared/base/base-core.abstract';
import { MessageService } from 'primeng/api';
import { OptionsModel } from '../../../../core/services/components.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.scss'
})
export class WaitingRoomComponent extends BaseCoreAbstract implements OnInit, OnChanges {
  @Input() room: RoomDto = new RoomDto();
  @Input() characterList: CharacterDto[] = [];
  @Output() updateRoom: EventEmitter<RoomDto> = new EventEmitter<RoomDto>();
  @Output() selectedCharacterList: EventEmitter<CharacterDto[]> = new EventEmitter<CharacterDto[]>();

  dialogVisible: boolean = false;
  selectedPlayer: PlayerDto = new PlayerDto();
  currentPlayer: PlayerDto = new PlayerDto();
  characterOptionList: OptionsModel[] = [];
  characterFormControl: FormControl = new FormControl();
  characterFormArr: FormArray = this.formBuilder.array([]);

  constructor(
    private socketIoService: SocketioService,
    protected override messageService: MessageService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    super(messageService);
  }

  ngOnInit() {
    if (!this.currentPlayer) {
      this.router.navigate(["/"]);
    }
    this.currentPlayer = this.socketIoService.currentPlayer;

    this.characterFormControl.valueChanges.subscribe((val: string[]) => {

      this.characterFormArr = this.formBuilder.array([]);
      if (val) {
        let selectedChar: CharacterDto[] = [];
        val.forEach(id => {
          this.addCharFormArr(id);
          selectedChar.push(this.characterList.find(p => p.characterId === id)!);
        });

        this.selectedCharacterList.emit(selectedChar);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['characterList'] && changes['characterList'].currentValue) {
      this.characterOptionList = this.characterList.map(c => {
        return {
          label: c.characterName,
          value: c.characterId
        }
      });
    }
  }

  gameGameBtn() {
    // random assign character to player
    if (this.characterFormControl.value) {
      let tempCharList: CharacterDto[] = [];
      this.characterList.forEach(c => {
        let tempNo: number = (this.characterFormArr.value as { characterId: string, number: number }[]).find(ch => ch.characterId === c.characterId)?.number ?? 0;
        for (let i = 0; i < tempNo; i++) {
          tempCharList.push(c);
        }
      });

      tempCharList = this.shuffleArray(tempCharList);

      let sum: number = 0;
      (this.characterFormArr.value as { characterId: string, number: number }[]).forEach(c => {
        sum += c.number;
      });

      if (sum !== this.room.playerList?.length) {
        this.popMessage('Incorrect number of selected character.', "Error", "error");
      }
      else {
        this.room.playerList = this.room.playerList.map((player, index) => {
          let p: PlayerDto = {
            ...player,
            characterId: tempCharList[index].characterId
          }
          return p
        });

        this.updateRoom.emit({
          ...this.room,
          gameStarted: true
        });
      }
    }
    else {
      this.popMessage('Something wrong from character list.', "Error", "error");
    }
  }

  userBtn(player: PlayerDto) {
    if (this.room.roomOwnerId === this.socketIoService.currentPlayer.playerId && player.playerId !== this.socketIoService.currentPlayer.playerId) {
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

  addCharFormArr(characterId: string) {
    this.characterFormArr.push(this.formBuilder.group({
      characterId: new FormControl(characterId),
      number: new FormControl(0)
    }));
  }

  returnCharFormControl(char: any): FormControl {
    return (char as FormGroup).controls['number'] as FormControl;
  }

  returnCharName(characterId: string): string {
    return this.characterOptionList.find(o => o.value === characterId)?.label ?? '';
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    };

    return array
  }
}
