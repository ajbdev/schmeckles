import React, { SyntheticEvent } from "react";
import styled from "styled-components";
import Game from '../Game';
import { Player } from '../Player';
import { AvatarSize, AvatarUI } from './Avatars';
import { ErrorMessage, GameTitle } from './Splash';
import { ReactComponent as CancelSvg } from './svg/cancel.svg';


const LobbyPageStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const ContentColumnStyle = styled.div`
  flex-direction: column;
  display: flex;
  justify-content: center;
  text-shadow: 1px 1px 1px #000;
  text-align: center;
  color: #fff;
`

const InAvatarStyle = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  padding: 3px;
`

const PlayerBoxes = styled.div`
  width: 450px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`

const PlayerBoxStyle = styled.div`
  width: 150px;
  height: 150px;
  margin: 10px;
  border: 2px solid transparent;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
`

const CpuStyle = styled.div`
  font-size: 12px;

`;

const PlayerNameStyle = styled.span`
  font-weight: bold;
  color: #fff;
  font-size: 20px;
  text-shadow: 1px 1px 2px #000;
  margin-top: 10px;
`

const WaitingForPlayerBoxStyle = styled.div`
  width: 150px;
  border: 2px solid #ccc;
  height: 150px;
  margin: 10px;
  background: rgba(55,55,55,0.5);
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const LobbyCode = styled.div`
  font-size: 24px;
  padding: 20px;
`

const RemovePlayerStyle = styled.span`
  color: var(--cancel);
  vertical-align: middle;
  margin-left: 8px;

  svg {
    fill: var(--cancel);
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  &:hover {
    svg { fill: var(--cancel-hover) }
  }
`

const CodeUnderline = styled.input`
  background: rgba(55,55,55,0.6);
  font-size: 24px;
  text-align: center;
  color: #fff;
  border: 0;
  display: inline;
  width: 80px;
  text-shadow: 1px 1px 1px #000;
  text-decoration: underline;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
`

const ExitLink = styled.a`
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #ff0000;
  border-radius: 3px;
  color: #eee;
  user-select: none;
  background: rgba(214, 38, 15, 0.5);
  margin-left: 10px;
  padding: 4px;
`

const ExitToMainMenuStyle = styled.button`
  font-size: 28px;
  padding: 10px;
  margin: 10px;
  user-select: none;
  cursor: pointer;
  background: transparent;
  color: #fff;
  border-radius: 3px;
  border: 2px solid #fff;
  display: block;
  width: auto;
`

const StartGameButtonStyle = styled.button`
  border-radius: 0;
  font-size: 28px;
  cursor: pointer;
  user-select: none;
  padding: 10px;
  background: #91a4e6;
  border: 2px solid #3451b3;
  margin: 10px;
  display: block;
  width: auto;
`

const NoticeStyle = styled.div`
  margin: 10px;
`

const ButtonsStyle = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  align-self: center;
`
const CountdownMaskStyle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  user-select: none;
  background: rgba(50,50,50,0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const CountdownStyle = styled.div`
  padding: 10px;
  margin-bottom: 100px;
  font-size: 40px;
  user-select: none;
  font-weight: bold;
`

const PlayerNameConnectingStyle = styled.span`
  color: #aaa;
`

const PlayerTypeDropdownStyle = styled.select`
  display: inline;
  width: auto;
