import React from "react"
import { Client, HostBroadcastType, ClientMessageType } from '../Network';
import { GameEvent, GameState } from '../Game';
import { Player } from '../Player';
import Game from '../Game';
import { Action, BaseAction, IAction } from '../Actions';
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
  lastAction?: IAction,
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

    game.events.on(GameEvent.ActionReceived, (a: BaseAction, gameState: GameState) => {
      console.log('Action recieved: ', a, gameState);
      this.setState({ gameState, lastAction: a });
      console.log('Updating game state....')
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
        case HostBroadcastType.LOBBY_PLAYERS:
          this.setState({ players: msg.payload });
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
          gameErrors={this.state.gameErrors}
          lastAction={this.state.lastAction}
        />
      )
    }

    return (
      <LobbyUI
        code={this.state.code} 
        players={this.state.players} 
        contextPlayer={this.props.player}
        errorMessage={this.props.errorMessage} 
        exitLobby={() => this.cleanupLobbyAndExit()} 
      />
    )
  }
}