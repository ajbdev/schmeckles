import React from "react"
import { BackgroundType, getRandomBackground, ErrorMessage } from './Splash';
import { Host, HostBroadcastType, ClientMessageType, ClientNetworkMessage } from '../Network';
import { GameEvent, GameState } from '../Game';
import { Player, generateRandomName, getAvatarFromName } from '../Player';
import Game from '../Game';
import { Action, BaseAction, IAction } from '../Actions';
import GameUI from './Game';
import LobbyUI from './Lobby';


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
  lastAction?: IAction
  countdown?: number
  gameErrors: string[]
}

const defaultLobbyHostState = {
  players: [],
  code: '',
  gameState: null,
  contextPlayer: null,
  gameErrors: []
}

const game = Game.getInstance();

export default class LobbyHost extends React.Component<LobbyHostProps, LobbyHostState> {
  player: Player
  host: Host
  countdownTimer?: ReturnType<typeof setInterval>

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
            const player = game.gameState.getPlayer(msg.payload.player.id);

            game.sendAction(
              player!,
              Action[msg.payload.action as Action],
              msg.payload.meta
            )
            break;
        }
      }
    );

    game.events.on(GameEvent.ActionReceived, (a: BaseAction, gameState: GameState) => {
      this.setState({ gameState, lastAction: a });
    });

    game.events.on(GameEvent.ActionStarted, (a: BaseAction, gs: GameState) => {
      this.broadcastAction(a.player, a.type!, a.meta, [a.player]);
    });

    game.events.on(GameEvent.ActionFailed, (a: BaseAction) => {
      if (a.player.id === this.player.id) {
        this.setState({
          gameErrors: a.failedRules.map(fr => fr.message)
        }, () => setTimeout(() => { 
          this.setState({ gameErrors: [] })
        }, 3000));
      }
    });
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

    this.host.broadcast({ type: HostBroadcastType.LOBBY_PLAYERS, payload: this.host.players })
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

  startCountdown() {
    this.host.broadcast({ type: HostBroadcastType.LOBBY_COUNTDOWN });

    this.setState({ countdown: 10 });
    this.countdownTimer = setInterval(() => {
      if (this.state.countdown !== undefined && this.state.countdown <= 0 && this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = undefined;
        this.setState({ countdown: undefined });
        this.startGame();
      }

      this.setState({ countdown: this.state.countdown! - 1 });
    }, 1000);
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
      return (
        <GameUI 
          gameState={this.state.gameState} 
          lastAction={this.state.lastAction}
          gameErrors={this.state.gameErrors}
          contextPlayer={this.state.contextPlayer!} 
        />
      )
    }
    return (
      <LobbyUI
        code={this.state.code}
        addBot={() => this.addBot()}
        players={this.state.players}
        countdown={this.state.countdown}
        contextPlayer={this.props.player}
        removePlayer={(p:Player) => this.removePlayer(p)}
        errorMessage={this.props.errorMessage}
        disbandLobby={() => this.disbandLobby()}
        startCountdown={() => this.startCountdown()}
      />
    )
  }
}