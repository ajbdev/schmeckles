import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Player } from '../Game';
import { HudUI } from './Player';

interface GameUIProps {}

interface GameUIState {
  gameState: GameState | null
  player: Player | null
}

const defaultState = {
  gameState: null,
  player: null
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    const game = Game.getInstance();

    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    })

    const player = new Player('Andy', 1);

    this.setState({
      gameState: game.gameState,
      player: player
    })
  }

  sendAction() {
    
  }

  render() {
    //create(p: Player, t: Action, meta: any)
    return (
      <>
        {this.state.gameState ?
          (
            <>
              <BoardUI gameState={this.state.gameState} />
              <HudUI cards={this.state.player!.cards} gems={this.state.player!.gems} />
            </>
          )
          : null
        }
      </>
    )
  }
}