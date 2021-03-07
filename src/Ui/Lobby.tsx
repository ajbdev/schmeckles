import React from "react"
import styled from "styled-components"
import { GameTitle } from "./Splash"
import { Network, Host, Client, HostBroadcastType } from '../Network';
import { Player, GameState } from '../Game';
import Game from '../Game';
import { Action, BaseAction } from '../Actions';
import GameUI from './Game';


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

const PlayerBoxes = styled.div`
  width: 450px;
  display: flex;
  flex-wrap: wrap;
`

const PlayerBoxStyle = styled.div`
  width: 200px;
  border: 2px solid #ccc;
  height: 200px;
  margin: 10px;
  background: rgba(55,55,55,0.5);
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const LobbyCode = styled.div`
  font-size: 24px;
  padding: 20px;
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
  background: rgba(214, 38, 15, 0.5);
  margin-left: 10px;
  padding: 4px;
`

const StartGameButtonStyle = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  background: #91a4e6;
  border: 2px solid #3451b3;
  margin: 10px;
  width: auto;
`

const PlayerNameConnectingStyle = styled.span`
  color: #aaa;
`

interface LobbyHostProps {
  playerName: string;
  setIsHostingLobby: (t: boolean) => void;
  setErrorMessage: (err: string) => void;
}

interface LobbyHostState {
  players: Player[]
  code: string,
  gameState: GameState | null
}

const defaultLobbyHostState = {
  players: [],
  code: '',
  gameState: null
}


const game = Game.getInstance();

export class LobbyHost extends React.Component<LobbyHostProps, LobbyHostState> {
  player: Player
  host: Host

  constructor(props: LobbyHostProps) {
    super(props);
    this.player = new Player(props.playerName);
    this.state = defaultLobbyHostState;
    
    this.host = new Host(this.player, (err) => this.networkErrorHandler(err));
  }

  componentDidMount() {
    this.setState({
      players: [this.player]
    });

    this.setWindowCloseDialog();

    window.onunload = () => this.host.disconnect();

    this.host.host(c => this.setState({ code: c }), p => this.setState({ players: p }));
    
    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    })
    game.onAction((a: BaseAction) => {
      this.broadcastAction(a.player, a.type!, a.meta);
    });
  }

  componentWillUnmount() {
    this.cleanupLobby();
    game.cleanup();
  }

  disbandLobby() {
    if (window.confirm('Are you sure you want to disband this lobby? Players will not be able to join with this lobby code.') && this.props.setIsHostingLobby) {
      this.props.setIsHostingLobby(false);
      window.history.pushState({}, 'Schmeckles', '/');
      document.title = 'Schmeckles';
    }
  }

  cleanupLobby() {
    window.onbeforeunload = null;
    this.host.disconnect();
  }

  setWindowCloseDialog() {
    window.onbeforeunload = (e: any) => {
      const message = 'Are you sure you want to disband this lobby?';
      e = e || window.event;

      if (e) {
        e.returnValue = message;
      }

      return message;
    }
  }

  broadcastAction(p: Player, a: Action, meta: any) {
    this.host.broadcast({ type: HostBroadcastType.ACTION, payload: { player: p, action: a, meta } })
  }

  startGame() {
    this.host.players.forEach(p => {
      const isContextPlayer = this.player.connectionId === p.connectionId;
      
      game.sendAction(p, Action.JoinGame, { isContextPlayer });
    });
    game.sendAction(this.player, Action.StartGame, {});
  }

  networkErrorHandler(error: any) {
    console.error(error);
  }

  render() {
    if (this.state.gameState && this.state.gameState.started) {
      return <GameUI gameState={this.state.gameState} />
    }
    return (
      <Lobby code={this.state.code} players={this.state.players} disbandLobby={() => this.disbandLobby()} startGame={() => this.startGame()} />
    )
  }
}

