import React from 'react';
import styled from 'styled-components';
import { Player, Gem, GemStash, CardPile } from '../Game';


interface GemColumnUIProps {
  cards: CardPile
  gems: GemStash
}

interface HudUIProps {
  player: Player
}

const HudStyle = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 200px;
  border-top: 1px solid #000;
  background: #fff;
  z-index: 101;
`;

interface HudUIProps {
  player: Player
}


export const HudUI = (props: HudUIProps) => {
  const gems = Object.keys(Gem).filter(g => props.player.gems[g as Gem] > 0 && props.player.cards.cards.filter(c => c.gem === Gem[g as keyof typeof Gem]).length > 0);

  return (
    <HudStyle>
      {gems.map(g => <>{g}</>)}    
    </HudStyle>
  )
}