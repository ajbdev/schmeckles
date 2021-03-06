import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Player } from '../Game';
import { HudUI } from './Player';
import { Action } from '../Actions';
import styled from 'styled-components';

interface GameUIProps {
  gameState: GameState
}

interface GameUIState {
}

const defaultState = {}

const PlayerListStyle = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <>
        {this.props.gameState ?
          (
            <>
              <BoardUI gameState={this.props.gameState} />
              {this.props.gameState.contextPlayer 
                ? <HudUI player={this.props.gameState.contextPlayer} />
                : null
              }
              <PlayerListStyle>
                {this.props.gameState.players.map((p,i) =>
                  <li key={p.id}>{this.props.gameState!.turn === (i+1) ? '*' : null}{p.name}</li>  
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