import React from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';
import Splash, { SplashBackground, GameTitle } from './Ui/Splash';



const AppStyle = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`

const App = () => (
  <SplashBackground>
    <AppStyle>
      <Splash />
    </AppStyle>
  </SplashBackground>
);


export default App;