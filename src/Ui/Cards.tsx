import React from 'react';
import styled from 'styled-components';
import { Tier, Card } from '../Game';

enum CardSize {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl'
}

const CardSizes: { [key:string]: string[] } = {
  xs: ['50px', '72x'],
  sm: ['68px', '97x'],
  md: ['90px', '129px'],
  lg: ['120px', '172px'],
  xl: ['160px', '230px']
}

interface CardStyleProps {
  size?: CardSize
}

const CardStyle = styled.div.attrs((props: CardStyleProps) => ({
  size: props.size || CardSize.md
}))`
  width: ${props => CardSizes[props.size][0]};
  height ${props => CardSizes[props.size][1]};
  border: 1px solid #000;
  border-radius: 5px;
  display: flex;
  align-items: center;
`

export const VictoryPointsStyle = styled.div`
  font-size: 20px;
`

interface CardUIProps {
  card: Card
}

export const CardUI = (props: CardUIProps) => (
  <CardStyle>
    <VictoryPointsStyle>{props.card.points}</VictoryPointsStyle>
  </CardStyle>
);

interface DrawPileProps {
  tier: Tier,
  numberOfCards: number
}

export const DrawPileUI = (props: DrawPileProps) => (
  <CardStyle>
    {props.tier === Tier.I
      ? (<>•</>)
      : (props.tier === Tier.II)
        ? (<>• •</>)
        : (props.tier === Tier.III) 
          ? (<>• • •</>)
          : null
    }
  </CardStyle>
);