import React, { useState } from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';
import Lobby from './Ui/Lobby';
import Splash, { SplashBackground } from './Ui/Splash';

const AppStyle = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`

const App = () => {

  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [hostPlayerName, setHostPlayerName] = useState('');


  const hostLobby = (playerName: string) => {
    setIsLobbyOpen(true);
    setHostPlayerName(playerName);
  }

  return (
    <SplashBackground>
      <AppStyle>
        {isLobbyOpen ? <Lobby hostPlayerName={hostPlayerName} /> : <Splash hostLobby={hostLobby} />}
      </AppStyle>
    </SplashBackground>
  )
};


export default App;