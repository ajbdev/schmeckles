import React from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';
import Splash, { SplashBackground, getRandomSplashBackground, GameTitle } from './Ui/Splash';



const AppStyle = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`
// const App = () => (
//   <AppStyle>
//     <Splash />
//   </AppStyle>
// );

const bgImg = getRandomSplashBackground();

const App = () => (
  <SplashBackground imageSrc={bgImg}>
    <AppStyle>
      <GameTitle />
      <GameUI />
    </AppStyle>
  </SplashBackground>
);


export default App;