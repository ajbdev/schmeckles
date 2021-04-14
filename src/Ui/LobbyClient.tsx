import React from "react";
import { Action, BaseAction, IAction } from '../Actions';
import Game, { GameEvent, GameState, LOBBY_COUNTDOWN_FROM } from '../Game';
import { Client, ClientMessageType, HostBroadcastType } from '../Network';
import { Player } from '../Player';
import GameUI from './Game';
import LobbyUI from './Lobby';


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
  lastAction?: IAction
  countdown?: number
  gameErrors: string[]
}

const defaultLobbyClientState = {
  players: [],
  code: '',
  contextPlayer: null,
  gameState: null,
  gameErrors: []
}

const game = Game.getInstance();

export default class LobbyClient extends React.Component<LobbyClientProps, LobbyClientState> {
  player: Player
  client: Client
  countdownTimer?: ReturnType<typeof setInterval>

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

    // When the game state is deserialized from the network connection, the local context player object is dereferenced
    // so we must setup a new reference any time we set state.
    const getContextPlayerFromState = (gameState: GameState) => {
      const result = gameState.players.find(p => p.id === this.state.contextPlayer!.id) || this.state.contextPlayer;

      return result || null;
    }

    game.events.on(GameEvent.StateUpdated, (gameState: GameState) => {
      this.setState({ gameState, contextPlayer: getContextPlayerFromState(gameState) });
    });

    game.events.on(GameEvent.ActionReceived, (a: BaseAction, gameState: GameState) => {
      console.log('Action recieved: ', a, gameState);
      this.setState({ gameState, lastAction: a, contextPlayer: getContextPlayerFromState(gameState) });
    });

    game.events.on(GameEvent.ActionStarted, (a: BaseAction) => {
      console.log('Action started: ', a);
      this.client.send({ type: ClientMessageType.ACTION, payload: { player: a.player, action: a.type, meta: a.meta } });
    });

    game.events.on(GameEvent.ActionFailed, (a: BaseAction) => {
      console.log('Action failed: ', a);
      if (a.player.id === this.player.id) {
        this.setState({
          gameErrors: a.failedRules.map(fr => fr.message)
        }, () => setTimeout(() => { 
          this.setState({ gameErrors: [] })
        }, 3000))
      }
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
        case HostBroadcastType.REJOIN_KEY:
          localStorage.setItem(this.props.joinLobbyCode, msg.payload);
          break;
        case HostBroadcastType.LOBBY_PLAYERS:
          this.setState({ players: msg.payload });
          break;
        case HostBroadcastType.LOBBY_COUNTDOWN:
          this.setState({ countdown: LOBBY_COUNTDOWN_FROM });
          this.countdownTimer = setInterval(() => {
            if (this.state.countdown !== undefined && this.state.countdown <= 0 && this.countdownTimer) {
              clearInterval(this.countdownTimer);
              this.countdownTimer = undefined;
              this.setState({ countdown: undefined });
            }

            this.setState({ countdown: this.state.countdown! - 1 });
          }, 1000);
          break;
        case HostBroadcastType.ACTION:
          const player = game.gameState.players.find(p => p.id === msg.payload.player.id);

          game.receiveAction(BaseAction.create(
            player!,
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
      return (
        <GameUI 
          gameState={this.state.gameState} 
          contextPlayer={this.state.contextPlayer!}
          lobbyCode={this.state.code}
          gameErrors={this.state.gameErrors}
          lastAction={this.state.lastAction}
        />
      )
    }

    return (
      <LobbyUI
        code={this.state.code} 
        countdown={this.state.countdown}
        players={this.state.players} 
        contextPlayer={this.props.player}
        errorMessage={this.props.errorMessage} 
        exitLobby={() => this.cleanupLobbyAndExit()} 
      />
    )
  }
}