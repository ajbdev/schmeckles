import Peer from 'peerjs';
import { Player } from './Game';

enum MessageType {
  DISBANDED = 'DISBANDED',
}

interface NetworkMessage {
  type: MessageType,
  meta?: any;
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

  fullyQualifiedId(code: string) {
    return  `schmeckles_${code}`;
  }


  abstract createConnectionId(): string;
}

export class Host extends Network {
  clients: Peer.DataConnection[] = [];

  createConnectionId() {
    return Math.random().toString(20).substr(2, 4).toUpperCase();
  }

  host(onConnect: (code: string) => void) {
    this.peer.on('open', (id) => {
      onConnect(this.connectionId);

      this.peer.on('connection', (client) => {
        this.clients.push(client);
  
        const player = client.metadata;

        console.log(player);
    
        // Receive data from clients:
        client.on('data', function(data) {
          console.log('Received', data);
        });
      })
    });
  }

  broadcast(m: NetworkMessage) {
    this.clients.forEach(c => {
      c.send(m);
    })
  }

  disconnect() {
    this.broadcast({ type: MessageType.DISBANDED });
    this.peer.disconnect();
  }
}

export class Client extends Network {
  createConnectionId() {
    return Math.random().toString(20).substr(2, 10);
  }

  join(code: string, onDisband: () => void) {
    this.peer.on('open', (id:string) => {
      const conn = this.peer.connect(this.fullyQualifiedId(code), { metadata: this.player });

      conn.on('open', () => {
        // Receive data from host
        conn.on('data', (data) => {
          console.log('received ', data);

          if (data.type === MessageType.DISBANDED) {
            onDisband();
          }
        })
      })
    })
  }

  disconnect() {
    this.peer.disconnect();
  }
}
