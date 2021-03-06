import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Game, { GameState } from './Game';
import GameUI from './Ui/Game';
import { LobbyClient, LobbyHost } from './Ui/Lobby';
import Splash, { SplashBackground } from './Ui/Splash';

const AppStyle = styled.div`
  height: 100%;
`

const game = Game.getInstance();

const App = () => {

  const [isHostingLobby, setIsHostingLobby] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [gameState, setGameState] = useState({ background: '' });

  useEffect(() => {
    game.onStateUpdate((gs: GameState) => {
      setGameState(gs);
    })
  }, [])
  

  const startLobbyHost = (playerName: string) => {
    setIsHostingLobby(true);
    setPlayerName(playerName);
  }

  const startLobbyClient = (code: string, playerName:string) => {
    setJoinLobbyCode(code);
    setPlayerName(playerName);
  }

  return (
    <>
      {!isHostingLobby && !joinLobbyCode ? <Splash hostLobby={startLobbyHost} joinLobby={startLobbyClient} errorMessage={errorMessage} /> 
        : <SplashBackground src={gameState.background}>
            <AppStyle>
              {isHostingLobby ? <LobbyHost playerName={playerName} setIsHostingLobby={setIsHostingLobby} setErrorMessage={setErrorMessage} /> : null}
              {joinLobbyCode ? <LobbyClient playerName={playerName} joinLobbyCode={joinLobbyCode} setErrorMessage={setErrorMessage} setJoinLobbyCode={setJoinLobbyCode} /> : null}
            </AppStyle>
        </SplashBackground>
      }
    </>
  )
};


export default App;