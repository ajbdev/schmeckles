import React, { useState } from 'react';
import styled from 'styled-components';
import { generateRandomName, getAvatarFromName, Player } from './Player';
import LobbyClient from './Ui/LobbyClient';
import LobbyHost from './Ui/LobbyHost';
import Splash, { BackgroundType, SplashBackground } from './Ui/Splash';

const AppStyle = styled.div`
  height: 100%;
`

const App = () => {

  const randomName = generateRandomName();
  const randomAvatar = getAvatarFromName(randomName);
  
  const [isHostingLobby, setIsHostingLobby] = useState(false);
  const [player, setPlayer] = useState(new Player(randomName, randomAvatar));
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bgSrc, setBgSrc] = useState('');

  const hostLobby = (playerName: string, avatar: string) => {
    setIsHostingLobby(true);
    setPlayer(new Player(playerName, avatar));
  }

  const _setJoinLobbyCode = (code: string) => {
    setJoinLobbyCode(code.toUpperCase());
  }

  const joinLobby = (code: string, playerName:string, avatar: string) => {
    setJoinLobbyCode(code.toUpperCase());
    setPlayer(new Player(playerName, avatar));
  }

  return (
    <SplashBackground type={BackgroundType.Board} src={bgSrc}>
      <AppStyle>
        {isHostingLobby ? <LobbyHost player={player} setIsHostingLobby={setIsHostingLobby} setErrorMessage={setErrorMessage} errorMessage={errorMessage} setBgSrc={setBgSrc} /> : null}
        {joinLobbyCode ? <LobbyClient player={player} joinLobbyCode={joinLobbyCode} setErrorMessage={setErrorMessage} errorMessage={errorMessage} setJoinLobbyCode={_setJoinLobbyCode} setBgSrc={setBgSrc} /> : null}
        {!isHostingLobby && !joinLobbyCode ? <Splash hostLobby={hostLobby} joinLobby={joinLobby} errorMessage={errorMessage} /> : null}
      </AppStyle>
    </SplashBackground>
  )
};


export default App;