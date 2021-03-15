import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState } from '../Game';
import { Player } from '../Player';
import { Action } from '../Actions';
import styled from 'styled-components';
import { BackgroundType } from './Splash';
import { PlayerUI } from './Player';

interface GameUIState {
}

const defaultState = {
  gameState: null
}


const GameStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`

const ColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
`

const SideColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  justify-content: space-around;
  padding: 20px 0;
`

interface GameUIProps {
  gameState: GameState | null
  contextPlayer: Player
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  render() {
    return (
      <GameStyle>
        {this.props.gameState ?
          (
            <>
              <SideColumnStyle>
                {this.props.gameState.players.map((p, ix) => 
                  ix % 2 === 0 
                  ? (
                    <PlayerUI
                      player={p}
                      gameState={this.props.gameState}
                      isContextPlayer={this.props.contextPlayer!.id === p.id}
                      isPlayersTurn={this.props.gameState!.turn === p.turn}
                    />
                  ) : null
                )}
              </SideColumnStyle>
              <ColumnStyle>
                <BoardUI gameState={this.props.gameState} contextPlayer={this.props.contextPlayer} />
              </ColumnStyle>
              <SideColumnStyle>
                {this.props.gameState.players.map((p, ix) => 
                  ix % 2 !== 0 
                  ? (
                    <PlayerUI
                      player={p}
                      gameState={this.props.gameState}
                      isContextPlayer={this.props.contextPlayer!.id === p.id}
                      isPlayersTurn={this.props.gameState!.turn === p.turn}
                    />
                  ) : null
                )}
              </SideColumnStyle>
            </>
          )
          : null
        }
      </GameStyle>
    )
  }
}