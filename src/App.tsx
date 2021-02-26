import React from 'react';
import './App.css';
import GameUI from './Ui/Game';
import { RubyCostUI } from './Ui/Gems';

function App() {
  return (
    <>
      <GameUI />
      <RubyCostUI cost={4} />
    </>
  );
}

export default App;
