import React from 'react';
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

export interface BoardAnimation {
  board: {
    tierICards?: { index: number, moveX: number, moveY: number, onFinish: () => void }
    tierIICards?: { index: number, moveX: number, moveY: number, onFinish: () => void }
    tierIIICards?: { index: number, moveX: number, moveY: number, onFinish: () => void }
    gemBank?: {}
  }
}

interface GameUIState {
  gameState: GameState | null
  animations: BoardAnimation
}

const defaultState = {
  gameState: null,
  animations: { board: {} }
}

interface GameUIProps {
  gameState: GameState | null
  contextPlayer: Player
  lastAction?: IAction
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  animationRefs: any;

  constructor(props: GameUIProps) {
    super(props);

    this.state = defaultState;

    this.animationRefs = {
      players: [],
      board: React.createRef()
    }

  }

  componentDidMount() {
    for (let i in this.props.gameState!.players) {
      this.animationRefs.players.push(React.createRef());
    }
    this.setState({
      gameState: Game.unserialize({ ...this.props.gameState })
    })
  }

  /**
   * We use a derived state from prop updates to render the game board. Although deriving state 
   * in React components are generally frowned upon, we use it because:
   * 
   *  - It allows us to easily animate DOM elements from network calls.
   *  - The nature of the gameplay requires very few prop updates from the top component, 
   *    so the performance hit of rendering twice for each parent component update is marginal.
   *  - The game object gameState instance is still treated as the authoritative source,
   *    and overrides any child component local state operations.
   */
  async componentDidUpdate(prevProps: GameUIProps, prevState: GameUIState) {
    if (this.props.lastAction !== prevProps.lastAction) {
      // Await animations here before transitioning to authoritative gameState

      if (this.props.lastAction!.type === Action.ReserveCard) {
        const a = this.props.lastAction as ReserveCard;

        const tier = a.cards[a.index].tier as Tier;

        const cardRef = this.animationRefs.board.current[`tier${Tier[tier]}CardRefs`][a.index].current;
        const playerRef = this.animationRefs.players[a.player.turn - 1].current;

        const reserveElDimensions = playerRef.reservedRef.current.getBoundingClientRect();
        const cardElDimensions = cardRef.getBoundingClientRect();

        const moveX = reserveElDimensions.x - cardElDimensions.x - 20;
        const moveY = reserveElDimensions.y - cardElDimensions.y - 29;

        const animations = {
          board: {
            [`tier${Tier[tier]}Cards`]: {
              index: a.index, moveX: moveX, moveY: moveY, onFinish: () => {
                this.setState({ animations: { board: {} }, gameState: Game.unserialize(this.props.gameState) })
              }
            }
          }
        };

        this.setState({ animations });


      } else {
        this.setState({ gameState: Game.unserialize(this.props.gameState) })

      }


    }
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
                        ref={this.animationRefs.players[ix]}
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
                  ref={this.animationRefs.board}
                  animations={this.state.animations}
                />
              </ColumnStyle>
              <SideColumnStyle>
                {this.state.gameState.players.map((p, ix) =>
                  ix % 2 !== 0
                    ? (
                      <PlayerUI
                        player={p}
                        ref={this.animationRefs.players[ix]}
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