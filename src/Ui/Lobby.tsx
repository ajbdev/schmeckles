import React, { useRef, useEffect, useState } from "react"
import styled from "styled-components"
import { GameTitle } from "./Splash"
import { Network, Host, Client } from '../Network';
import { Player } from '../Game';


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


interface LobbyHostProps {
  playerName: string;
  setIsHostingLobby: (t: boolean) => void;
  setErrorMessage: (err: string) => void;
}

interface LobbyHostState {
  players: Player[]
  code: string
}

const defaultLobbyHostState = {
  players: [],
  code: ''
}

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
    this.setWindowCloseDialog();


    this.host.host(c => this.setState({ code: c }))
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

  componentWillUnmount() {
    this.cleanupLobby();
  }

  setWindowCloseDialog() {
    window.onbeforeunload = (e) => {
      const message = 'Are you sure you want to disband this lobby?';
      e = e || window.event;

      if (e) {
        e.returnValue = message;
      }

      return message;
    }
  }

  networkErrorHandler(error: any) {
  }

  render() {
    return (
      <Lobby code={this.state.code} players={this.state.players} disbandLobby={() => this.disbandLobby()} />
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
}

const defaultLobbyClientState = {
  players: [],
  code: ''
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
    this.setState({ code: this.props.joinLobbyCode });
    this.client.join(this.props.joinLobbyCode, () => this.exitWithErrorMessage('Lobby was disbanded by host'));
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
    return (
      <Lobby code={this.state.code} players={this.state.players} exitLobby={() => this.cleanupLobbyAndExit()} />
    )
  }
}

interface LobbyProps {
  code: string;
  players: Player[];
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
    window.history.pushState({}, `Schmeckles #${c}`, `/${c}`)
    document.title = `Schmeckles #${c}`
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
                ? (<>{this.props.players[i].name}</>)
                : (<>Waiting for {this.props.code ? 'host' : 'players'}...</>)
              }
              
            </PlayerBoxStyle>
          )}
          </PlayerBoxes>
        </ContentColumnStyle>
      </LobbyPageStyle>
    )
  }
}
