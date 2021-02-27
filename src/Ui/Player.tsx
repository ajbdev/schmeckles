import React from 'react';
import styled from 'styled-components';
import { Player, Gem, Card, GemStash, CardPile } from '../Game';

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

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const GemTotal = styled.div`
  font-size: 30px;
  font-weight: bold;
`

interface GemColumnUIProps {
  cards: CardPile
  gems: GemStash
}

const GemColumnUI = (props: GemColumnUIProps) => (
  <>
  </>
)

export const HudUI = (props: GemColumnUIProps) => {
  const gems = Object.keys(Gem).filter(g => props.gems[g as Gem] > 0 && props.cards.cards.filter(c => c.gem == Gem[g as keyof typeof Gem]).length > 0);

  return (
    <HudStyle>
      {gems.map(g => <>{g}</>)}    
    </HudStyle>
  )
}