import Peer from 'peerjs';
import { Player } from './Game';

export enum HostBroadcastType {
  DISBANDED = 'DISBANDED',
  DISCONNECTED = 'DISCONNECTED',
  LOBBY_PLAYERS = 'LOBBY_PLAYERS'
}

interface HostNetworkMessage {
  type: HostBroadcastType,
  meta?: any;
}

enum ClientMessageType {
  DISCONNECTING = 'DISCONNECTING'
}

interface ClientNetworkMessage {
  type: ClientMessageType
  meta?: any
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
    this.peer = new Peer(this.fullyQualifiedId(this.connectionId), { debug: this.debugLevel });

    this.peer.on('error', onError);
  }

  destroy() {
    this.peer.connections.forEach((c:any) => c.disconnect());
    this.peer.disconnect();
    this.peer.destroy();
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

  destroy() {
    this.peer.connections.forEach((c:any) => c.disconnect());
    this.peer.disconnect();
    this.peer.destroy();
  }

  host(onConnect: (code: string) => void, onPlayerUpdate: (p: Player[]) => void) {
    this.player.connected = true;
    this.players = [this.player];

    this.peer.on('open', (id) => {
      onConnect(this.connectionId);

      this.peer.on('connection', (client) => {
  
        const player = client.metadata;
        if (this.players.length < 4 && player.name.length > 0) {
          this.players.push(player);
          this.clients.push(client);

          onPlayerUpdate(this.players);
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, meta: this.players });
        }

        client.on('open', () => {
          client.metadata.connected = true;
          // Send players when the connection is ready
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, meta: this.players });
          onPlayerUpdate(this.players);
        });

        client.on('close', () => {
          console.log('closed connection with ' + client.metadata.name);
          this.players.splice(this.players.findIndex(p => p.connectionId === client.peer), 1)
          this.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, meta: this.players });
          onPlayerUpdate(this.players);
        })
    
        // Receive data from clients:
        client.on('data', function(data) {
          console.log('Received', data);
        });
      })
    });
  }

  broadcast(m: HostNetworkMessage) {
    console.log('Broadcasting: ', m);

    this.clients.forEach(c => {
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

  createConnectionId() {
    return Math.random().toString(20).substr(2, 10);
  }

  join(code: string, onHostBroadcast: (message: HostNetworkMessage) => void) {
    this.peer.on('open', (id:string) => {
      this.player.connectionId = this.fullyQualifiedId(this.connectionId);

      const conn = this.peer.connect(this.fullyQualifiedId(code), { metadata: this.player });
      this.code = code;

      conn.on('open', () => {
        // Receive data from host
        conn.on('data', (data) => {
          console.log('Received broadcast: ', data);
          onHostBroadcast(data);
        })

        conn.on('close', () => {
          onHostBroadcast({ type: HostBroadcastType.DISCONNECTED });
        })
      })
    })
  }

  disconnect() {
    this.peer.connections[this.fullyQualifiedId(this.code)][0].close();
  }
}
