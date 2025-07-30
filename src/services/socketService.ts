import { io } from 'socket.io-client';
import { nanoid } from 'nanoid';

export interface GameMessage {
  type: string;
  gameId: string;
  playerId?: string;
  data?: any;
}

export interface GameRoom {
  id: string;
  players: Array<{
    id: string;
    name: string;
    color: string;
    isHost: boolean;
  }>;
  isStarted: boolean;
  maxPlayers: number;
}

class SocketService {
  private socket: any;
  private gameId: string | null = null;
  private playerId: string | null = null;
  private isHost: boolean = false;
  private callbacks: Map<string, Function> = new Map();
  private currentRoom: GameRoom | null = null;
  private rooms: Map<string, GameRoom> = new Map();

  constructor() {
    this.connectToServer();
  }

  private connectToServer() {
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('room-update', (room: GameRoom) => {
      this.currentRoom = room;
      this.rooms.set(room.id, room);
      this.broadcastMessage('ROOM_UPDATED', room);
    });

    this.socket.on('game-created', (data: any) => {
      if (data.room) {
        this.currentRoom = data.room;
        this.rooms.set(data.room.id, data.room);
      }
      this.broadcastMessage('ROOM_CREATED', data.room);
    });

    this.socket.on('player-joined', (data: any) => {
      if (data.room) {
        this.currentRoom = data.room;
        this.rooms.set(data.room.id, data.room);
      }
      this.broadcastMessage('PLAYER_JOINED', data);
    });

    this.socket.on('player-left', (data: any) => {
      if (data.room) {
        this.currentRoom = data.room;
        this.rooms.set(data.room.id, data.room);
      }
      this.broadcastMessage('PLAYER_LEFT', data);
    });

    this.socket.on('game-started', (room: GameRoom) => {
      this.currentRoom = room;
      this.rooms.set(room.id, room);
      this.broadcastMessage('GAME_STARTED', room);
    });
  }

  private broadcastMessage(type: string, data: any) {
    const message: GameMessage = {
      type,
      gameId: this.gameId || '',
      data
    };

    this.callbacks.forEach(callback => callback(message));
  }

  createGame(hostName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit('create-game', hostName);
      
      // Wait for the game-created event
      const listener = (data: any) => {
        if (data.gameId) {
          this.gameId = data.gameId;
          this.playerId = data.playerId;
          this.isHost = true;
          this.socket.off('game-created', listener);
          resolve(data.gameId);
        }
      };
      
      this.socket.on('game-created', listener);

      // Timeout if no response after 5 seconds
      setTimeout(() => {
        this.socket.off('game-created', listener);
        reject(new Error('Failed to create game'));
      }, 5000);
    });
  }

  joinGame(gameId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('join-game', { gameId, playerName });
      
      // Wait for the player-joined event
      const listener = (data: any) => {
        if (data.room && data.newPlayer) {
          this.gameId = gameId;
          this.playerId = data.newPlayer.id;
          this.isHost = false;
          this.socket.off('player-joined', listener);
          resolve();
        }
      };
      
      this.socket.on('player-joined', listener);

      // Timeout if no response after 5 seconds
      setTimeout(() => {
        this.socket.off('player-joined', listener);
        reject(new Error('Failed to join game'));
      }, 5000);
    });
  }

  startGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.gameId || !this.isHost) {
        reject(new Error('Not authorized to start game'));
        return;
      }
      
      this.socket.emit('start-game', this.gameId);
      
      // Wait for the game-started event
      const listener = (room: GameRoom) => {
        this.socket.off('game-started', listener);
        resolve();
      };
      
      this.socket.on('game-started', listener);

      // Timeout if no response after 5 seconds
      setTimeout(() => {
        this.socket.off('game-started', listener);
        reject(new Error('Failed to start game'));
      }, 5000);
    });
  }

  onMessage(callback: (message: GameMessage) => void) {
    this.callbacks.set(callback.name || callback.toString(), callback);
    return () => {
      this.callbacks.delete(callback.name || callback.toString());
    };
  }

  getCurrentRoom(): GameRoom | null {
    return this.currentRoom;
  }

  getRoomById(gameId: string): GameRoom | null {
    return this.rooms.get(gameId) || null;
  }

  getCurrentPlayer() {
    return {
      gameId: this.gameId,
      playerId: this.playerId,
      isHost: this.isHost
    };
  }

  getDebugRoomInfo(gameId: string): { rooms: Map<string, GameRoom>, currentRoom: GameRoom | null } {
    return {
      rooms: new Map([...this.rooms]),
      currentRoom: this.currentRoom
    };
  }

  leaveGame() {
    if (!this.gameId || !this.playerId) return;

    this.socket.emit('leave-game', {
      gameId: this.gameId,
      playerId: this.playerId
    });

    this.gameId = null;
    this.playerId = null;
    this.isHost = false;
  }

  disconnect() {
    this.socket.disconnect();
  }

  // Public methods for socket access and event emission
  public getSocket(): any {
    return this.socket;
  }

  public emitEvent(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  public onEvent(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public offEvent(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();