import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import apiConfig from '../../../environments/apiConfig';
import { PlayerDto, RoomDto, RoomUpdateDto } from './game.service';

@Injectable({
    providedIn: 'root',
})
export class SocketioService {
    socket: Socket;
    currentPlayer: PlayerDto;
    currentRoom: RoomDto;

    constructor() { }

    set player(player: PlayerDto) {
        this.currentPlayer = player;
    }

    get player(): PlayerDto {
        return this.currentPlayer;
    }

    set room(room: RoomDto) {
        this.currentRoom = room;
    }

    get room(): RoomDto {
        return this.currentRoom;
    }

    connect() {
        this.socket = io(apiConfig.socketUrl);
    }

    playerJoinRoom(player: PlayerDto, room: RoomDto) {
        this.socket.emit('joinRoom', { room: room, player: player });
    }

    startGame(gameId: string) {
        this.socket.emit('startGame', { gameId: gameId });
    }

    sendRoomUpdate(room: RoomDto) {
        this.socket.emit('roomUpdate', { room: room });
    }

    recieveJoinedPlayers() {
        return new Observable<RoomUpdateDto>((observer) => {
            this.socket.on('joinRoom', (room) => {
                observer.next(room);
            });
        });
    }

    recieveStartGame() {
        return new Observable<RoomDto>((observer) => {
            this.socket.on('startGame', (room: RoomDto) => {
                observer.next(room);
            });
        });
    }

    recieveRoomUpdate(roomId: string) {
        return new Observable<RoomDto>((observer) => {
            this.socket.on('roomUpdate', (room) => {
                observer.next(room);
            });
        });
    }

    disconnectSocket() {
        this.socket.disconnect();
    }
}