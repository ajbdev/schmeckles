import Peer from 'peerjs';
import { Player } from './Player';

export enum HostBroadcastType {
  DISBANDED = 'DISBANDED',
  DISCONNECTED = 'DISCONNECTED',
  LOBBY_PLAYERS = 'LOBBY_PLAYERS',
  ACTION = 'ACTION',
  GAMESTATE = 'GAMESTATE'
}

interface HostNetworkMessage {
  type: HostBroadcastType,
  payload?: any;
}

export enum ClientMessageType {
  DISCONNECTING = 'DISCONNECTING',
  ACTION = 'ACTION'
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

  createConnectionId() {
    return Math.random().toString(20).substr(2, 4).toUpperCase();
  }

  host(onConnect: (code: string) => void, onPlayerUpdate: (p: Player[]) => void, onClientAction: (m: ClientNetworkMessage) => void) {
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
        })

        client.on('close', () => {
          console.log('closed connection with ' + client.metadata.name);
          this.players.splice(this.players.findIndex(p => p.id === client.peer), 1)
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.players });
          onPlayerUpdate(this.players);
        })
    
        client.on('data', function(data: ClientNetworkMessage) {
          console.log('Received from client: ', data);

          onClientAction(data);
        });
      })
    });
  }

  broadcast(m: HostNetworkMessage, exclude?: Player[]) {
    let clients = this.clients;

    const ids = exclude?.map(p => p.id);

    if (exclude && ids!.length > 0) {
      clients = this.clients.filter(c => ids!.indexOf(c.metadata.id) === -1)
    }

    console.log('Broadcasting to ' + clients.length + ' clients: ', m);

    clients.forEach(c => {
      c.send(m);
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
      this.player.id = this.fullyQualifiedId(this.connectionId);

      this.host = this.peer.connect(this.fullyQualifiedId(code), { metadata: this.player });
      this.code = code;

      this.host.peerConnection.onconnectionstatechange = (ev: any) => {
        if (ev.target.connectionState === 'failed') {
          this.onError(ev.target)
        }
      };

      this.host.on('open', () => {
        
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