interface LobbyClientProps {
  playerName: string;
  joinLobbyCode: string;
  setJoinLobbyCode: (c: string) => void;
  setErrorMessage: (err: string) => void;
}

interface LobbyClientState {
  code: string
  players: Player[]
  gameState: GameState | null
}

const defaultLobbyClientState = {
  players: [],
  code: '',
  gameState: null
}

export class LobbyClient extends React.Component<LobbyClientProps,LobbyClientState> {
  player: Player
  client: Client

  constructor(props: LobbyClientProps) {
    super(props);
    this.state = defaultLobbyClientState;
    this.player = new Player(props.playerName);
    this.client = new Client(this.player, (err) => this.networkErrorHandler(err));
  }

  componentDidMount() {
    this.setState({ 
      code: this.props.joinLobbyCode.toUpperCase()
    });

    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    });

    window.onunload = () => this.client.disconnect();

    this.client.join(this.props.joinLobbyCode, (msg) => {
      switch (msg.type) {
        case HostBroadcastType.DISBANDED:
          this.exitWithErrorMessage('Lobby was disbanded by host');
          break;
        case HostBroadcastType.DISCONNECTED:
          this.exitWithErrorMessage('Disconnected');
          break;
        case HostBroadcastType.LOBBY_PLAYERS:
          this.setState({ players: msg.payload });
          break;
        case HostBroadcastType.ACTION:
          game.sendAction(msg.payload.player, Action[msg.payload.action as Action], msg.payload.meta)
          break;
      }
    });
  }

  componentWillUnmount() {
    this.cleanupLobby();
  }

  exitWithErrorMessage(msg: string) {
    this.props.setErrorMessage(msg);
    this.props.setJoinLobbyCode('');
  }

  networkErrorHandler(error: any) {
    if (error.type === 'peer-unavailable') {
      this.exitWithErrorMessage('Lobby not found');
    }
    this.exitWithErrorMessage('Network error');
    console.error(error);
  }

  cleanupLobbyAndExit() {
    this.cleanupLobby();
    this.client.disconnect();
    this.props.setJoinLobbyCode('');
  }

  cleanupLobby() {
    window.history.pushState({}, 'Schmeckles', '/');
    document.title = 'Schmeckles';
  }

  render() {
    if (this.state.gameState && this.state.gameState.started) {
      return <GameUI gameState={this.state.gameState} />
    }
    return (
      <Lobby code={this.state.code} players={this.state.players} exitLobby={() => this.cleanupLobbyAndExit()} />
    )
  }
}

interface LobbyProps {
  code: string;
  players: Player[];
  startGame?: () => void;
  disbandLobby?: () => void;
  exitLobby?: () => void;
}

class Lobby extends React.Component<LobbyProps> {
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

  render() {
    return (
      <LobbyPageStyle>
        <ContentColumnStyle>
          <GameTitle />
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
            : (
                <>
                  Establishing P2P network connection...
                </>
              )
          }
          <PlayerBoxes>
          {[...Array(4)].map((p,i) =>
            <PlayerBoxStyle key={i}>
              {this.props.players[i] 
                ? (
                  <>
                    {!this.props.players[i].connected 
                      ? <PlayerNameConnectingStyle>{this.props.players[i].name}</PlayerNameConnectingStyle>
                      : <>{this.props.players[i].name}</>
                    }
                  </>
                )
                : (<>Waiting for players...</>)
              }
              
            </PlayerBoxStyle>
          )}
          </PlayerBoxes>
          {this.props.players.length < 2
            ? <p>At least two players needed to start game.</p>
            : null}

          {this.props.startGame 
            ? (
              <StartGameButtonStyle disabled={this.props.players.length < 2} onClick={() => this.props.startGame && this.props.startGame()}>Start Game</StartGameButtonStyle>
            )
            : <p>Game will begin when the host start the game.</p>
          }
        </ContentColumnStyle>
      </LobbyPageStyle>
    )
  }
}
