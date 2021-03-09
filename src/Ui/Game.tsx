import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Player } from '../Game';
import { HudUI } from './Player';
import { Action } from '../Actions';
import styled from 'styled-components';
import { BackgroundType } from './Splash';

interface GameUIState {
}

const defaultState = {
  gameState: null
}

const PlayerListStyle = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`

const PlayerListItemStyle = styled.li.attrs((props: { isContextPlayer: boolean }) => ({
  isContextPlayer: props.isContextPlayer || false
}))`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.isContextPlayer ? '#fff' : '#000'};
`


const GameStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`

const ColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  width: 670px;
`

const SideColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  align-self: flex-start;
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
              <SideColumnStyle />
              <ColumnStyle>
                <BoardUI gameState={this.props.gameState} contextPlayer={this.props.contextPlayer} />
                {this.props.contextPlayer 
                  ? <HudUI player={this.props.contextPlayer} />
                  : null
                }
              </ColumnStyle>
              <SideColumnStyle>
                <PlayerListStyle>
                  {this.props.gameState.players.map((p,i) =>
                    <PlayerListItemStyle 
                      key={p.id}
                      isContextPlayer={p.id === this.props.contextPlayer!.id}
                    >{this.props.gameState!.turn === (i+1) ? '▸ ' : null}{p.name}</PlayerListItemStyle>  
                  )}
                </PlayerListStyle>
              </SideColumnStyle>
            </>
          )
          : null
        }
      </GameStyle>
    )
  }
}