import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Player } from '../Game';
import { HudUI } from './Player';
import { Action } from '../Actions';
import styled from 'styled-components';

interface GameUIProps {}

interface GameUIState {
  gameState: GameState | null
}

const game = Game.getInstance();
const player1 = new Player('Andy');
const player2 = new Player('Megan')

const defaultState = {
  gameState: null
}

const PlayerListStyle = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    })
    game.sendAction(player1, Action.JoinGame, { isContextPlayer: true });
    game.sendAction(player2, Action.JoinGame, {});
    game.sendAction(player1, Action.StartGame, {});
  }

  render() {
    return (
      <>
        {this.state.gameState ?
          (
            <>
              <BoardUI gameState={this.state.gameState} />
              {this.state.gameState.contextPlayer 
                ? <HudUI player={this.state.gameState.contextPlayer} />
                : null
              }
              <PlayerListStyle>
                {this.state.gameState.players.map((p,i) =>
                  <li key={p.id}>{this.state.gameState!.turn === (i+1) ? '*' : null}{p.name}</li>  
                )}
              </PlayerListStyle>
            </>
          )
          : null
        }
      </>
    )
  }
}