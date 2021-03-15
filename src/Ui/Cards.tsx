import React from 'react';
import styled from 'styled-components';
import { Tier, Card } from '../Game';
import { GemCostsUI, GemUI, IconSize, GemCostSize } from './Gems';

export enum CardSize {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl'
}

const CardSizes: { [key:string]: string[] } = {
  xs: ['50px', '72px'],
  sm: ['68px', '97px'],
  md: ['90px', '129px'],
  lg: ['120px', '172px'],
  xl: ['160px', '230px']
}

interface CardStyleProps {
  size?: CardSize
  outline?: string
}

const CardStyle = styled.div.attrs((props: CardStyleProps) => ({
  size: props.size || CardSize.md,
  outline: props.outline || ''
}))`
  width: ${props => CardSizes[props.size][0]};
  height: ${props => CardSizes[props.size][1]};
  border: 1px solid #000;
  border-radius: 5px;
  background: #fff;
  margin: 5px;
  box-shadow: ${props => props.outline};
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
  flipped?: boolean
  hideCosts?: boolean
  outline?: string
}

const GemAwardStyle = styled.div`
  position: absolute;
  right: 2px;
  top: 2px;
`

const AwardGemMap = {
  [IconSize.xs]: IconSize.xs,
  [IconSize.sm]: IconSize.sm,
  [IconSize.md]: IconSize.md,
  [IconSize.lg]: IconSize.md,
  [IconSize.xl]: IconSize.md
}

export const CardUI = (props: CardUIProps) => {
  const borderSize = BorderSize[props.size as keyof typeof BorderSize] || BorderSize.md;

  const awardGemUIProps = {
    gem: props.card.gem,
    size: props.size ? IconSize[props.size as keyof typeof IconSize] : IconSize.sm
  }

  const gemCostUIProps = {
    gems: props.card.costs,
    size: GemCostSize[props.size as keyof typeof GemCostSize]
  }

  if (props.flipped) {
    return <FlippedCardUI {...props} borderSize={borderSize} />
  }

  return (
    <CardStyle size={props.size ? props.size : CardSize.md} outline={props.outline}>
      {props.card.points ? <VictoryPointsStyle>{props.card.points}</VictoryPointsStyle> : null}
      {props.card.costs && !props.hideCosts
        ? (
          <GemCostsUI {...gemCostUIProps} />
        )
        : null
      }
      {
        props.card.gem
        ? (
          <GemAwardStyle>
            <GemUI {...awardGemUIProps} />
          </GemAwardStyle>
        )
        : null
      }
    </CardStyle>
  );
} 

interface DrawPileProps {
  tier: Tier | undefined,
  numberOfCards: number,
  size?: CardSize
}

const FlippedCardStyle = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: stretch;
`

enum BorderSize {
  xs = '6px',
  sm = '8px',
  md = '10px',
  lg = '10px',
  xl = '10px'
}

interface FlippedCardProps extends CardStyleProps {
  borderSize: BorderSize
}

const FlippedCardInnerStyle = styled.div.attrs((props: FlippedCardProps) => ({
  borderSize: props.borderSize || BorderSize.md
}))`
  font-size: 36px;
  background: #715027;
  margin: ${props => props.borderSize};
  width: 100%;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  color: #fff;
  display: flex;
`

export const FlippedCardUI = (props: { children?: React.ReactNode, size?: CardSize, borderSize?: BorderSize }) => (
  <CardStyle size={props.size}>
    <FlippedCardStyle>
      <FlippedCardInnerStyle {...props}>
        {props.children}
      </FlippedCardInnerStyle>
    </FlippedCardStyle>
  </CardStyle>
)

export const DrawPileUI = (props: DrawPileProps) => (
  <FlippedCardUI>
    {props.tier ?
      (
        <>
          {props.tier === Tier.I
            ? (<>•</>)
            : (props.tier === Tier.II)
              ? (<>••</>)
              : (props.tier === Tier.III) 
                ? (<>•••</>)
              : null}

        </>
      ) 
      : null
    }    
  </FlippedCardUI>
);