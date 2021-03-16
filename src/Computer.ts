import { Action, BaseAction } from "./Actions";
import { Player } from './Player';
import Game, { GameState, Gem, Tier, shuffle,emptyGemStash, CardPile, Card } from "./Game";
import { canAffordCard } from "./Rules";


export interface SendActionInterface {
  actionType: Action
  data: any
}

interface IPurchasableCard {
  cards: Card[],
  index: number
}

const take3RandomGems = () => {
  const gems = emptyGemStash();

  shuffle([Gem.Ruby, Gem.Sapphire, Gem.Diamond, Gem.Onyx, Gem.Emerald]).slice(0,3).map(
    (g:Gem) => gems[g]++
  );

  return gems;
}

const take2RandomGems = () => {
  const gems = emptyGemStash();

  const g = shuffle([Gem.Ruby, Gem.Sapphire, Gem.Diamond, Gem.Onyx, Gem.Emerald]).pop();

  gems[g as Gem] = 2;

  return gems;
}

const reserveCard = (g: GameState): IPurchasableCard => {
  const piles: CardPile[] = [g.tierICards, g.tierIICards, g.tierIIICards];

  const pileIndex = Math.floor(Math.random()*piles.length)+1
  const cardIndex = Math.floor(Math.random()*piles[pileIndex].cards.length)+1;

  return { cards: piles[pileIndex].cards, index: cardIndex };
}


const getPurchasableCards = (p: Player, g: GameState): IPurchasableCard[] => {
  const piles: CardPile[] = [g.tierICards, g.tierIICards, g.tierIIICards];
  const purchasables: IPurchasableCard[] = []

  piles.forEach(pile => {
    pile.cards.forEach((card, ix) => {
      if (canAffordCard(card, p).passed) {
        purchasables.push({ cards: pile.cards, index: ix });
      }
    });
  });

  return purchasables;
}


export function computeAction(player: Player, gameState: GameState): SendActionInterface {
  const purchasables = shuffle(getPurchasableCards(player, gameState));

  // Attempt to purchase a card if it's possible to purchase a card
  if (purchasables.length > 0) {
    purchasables.sort((a: IPurchasableCard, b: IPurchasableCard) => a.cards[a.index].points > b.cards[b.index].points ? -1 : 1);

    const card = purchasables.pop();

    return {
      actionType: Action.PurchaseCard,
      data: { cards: card.cards, index: card.index }
    }
  }
  
  // Otherwise, randomly do any other action

  return {
    actionType: Action.PassTurn,
    data: {}
  }
}