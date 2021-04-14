import React, { RefObject } from 'react';
import styled from 'styled-components';
import { Action, IAction } from '../Actions';
import { GameState, TURN_SECONDS_TIMEOUT, TURN_SECONDS_WARNING } from '../Game';
import { Player } from '../Player';
import { AvatarUI } from './Avatars';
import { BoardUI } from './Board';
import { PlayerUI } from './Player';
import { GameTitle } from './Splash';

const GameStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`

const CenterColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 50vw;
`

const SideColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  justify-content: space-around;
  width: 25vw;
`

const LeftSideColumnStyle = styled(SideColumnStyle)`
`;

const RightSideColumnStyle = styled(SideColumnStyle)`
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

const GameHeaderStyle = styled.div`
  text-align: center;
  position: relative;
`

const TertiaryMenuStyle = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  user-select: text;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  font-size: 12px; 
`

const LobbyCodeInputStyle = styled.input`
  background: transparent;
  border: 0;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  font-size: 12px; 
  width: 30px;
  text-align: center;
  padding: 0;
  margin: 0;
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
  lobbyCode: string
  gameErrors?: string[]
}

export interface AnimationRefs {
  players: RefObject<PlayerUI>[]
  board: RefObject<BoardUI>
}

export default class GameUI extends React.Component<GameUIProps> {
  animationRefs: AnimationRefs;
  originalTitle: string;
  lastTitle: string;

  constructor(props: GameUIProps) {
    super(props);
    this.originalTitle = `[${props.lobbyCode}] Schmeckles`
    this.lastTitle = '';

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

  printDebugInfo() {
    console.log('DEBUG INFO:');
    console.log('contextPlayer: ', this.props.contextPlayer);
    console.log('gameState: ', this.props.gameState);
    console.log('lastAction: ', this.props.lastAction);
  }

  updatePlayerTurnWindowTitle() {
    this.lastTitle = document.title;

    let newTitle = `**YOUR TURN** ${this.originalTitle}`;

    if (this.props.gameState!.turnSeconds >= TURN_SECONDS_WARNING) {
      newTitle = `${TURN_SECONDS_TIMEOUT - this.props.gameState!.turnSeconds} - ${newTitle}`;
    }

    if (this.lastTitle !== newTitle) {
      document.title = newTitle;
    }
  }

  async componentDidUpdate(prevProps: GameUIProps) {
    if (this.props.contextPlayer.turn === this.props.gameState!.turn) {
      this.updatePlayerTurnWindowTitle();
    } else if (document.title !== this.originalTitle) {
      document.title = this.originalTitle;
    }

    const playYourTurn = () => {
      if (this.props.contextPlayer.turn === this.props.gameState!.turn) {
        const yourTurnSound = new Audio(`${process.env.PUBLIC_URL}/sounds/PlayerTurn.wav`);

        setTimeout(
          () => {
            yourTurnSound.play();
          }, 600
        )
        
      }
    }

    if (this.props.lastAction !== prevProps.lastAction) {
      const playSound = async () => {

        if ([Action.ReserveCard, Action.PurchaseCard, Action.TakeGems].includes(this.props.lastAction!.type!)) {
          const sound = new Audio(`${process.env.PUBLIC_URL}/sounds/${this.props.lastAction!.type!}.wav`);
  
          sound.onended = playYourTurn;

          sound.play();

        } else {
          playYourTurn();
        }
      }

      playSound();
    }
  }

  render() {
    return (
      <>
        <GameHeaderStyle>
          <GameTitle />
          <TertiaryMenuStyle >
            Lobby Code: <LobbyCodeInputStyle value={this.props.lobbyCode} type="text" readOnly /> <br />
            Player: <span onClick={() => this.printDebugInfo()}>{this.props.contextPlayer.name}</span>
          </TertiaryMenuStyle>
        </GameHeaderStyle>
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
                <LeftSideColumnStyle>
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
                </LeftSideColumnStyle>
                <CenterColumnStyle>
                  <BoardUI
                    gameState={this.props.gameState}
                    contextPlayer={this.props.contextPlayer}
                    ref={this.animationRefs.board}
                  />
                </CenterColumnStyle>
                <RightSideColumnStyle>
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
                </RightSideColumnStyle>
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
      </>
    )
  }
}