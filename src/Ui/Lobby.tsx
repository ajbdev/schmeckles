import React, { SyntheticEvent } from "react"
import styled from "styled-components"
import { GameTitle, BackgroundType, getRandomBackground, ErrorMessage } from './Splash';
import { Network, Host, Client, HostBroadcastType, ClientMessageType, ClientNetworkMessage } from '../Network';
import { GameState } from '../Game';
import { Player, generateRandomName, getAvatarFromName } from '../Player';
import Game from '../Game';
import { Action, BaseAction } from '../Actions';
import GameUI from './Game';
import { AvatarSize, AvatarUI } from './Avatars';
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
  background: rgba(214, 38, 15, 0.5);
  margin-left: 10px;
  padding: 4px;
`

const ExitToMainMenuStyle = styled.button`
  font-size: 28px;
  padding: 10px;
  margin: 10px;
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

const PlayerNameConnectingStyle = styled.span`
  color: #aaa;
`

const PlayerTypeDropdownStyle = styled.select`
  display: inline;
  width: auto;
`

interface LobbyHostProps {
  player: Player
  setIsHostingLobby: (t: boolean) => void
  setErrorMessage: (err: string) => void
  errorMessage: string
  setBgSrc: (bgSrc: string) => void
}

interface LobbyHostState {
  players: Player[]
  code: string
  contextPlayer: Player | null
  gameState: GameState | null
}

const defaultLobbyHostState = {
  players: [],
  code: '',
  gameState: null,
  contextPlayer: null
}


const game = Game.getInstance();

export class LobbyHost extends React.Component<LobbyHostProps, LobbyHostState> {
  player: Player
  host: Host

  constructor(props: LobbyHostProps) {
    super(props);
    this.player = props.player;
    this.state = defaultLobbyHostState;

    this.host = new Host(this.player, (err) => this.networkErrorHandler(err));
  }

