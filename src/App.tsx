import React, { useState } from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';
import { LobbyClient, LobbyHost } from './Ui/Lobby';
import Splash, { BackgroundType, SplashBackground } from './Ui/Splash';

const AppStyle = styled.div`
  height: 100%;
`

const App = () => {

  const [isHostingLobby, setIsHostingLobby] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bgSrc, setBgSrc] = useState('');

  const hostLobby = (playerName: string) => {
    setIsHostingLobby(true);
    setPlayerName(playerName);
  }

  const _setJoinLobbyCode = (code: string) => {
    setJoinLobbyCode(code.toUpperCase());
  }

  const joinLobby = (code: string, playerName:string) => {
    setJoinLobbyCode(code.toUpperCase());
    setPlayerName(playerName);
  }

  return (
    <SplashBackground type={BackgroundType.Board} src={bgSrc}>
      <AppStyle>
        {isHostingLobby ? <LobbyHost playerName={playerName} setIsHostingLobby={setIsHostingLobby} setErrorMessage={setErrorMessage} errorMessage={errorMessage} setBgSrc={setBgSrc} /> : null}
        {joinLobbyCode ? <LobbyClient playerName={playerName} joinLobbyCode={joinLobbyCode} setErrorMessage={setErrorMessage} errorMessage={errorMessage} setJoinLobbyCode={_setJoinLobbyCode} setBgSrc={setBgSrc} /> : null}
        {!isHostingLobby && !joinLobbyCode ? <Splash hostLobby={hostLobby} joinLobby={joinLobby} errorMessage={errorMessage} /> : null}
      </AppStyle>
    </SplashBackground>
  )
};


export default App;