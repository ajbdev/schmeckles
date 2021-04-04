import React, { LegacyRef, RefObject } from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Tier } from '../Game';
import { Player } from '../Player';
import { Action, IAction, ReserveCard } from '../Actions';
import styled from 'styled-components';
import { BackgroundType } from './Splash';
import { PlayerUI } from './Player';
import { AvatarUI } from './Avatars';
import { AnimationControls, useAnimation } from 'framer';

const GameStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`

const ColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
`

const SideColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
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

const GameErrorsStyle = styled.ul`
  list-style-type: none;
  font-size: 20px;
  color: #fff;
  position: fixed;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.75);
  top: 10px;
  z-index: 101;

  & li {
    list-style-type: none;
  }
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

interface GameUIProps {
  gameState: GameState | null
  contextPlayer: Player
  lastAction?: IAction
  gameErrors?: string[]
}

export interface AnimationRefs {
  players: RefObject<PlayerUI>[]
  board: RefObject<BoardUI>
}

export default class GameUI extends React.Component<GameUIProps> {
  animationRefs: AnimationRefs;

  constructor(props: GameUIProps) {
    super(props);

    this.animationRefs = {
      players: [],
      board: React.createRef()
    }

  }

  componentDidMount() {
    for (let i in this.props.gameState!.players) {
      this.animationRefs.players.push(React.createRef());
    }
  }

  async componentDidUpdate(prevProps: GameUIProps) {
    if (this.props.lastAction !== prevProps.lastAction) {
      // Await animations here before transitioning to authoritative gameState

      const playSound = () => {
        if ([Action.ReserveCard, Action.PurchaseCard, Action.TakeGems].includes(this.props.lastAction!.type!)) {
          const sound = new Audio(`${process.env.PUBLIC_URL}/sounds/${this.props.lastAction!.type!}.wav`);
  
          sound.play();
        }
      }

      playSound();
    }
  }

  render() {
    return (
      <GameStyle>
        {this.props.gameErrors && this.props.gameErrors.length > 0
          ? (
            <GameErrorsStyle>
              {this.props.gameErrors.map(e => 
                <li>{e}</li>  
              )}
            </GameErrorsStyle>
          )
          : null
        }
        {this.props.gameState ?
          (
            <>
              <SideColumnStyle>
                {this.props.gameState.players.map((p, ix) =>
                  ix % 2 === 0
                    ? (
                      <PlayerUI
                        player={p}
                        turnSeconds={this.props.gameState!.turnSeconds}
                        animationRefs={this.animationRefs}
                        lastAction={this.props.lastAction}
                        ref={this.animationRefs.players[ix]}
                        key={p.id}
                        isContextPlayer={this.props.contextPlayer!.id === p.id}
                        isPlayersTurn={this.props.gameState!.turn === p.turn}
                      />
                    ) : null
                )}
              </SideColumnStyle>
              <ColumnStyle>
                <BoardUI
                  gameState={this.props.gameState}
                  contextPlayer={this.props.contextPlayer}
                  ref={this.animationRefs.board}
                />
              </ColumnStyle>
              <SideColumnStyle>
                {this.props.gameState.players.map((p, ix) =>
                  ix % 2 !== 0
                    ? (
                      <PlayerUI
                        player={p}
                        animationRefs={this.animationRefs}
                        turnSeconds={this.props.gameState!.turnSeconds}
                        lastAction={this.props.lastAction}
                        ref={this.animationRefs.players[ix]}
                        key={p.id}
                        isContextPlayer={this.props.contextPlayer!.id === p.id}
                        isPlayersTurn={this.props.gameState!.turn === p.turn}
                      />
                    ) : null
                )}
              </SideColumnStyle>
              {this.props.gameState.ended
                ? (
                  <WinnerSplashUI gameState={this.props.gameState} />
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