
import namesJson from './names.json';
import { GemStash, CardPile, Card, PlayerTurn, Noble, emptyGemStash } from './Game';

const males = {
  names: namesJson.filter(n => n.gender === 'male').map(n => n.name),
  avatars: [...new Array(18)].map((_, i) => `${process.env.PUBLIC_URL}/avatars/male${i+1}.jpg`)
}

const females = {
  names: namesJson.filter(n => n.gender === 'female').map(n => n.name),
  avatars: [...new Array(9)].map((_, i) => `${process.env.PUBLIC_URL}/avatars/female${i+1}.jpg`)
}

export const suggestNameForAvatar = (avatar: string): string => {
  if (males.avatars.filter(a => a === avatar).length > 0) {
    return males.names[~~(males.names.length * Math.random())];
  }
  if (females.avatars.filter(a => a === avatar).length > 0) {
    return females.names[~~(females.names.length * Math.random())];
  }

  return generateRandomName();
}

export const getAvatarFromName = (name: string):string => {
  if (males.names.filter(n => n === name).length > 0) {
    return males.avatars[~~(males.avatars.length * Math.random())];
  }
  if (females.names.filter(n => n === name).length > 0) {
    return females.avatars[~~(females.avatars.length * Math.random())];
  }
  
  const all = males.avatars.concat(females.avatars);

  return all[~~(all.length * Math.random())];
}

export const avatars = { males, females }

const names = namesJson.map(n => n.name);

export function generateRandomName() {
  return names[Math.floor(Math.random()*names.length)];;
}

export class Player {
  id: string;
  name: string;
  gems: GemStash;
  cards: CardPile;
  reservedCards: Card[];
  turn: PlayerTurn;
  nobles: Noble[];
  connected: boolean;
  connectionId: string;
  computer: boolean;
  avatar: string;
  winner: boolean;

  constructor(name: string, avatar: string) {    
    this.id = name;
    this.name = name;
    this.avatar = avatar;
    this.gems = emptyGemStash();
    this.cards = new CardPile();
    this.reservedCards = [];
    this.nobles = [];
    this.connected = false;
    this.connectionId = '';
    this.computer = false;
    this.winner = false;
    this.turn = 0;
  }

  victoryPoints() {
    let total = 0;

    if (this.cards.cards.length > 0) {
      total += this.cards.cards.map(c => c.points).reduce((a,b) => a+b);
    }

    if (this.nobles.length > 0) {
      total += this.nobles.map(n => n.points).reduce((a,b) => a+b);
    }

    return total;
  }
}