  componentDidMount() {
    this.setState({
      players: [this.player],
      contextPlayer: this.player
    });

    const bgSrc = getRandomBackground(BackgroundType.Board);
    this.props.setBgSrc(bgSrc);

    game.gameState.background = bgSrc;

    this.setWindowCloseDialog();

    window.onunload = () => this.host.disconnect();

    this.host.onError = (err) => {
      this.props.setErrorMessage(err.toString());
      //this.props.setIsHostingLobby(false);
    }

    this.host.host(
      c => this.setState({ code: c }),
      p => this.setState({ players: p }),
      (msg: ClientNetworkMessage) => {
        switch (msg.type) {
          case ClientMessageType.DISCONNECTING:
            break;
          case ClientMessageType.ACTION:
            game.sendAction(
              msg.payload.player,
              Action[msg.payload.action as Action],
              msg.payload.meta
            )
            break;
        }
      }
    );

    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState });
    })
    game.onAction((a: BaseAction) => {
      this.broadcastAction(a.player, a.type!, a.meta, [a.player]);
    })
  }

  componentWillUnmount() {
    this.cleanupLobby();
    game.cleanup();
  }

  disbandLobby() {
    if (window.confirm('Are you sure you want to disband this lobby? Players will not be able to join with this lobby code.') && this.props.setIsHostingLobby) {
      this.props.setIsHostingLobby(false);
      this.props.setErrorMessage('');
      window.history.pushState({}, 'Schmeckles', '/');
      Game.reset();
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

  addBot() {
    const botName = generateRandomName();

    const player = new Player(botName, getAvatarFromName(botName));

    player.computer = true;
    player.connected = true;

    this.host.players.push(player);

    this.setState({
      players: this.host.players,
    });
  }

  removePlayer(player: Player) {
    this.host.removePlayer(player);

    this.setState({
      players: this.host.players
    });
  }

  sendGameState() {
    this.host.broadcast({ type: HostBroadcastType.GAMESTATE, payload: game.serialize() });
  }

  broadcastAction(p: Player, a: Action, meta: any, exclude?: Player[]) {
    this.host.broadcast({ type: HostBroadcastType.ACTION, payload: { player: p, action: a, meta } }, exclude)
  }

  startGame() {
    this.host.players.forEach(p => {
      game.sendAction(this.player, Action.JoinGame, { joiningPlayer: p });
    });
    game.sendAction(this.player, Action.StartGame, {});

    this.sendGameState();
  }

  networkErrorHandler(error: any) {
    console.error(error);
  }

  render() {
    if (this.state.gameState && this.state.gameState.started) {
      return <GameUI gameState={this.state.gameState} contextPlayer={this.state.contextPlayer!} />
    }
    return (
      <Lobby
        code={this.state.code}
        addBot={() => this.addBot()}
        players={this.state.players}
        contextPlayer={this.props.player}
        removePlayer={(p:Player) => this.removePlayer(p)}
        errorMessage={this.props.errorMessage}
        disbandLobby={() => this.disbandLobby()}
        startGame={() => this.startGame()}
      />
    )
  }
}

interface LobbyClientProps {
  player: Player
  joinLobbyCode: string
  errorMessage: string
  setJoinLobbyCode: (c: string) => void
  setErrorMessage: (err: string) => void
  setBgSrc: (bgSrc: string) => void
}

interface LobbyClientState {
  code: string
  players: Player[]
  contextPlayer: Player | null
  gameState: GameState | null
}

const defaultLobbyClientState = {
  players: [],
  code: '',
  contextPlayer: null,
  gameState: null
}

export class LobbyClient extends React.Component<LobbyClientProps, LobbyClientState> {
  player: Player
  client: Client

  constructor(props: LobbyClientProps) {
    super(props);
    this.state = defaultLobbyClientState;
    this.player = props.player;
    this.client = new Client(this.player, (err) => this.networkErrorHandler(err));
  }

  componentDidMount() {
    this.setState({
      code: this.props.joinLobbyCode.toUpperCase(),
      contextPlayer: this.player
    });

    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    });

    game.onAction((a: BaseAction) => {
      this.client.send({ type: ClientMessageType.ACTION, payload: { player: a.player, action: a.type, meta: a.meta } });
    })

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
          game.receiveAction(BaseAction.create(
            msg.payload.player,
            Action[msg.payload.action as Action],
            msg.payload.meta
          ));
          break;
        case HostBroadcastType.GAMESTATE:
          console.log('Updating game state: ', msg.payload);
          game.updateGameState(Game.unserialize(msg.payload));
          if (game.gameState.background) {
            this.props.setBgSrc(game.gameState.background);
          }
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
      return <GameUI gameState={this.state.gameState} contextPlayer={this.state.contextPlayer!} />
    }

    return (
      <Lobby 
        code={this.state.code} 
        players={this.state.players} 
        contextPlayer={this.props.player}
        errorMessage={this.props.errorMessage} 
        exitLobby={() => this.cleanupLobbyAndExit()} 
      />
    )
  }
}

interface LobbyProps {
  code: string;
  players: Player[];
  startGame?: () => void;
  addBot?: () => void;
  disbandLobby?: () => void;
  exitLobby?: () => void;
  removePlayer?: (p: Player) => void;
  contextPlayer: Player;
  errorMessage: string;
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
                  ? <PlayerNameConnectingStyle>{p.name}</PlayerNameConnectingStyle>
                  : ( 
                      <div>
                        <PlayerNameStyle>{p.name}</PlayerNameStyle>
                      </div>
                    )
                }
              </PlayerBoxStyle>
            )}
            {this.props.players.length < 4
              ? (<>
                {[...Array(4 - this.props.players.length)].map((_,ix) =>
                  <WaitingForPlayerBoxStyle key={`player_box_${ix}`}>
                    {this.props.startGame
                      ? (
                        <span>
                          Waiting for <PlayerTypeDropdownStyle onChange={e => this.changePlayers(e)}><option>Player</option><option>Computer</option></PlayerTypeDropdownStyle>
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
          {this.props.startGame && this.props.disbandLobby
            ? (
              <ButtonsStyle>
                <StartGameButtonStyle disabled={this.props.players.length < 2} onClick={() => this.props.startGame && this.props.startGame()}>Start Game</StartGameButtonStyle>
                <ExitToMainMenuStyle onClick={() => this.props.disbandLobby!()}>Exit to Main Menu</ExitToMainMenuStyle>
              </ButtonsStyle>
            )
            : <p>Game will begin when the host start the game.</p>
          }
        </ContentColumnStyle>
      </LobbyPageStyle>
    )
  }
}
