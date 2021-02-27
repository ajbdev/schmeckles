import React from 'react';
import styled from 'styled-components';
import GameUI from './Ui/Game';



const App = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; 
`


export default () => (
  <App>
    <GameUI />
  </App>
);
