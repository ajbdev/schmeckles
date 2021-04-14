import { classToPlain } from 'class-transformer';
import Peer from 'peerjs';
import { Player } from './Player';


export enum HostBroadcastType {
  DISBANDED = 'DISBANDED',
  DISCONNECTED = 'DISCONNECTED',
  REJOIN_KEY = 'REJOIN_TOKEN',
  REJOIN = 'REJOIN',
  LOBBY_PLAYERS = 'LOBBY_PLAYERS',
  LOBBY_COUNTDOWN = 'LOBBY_COUNTDOWN',
  ACTION = 'ACTION',
  GAMESTATE = 'GAMESTATE'
}

interface HostNetworkMessage {
  type: HostBroadcastType,
  payload?: any;
}

export enum ClientMessageType {
  DISCONNECTING = 'DISCONNECTING',
  ACTION = 'ACTION',
  REJOIN_KEY = 'REJOIN_KEY'
}

export interface ClientNetworkMessage {
  type: ClientMessageType
  payload?: any
}


export abstract class Network {
  onError = (err: any) =>  {};
  player: Player;
  connectionId: string;
  peer: Peer;
  debugLevel: number;

  constructor(player: Player, onError: (err: any) => void) {
    this.player = player;
    this.debugLevel = 3;
    this.connectionId = this.createConnectionId();
    this.peer = new Peer(this.fullyQualifiedId(
      this.connectionId), 
      { debug: this.debugLevel,
        //config: { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]}      
      }
    );
    this.onError = onError;

    this.peer.on('error', this.onError);
    
    this.peer.on('disconnected', () => this.onError(new Error('Disconnected from peer server')));
  }

  fullyQualifiedId(code: string) {
    return  `schmeckles_${code}`;
  }
  abstract createConnectionId(): string;
}

export class Host extends Network {
  clients: Peer.DataConnection[] = [];
  players: Player[] = [];
  rejoinTokens: { [key:string]:string } = {};

  createConnectionId() {
    return Math.random().toString(20).substr(2, 4).toUpperCase();
  }

  createRejoinToken(p: Player) {
    const a = new Uint8Array(20);
    crypto.getRandomValues(a);
    const rejoinToken = btoa(String.fromCharCode(...a)).split('').filter(v => {
            return !['+', '/' ,'='].includes(v);
    }).slice(0,20).join('');

    this.rejoinTokens[rejoinToken] = p.id;

    this.broadcast({ type: HostBroadcastType.REJOIN_KEY, payload: rejoinToken }, this.players.filter(player => player.id !== p.id));
  }

  host(onConnect: (code: string) => void, onPlayerUpdate: (p: Player[]) => void, onClientAction: (m: ClientNetworkMessage, c: Peer.DataConnection) => void) {
    this.player.connected = true;
    this.players = [this.player];

    this.peer.on('open', (id) => {
      onConnect(this.connectionId);

      this.peer.on('connection', (client) => {
        client.peerConnection.onconnectionstatechange = (ev: any) => {
          if (ev.target.connectionState === 'failed') {
            this.players.splice(this.players.findIndex(p => p.id === client.metadata.id))
            this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
            onPlayerUpdate(this.players);
          }
        };
  
        const player = client.metadata;
        if (this.players.length < 4 && player.name.length > 0) {
          this.players.push(player);
          this.clients.push(client);

          onPlayerUpdate(this.players);
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
        }

        client.on('open', () => {
          client.metadata.connected = true;
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });

          onPlayerUpdate(this.players);

          this.createRejoinToken(this.players.filter(p => p.id === client.metadata.id)[0]);
        })

        client.on('close', () => {
          const player = this.players[this.players.findIndex(p => p.id === client.peer)]
          console.log('client disconnected', player);
          player.connected = false;

          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
          onPlayerUpdate(this.players);
        })

        client.on('disconnected', () => {
          const player = this.players[this.players.findIndex(p => p.id === client.peer)]
          console.log('client disconnected', player);
          player.connected = false;

          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
          onPlayerUpdate(this.players);
        })
    
        client.on('data', function(data: ClientNetworkMessage) {
          console.log('Received from client: ', data);


          onClientAction(data, client);
        });
      })
    });
  }

  removePlayer(player: Player) {
    this.clients.forEach(c => {
      if (c.peer === player.id) {
        c.close();
      }
    });

    this.clients.splice(this.clients.findIndex(c => c.peer === player.id), 1);    
    this.players.splice(this.players.findIndex(p => p.id === player.id), 1);
    
    this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
  }

  broadcast(m: HostNetworkMessage, exclude?: Player[]) {
    let clients = this.clients;

    const ids = exclude?.map(p => p.id);

    if (exclude && ids!.length > 0) {
      clients = this.clients.filter(c => ids!.indexOf(c.metadata.id) === -1)
    }

    console.log('Broadcasting to ' + clients.length + ' clients: ', m);

    const serialized = { ...m }

    serialized.payload = classToPlain(serialized.payload);

    clients.forEach(c => {
      c.send(serialized);
    })
  }

  disconnect() {
    this.broadcast({ type: HostBroadcastType.DISBANDED });
    this.peer.disconnect();
  }
}

export class Client extends Network {
  code: string = ''
  host: Peer.DataConnection | null = null

  createConnectionId() {
    return Math.random().toString(20).substr(2, 10);
  }

  send(m: ClientNetworkMessage) {
    console.log('Sending to host: ', m);

    this.host?.send(m);
  }

  join(code: string, onHostBroadcast: (message: HostNetworkMessage) => void) {
    this.peer.on('open', (id:string) => {
      this.player.id = this.player.connectionId = this.fullyQualifiedId(this.connectionId);

      this.host = this.peer.connect(this.fullyQualifiedId(code), { metadata: classToPlain(this.player) });
      this.code = code;

      this.host.peerConnection.onconnectionstatechange = (ev: any) => {
        if (ev.target.connectionState === 'failed') {
          this.onError(ev.target)
        }
      };

      this.host.on('open', () => {

        const rejoinKey = localStorage.getItem(code);
  
        if (rejoinKey) {
          this.send({ type: ClientMessageType.REJOIN_KEY, payload: rejoinKey });
          localStorage.removeItem(code);
        }
      })

      this.host.on('data', (data) => {
        console.log('Received broadcast: ', data);

        onHostBroadcast(data);
      })
      this.host.on('close', () => {
        console.log('closed');
        onHostBroadcast({ type: HostBroadcastType.DISCONNECTED });
      })

      this.host.on('error', (err:any) => {
        console.log(err);
      });
    });
    this.peer.on('disconnected', () => {
      console.log('disconnected');
    })
  }

  disconnect() {
    if (this.host) {
      this.host.close();
    }
  }
}
