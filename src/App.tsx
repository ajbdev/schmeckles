import React from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';



const AppStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; 
`
const App = () => (
  <AppStyle>
    <GameUI />
  </AppStyle>
);


export default App;