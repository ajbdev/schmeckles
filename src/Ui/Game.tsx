import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState } from '../Game';
import { Player } from '../Player';
import { Action, IAction } from '../Actions';
import styled from 'styled-components';
import { BackgroundType } from './Splash';
import { PlayerUI } from './Player';
import { AvatarUI } from './Avatars';




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

const WinnerOverlayStyle = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(50,50,50,.6);
  display: flex;
  justify-content: center;
  align-items: center;
`

const WinnerModalStyle = styled.div`
  padding: 20px;
  width: 340px;
  background: #000;
  border: 3px solid var(--gold);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: #fff;
`

const PlayAgainButtonStyle = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  border: 2px solid #0e0e0e;
  background: #5ee465;
  margin-left: 20px;
  color: #fff;
  margin-top: 20px; 
  cursor: pointer;
  width: 50%;
`

const WinnerSplashUI = (props: { gameState: GameState }) => {
  const winner = props.gameState.players.filter(p => p.winner)[0];

  return (
    <WinnerOverlayStyle>
      <WinnerModalStyle>
        <AvatarUI src={winner.avatar} border={"2px solid #ccc"} />
        {winner.name} wins!
        <PlayAgainButtonStyle onClick={() => window.location.reload()}>Play Again</PlayAgainButtonStyle>
      </WinnerModalStyle>
    </WinnerOverlayStyle>
  )
}

interface GameUIState {
  gameState: GameState | null
}

const defaultState = {
  gameState: null
}

interface GameUIProps {
  gameState: GameState | null
  contextPlayer: Player
  lastAction?: IAction
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  playerRefs: any;

  constructor(props: GameUIProps) {
    super(props);

    this.state = defaultState;

    this.playerRefs = {};
  }

  componentDidMount() {
    this.setState({
      gameState: Game.unserialize({ ...this.props.gameState })
    })
  }

  componentDidUpdate(prevProps: GameUIProps, prevState: GameUIState) {
    if (prevProps.gameState!.turn !== this.state.gameState!.turn) {
      this.setState({ gameState: Game.unserialize(prevProps.gameState) })
    }
  }

  setPlayerRefs = (p:Player,slot:string,el:any) => {
    if (!this.playerRefs[p.id]) {
      this.playerRefs[p.id] = {}
    }

    this.playerRefs[p.id][slot] = el;
  }

  getPlayerRef = (p:Player,slot:string) => {
    return this.playerRefs[p.id][slot];
  }

  render() {
    return (
      <GameStyle>
        {this.state.gameState ?
          (
            <>
              <SideColumnStyle>
                {this.state.gameState.players.map((p, ix) => 
                  ix % 2 === 0 
                  ? (
                    <PlayerUI
                      player={p}
                      playerRefs={this.playerRefs}
                      setPlayerRefs={this.setPlayerRefs}
                      key={p.id}
                      isContextPlayer={this.props.contextPlayer!.id === p.id}
                      isPlayersTurn={this.state.gameState!.turn === p.turn}
                    />
                  ) : null
                )}
              </SideColumnStyle>
              <ColumnStyle>
                <BoardUI 
                  gameState={this.state.gameState} 
                  contextPlayer={this.props.contextPlayer} 
                  playerRefs={this.playerRefs} 
                />
              </ColumnStyle>
              <SideColumnStyle>
                {this.state.gameState.players.map((p, ix) => 
                  ix % 2 !== 0 
                  ? (
                    <PlayerUI
                      player={p}
                      playerRefs={this.playerRefs}
                      setPlayerRefs={this.setPlayerRefs}
                      key={p.id}
                      isContextPlayer={this.props.contextPlayer!.id === p.id}
                      isPlayersTurn={this.state.gameState!.turn === p.turn}
                    />
                  ) : null
                )}
              </SideColumnStyle>
              {this.state.gameState.ended 
                ? (
                  <WinnerSplashUI gameState={this.state.gameState} />
                )
                : null}
            </>
          )
          : null
        }
      </GameStyle>
    )
  }
}