`



const game = Game.getInstance();


interface LobbyProps {
  code: string;
  players: Player[];
  startCountdown?: () => void;
  addBot?: () => void;
  disbandLobby?: () => void;
  exitLobby?: () => void;
  removePlayer?: (p: Player) => void;
  contextPlayer: Player;
  errorMessage: string;
  countdown?: number;
}


export default class Lobby extends React.Component<LobbyProps> {
  codeInput: React.RefObject<HTMLInputElement>;

  constructor(props: LobbyProps) {
    super(props);
    this.codeInput = React.createRef();
  }

  componentDidUpdate(prevProps: LobbyProps) {
    if (this.props.code !== prevProps.code) {
      this.updateBrowserLocation(this.props.code);
    }
  }

  updateBrowserLocation = (c: string) => {
    window.history.pushState({}, `[${c}] Schmeckles`, `/${c}`)
    document.title = `[${c}] Schmeckles`
  }

  copyCodeToClipboard = () => {
    this.codeInput.current!.select();
    document.execCommand("copy");
  }

  changePlayers(e: SyntheticEvent) {
    const target = e.target as HTMLSelectElement;

    if (target.value === 'Computer' && this.props.addBot) {
      this.props.addBot();
    }
  }

  removePlayer(p: Player) {
    if (p.computer) {
      return this.props.removePlayer!(p)
    }
    if (window.confirm('Are you sure you want to remove this player')) {
      this.props.removePlayer!(p);
    }
  }

  render() {
    return (
      <LobbyPageStyle>
        <ContentColumnStyle>
          <GameTitle />
          {this.props.countdown !== undefined && this.props.countdown >= 0
            ? (
              <CountdownMaskStyle>
                <h3>Game will begin in</h3>
                <CountdownStyle>{this.props.countdown}</CountdownStyle>

                {this.props.disbandLobby
                  ? <ExitToMainMenuStyle onClick={() => this.props.disbandLobby!()}>Cancel</ExitToMainMenuStyle>
                  : null
                }
                
                {this.props.exitLobby
                  ? <ExitToMainMenuStyle onClick={() => this.props.exitLobby!()}>Cancel</ExitToMainMenuStyle>
                  : null
                }
              </CountdownMaskStyle>
            )
            : null
          }
          {this.props.code
            ? (
              <>
                <LobbyCode>
                  Lobby Code: <CodeUnderline ref={this.codeInput} type="text" value={this.props.code} readOnly={true} onClick={this.copyCodeToClipboard} />
                  {this.props.disbandLobby
                    ? (
                      <ExitLink onClick={() => this.props.disbandLobby && this.props.disbandLobby()}>
                        Disband Lobby
                      </ExitLink>
                    )
                    : null
                  }
                  {this.props.exitLobby
                    ? (
                      <ExitLink onClick={() => this.props.exitLobby && this.props.exitLobby()}>
                        Exit Lobby
                      </ExitLink>
                    )
                    : null
                  }
                </LobbyCode>
              </>
            )
            : this.props.errorMessage
              ? (
                <ErrorMessage>{this.props.errorMessage}</ErrorMessage>
              )
              : (
                <>
                  Establishing P2P network connection...
              </>
              )
          }
          <PlayerBoxes>
            <>
            {this.props.players.map((p, i) =>
              <PlayerBoxStyle key={`player_${i}`}>
                <AvatarUI size={AvatarSize.xl} src={p.avatar}>
                  <InAvatarStyle>
                  {this.props.removePlayer && p.id !== this.props.contextPlayer.id
                    ? (<RemovePlayerStyle onClick={() => this.removePlayer(p)}><CancelSvg /></RemovePlayerStyle>)
                    : null
                  }
                  {p.computer
                    ? <CpuStyle>CPU</CpuStyle>
                    : null
                  }
                  </InAvatarStyle>
                </AvatarUI>
                {!p.connected
                  ? (
                      <PlayerNameConnectingStyle>
                        {p.name} <br />
                        {p.connectionId ? <>(disconnected)</> : null}
                      </PlayerNameConnectingStyle>
                    )
                  : ( 
                      <div>
                        <PlayerNameStyle>{p.name}</PlayerNameStyle>
                      </div>
                    )
                }
              </PlayerBoxStyle>
            )}
            </>
            {this.props.players.length < 4
              ? (<>
                {[...Array(4 - this.props.players.length)].map((_,ix) =>
                  <WaitingForPlayerBoxStyle key={`player_box_${ix}`}>
                    {this.props.startCountdown
                      ? (
                        <span>
                          Waiting for 
                          {this.props.code || this.props.errorMessage
                            ? <PlayerTypeDropdownStyle onChange={e => this.changePlayers(e)}><option>Player</option><option>Computer</option></PlayerTypeDropdownStyle>
                            : <> network...</>                        
                          }
                          
                        </span>
                      )
                      : (<>Waiting for players...</>)}
                  </WaitingForPlayerBoxStyle>
                )}
              </>)
              : null
            }
          </PlayerBoxes>
          {this.props.players.length < 2
            ? <NoticeStyle>At least two players needed to start game.</NoticeStyle>
            : this.props.players.length > 4
              ? <NoticeStyle>Although you can play with more than four players, gameplay may suffer with more than four players.</NoticeStyle>
              : <NoticeStyle>&nbsp;</NoticeStyle>
          }
          {this.props.countdown === undefined
            ? (
              <>
                {this.props.startCountdown && this.props.disbandLobby 
                  ? (
                    <ButtonsStyle>
                      <StartGameButtonStyle disabled={this.props.players.filter(p => p.connected).length < 2} onClick={() => this.props.startCountdown && this.props.startCountdown()}>Start Game</StartGameButtonStyle>
                      <ExitToMainMenuStyle onClick={() => this.props.disbandLobby!()}>Exit to Main Menu</ExitToMainMenuStyle>
                    </ButtonsStyle>
                  )
                  : <NoticeStyle>Game will begin when the host start the game.</NoticeStyle>
                }
              </>
            )
            : null
          }
          {this.props.exitLobby
            ? (
              <ButtonsStyle>
                <ExitToMainMenuStyle onClick={() => this.props.exitLobby!()}>Exit to Main Menu</ExitToMainMenuStyle>
              </ButtonsStyle>
            )
            : null
          }
        </ContentColumnStyle>
      </LobbyPageStyle>
    )
  }
}
