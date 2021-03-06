import React, { useState } from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';
import { LobbyClient, LobbyHost } from './Ui/Lobby';
import Splash, { SplashBackground } from './Ui/Splash';

const AppStyle = styled.div`
  height: 100%;
`

const App = () => {

  const [isHostingLobby, setIsHostingLobby] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  

  const hostLobby = (playerName: string) => {
    setIsHostingLobby(true);
    setPlayerName(playerName);
  }

  const joinLobby = (code: string, playerName:string) => {
    setJoinLobbyCode(code);
    setPlayerName(playerName);
  }

  return (
    <SplashBackground>
      <AppStyle>
        {isHostingLobby ? <LobbyHost playerName={playerName} setIsHostingLobby={setIsHostingLobby} setErrorMessage={setErrorMessage} /> : null}
        {joinLobbyCode ? <LobbyClient playerName={playerName} joinLobbyCode={joinLobbyCode} setErrorMessage={setErrorMessage} setJoinLobbyCode={setJoinLobbyCode} /> : null}
        {!isHostingLobby && !joinLobbyCode ? <Splash hostLobby={hostLobby} joinLobby={joinLobby} errorMessage={errorMessage} /> : null}
      </AppStyle>
    </SplashBackground>
  )
};


export default App;