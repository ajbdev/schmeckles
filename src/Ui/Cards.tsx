import React from 'react';
import styled from 'styled-components';
import { Tier, Card } from '../Game';
import { GemCostsUI, GemUI } from './Gems';

export enum CardSize {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl'
}

const CardSizes: { [key:string]: string[] } = {
  xs: ['50px', '72x'],
  sm: ['68px', '97px'],
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
  background: #fff;
  margin: 5px;
  position: relative;
  user-select: none;
`


export const VictoryPointsStyle = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #000;
  margin-left: 3px;
`

interface CardUIProps {
  card: Card
  size?: CardSize
}

const GemAwardStyle = styled.div`
  position: absolute;
  right: 2px;
  top: 2px;
  svg {
    width: 25px;
    height: 25px;
  }
`

export const CardUI = (props: CardUIProps) => (
  <CardStyle size={props.size ? props.size : CardSize.md}>
    {props.card.points ? <VictoryPointsStyle>{props.card.points}</VictoryPointsStyle> : null}
    {props.card.costs 
      ? (
        <GemCostsUI gems={props.card.costs} />
      )
      : null
    }
    {
      props.card.gem
      ? (
        <GemAwardStyle>
          <GemUI gem={props.card.gem} />
        </GemAwardStyle>
      )
      : null
    }
  </CardStyle>
);

interface DrawPileProps {
  tier: Tier | undefined,
  numberOfCards: number
}

const TierCardStyle = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: stretch;
`

const TierDots = styled.div`
  font-size: 36px;
  background: #715027;
  margin: 10px;
  width: 100%;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  color: #fff;
  display: flex;
`

export const DrawPileUI = (props: DrawPileProps) => (
  <CardStyle>
    {props.tier ?
      (
        <TierCardStyle>
          <TierDots>
            {props.tier === Tier.I
              ? (<>•</>)
              : (props.tier === Tier.II)
                ? (<>••</>)
                : (props.tier === Tier.III) 
                  ? (<>•••</>)
                  : null
            }
          </TierDots>
        </TierCardStyle>
      )
      : null
    }    
  </CardStyle>
);