import { Action, BaseAction } from "./Actions";
import { Player } from './Player';
import Game, { GameState, Gem, Tier, shuffle,emptyGemStash } from "./Game";


export interface SendActionInterface {
  actionType: Action
  data: any
}


export function computeAction(player: Player, gameState: GameState): SendActionInterface {
  return {
    actionType: Action.PassTurn,
    data: {}
  }


  const gems = emptyGemStash();

  shuffle([Gem.Ruby, Gem.Sapphire, Gem.Diamond, Gem.Onyx, Gem.Emerald]).slice(0,3).map(
    (g:Gem) => gems[g]++
  );

  return {
    actionType: Action.TakeGems,
    data: {
      gems: gems
    }
  }
}