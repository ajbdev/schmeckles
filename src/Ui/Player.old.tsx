import React, { useState } from 'react';
import styled from 'styled-components';
import { Gem, GemStash, CardPile } from '../Game';
import { Player } from '../Player';
import { SchmeckleGemCoinUI, InteractiveCardUI } from './Board';
import { CardUI, CardSize } from './Cards';
import { GemUI, IconSize } from './Gems';

interface GemColumnUIProps {
  cards: CardPile
  gems: GemStash
}

interface HudUIProps {
  player: Player
}

const HudStyle = styled.div`
  z-index: 101;
  display: flex;
  justify-content: center;
  min-height: 230px;
  align-self: center;
`;

const DashChromeStyle = styled.div`
  border-radius: 4px;
  background: rgb(25,25,25,0.7);
  border: 4px solid #FFDC73;
  box-shadow: -1px -1px 1px #BF9B30;
  display: flex;
`;

interface HudUIProps {
  player: Player
}

const GemColumnStyle = styled.div`
  width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const GemSchmeckleStashStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 80px;
  margin-left: -10px;
  
  & > div:nth-child(2n) {
    margin-top: 8px;
  }
`

const CardStackStyle = styled.div`
  position: absolute;
  margin-left: -80px;
  margin-top: 45px;
`

const StackedCardStyle = styled.div`
  height: 35px;
  & > div {
    position: absolute;
    z-index: 99;

    &:hover {
      opacity: 1.0;
      z-index: 101;
    }
  }
`

const GemHudIndicatorStyle = styled.div`
  position: absolute;
  margin-top: -34px;
  display: flex;
  flex-direction: row;
  color: #fff;
  font-size: 28px;
  -webkit-text-stroke: 1px #000;
  font-weight: bold;

  svg {
    margin-right: 10px;
  }
`

const ArcedText = (props: { text: string, arc: number, radius: number}) => {
  const characters = props.text.split('');
  const degree = props.arc / characters.length;

  return (
    <>
      {characters.map((char, i) => (
        <span
          key={`arc-${i}`}
          style={{
            position: 'absolute',
            height: `${props.radius}px`,
            transform: `rotate(${degree * i - props.arc / 2}deg)`,
            transformOrigin: `0 ${props.radius}px 0`
          }}>
            {char}
          </span>
      ))}
    </>
  )
}

const VictoryPointsHudStyle = styled.div`
  width: 200px;
`

export const HudUI = (props: HudUIProps) => {
  const [isReservedCardFacing, setIsReservedCardFacing] = useState(false);

  const gems = Object.keys(Gem).filter(g => props.player.gems[Gem[g as keyof typeof Gem]] > 0 || props.player.cards.cards.filter(c => c.gem === Gem[g as keyof typeof Gem]).length > 0);

  return (
    <HudStyle>
      <DashChromeStyle>
      {Object.keys(Gem).map((g,i) =>
        <GemColumnStyle key={i}>
          <GemHudIndicatorStyle>
            <GemUI gem={Gem[g as keyof typeof Gem]} size={IconSize.sm} />
            {props.player.gems[Gem[g as keyof typeof Gem]] + props.player.cards.cards.filter(c => c.gem === Gem[g as keyof typeof Gem]).length}
          </GemHudIndicatorStyle>
          <GemSchmeckleStashStyle>
            {[...Array(props.player.gems[Gem[g as keyof typeof Gem]])].map((_,ix) => <SchmeckleGemCoinUI gem={Gem[g as keyof typeof Gem]} size={IconSize.sm} key={`${props.player.id}_${g}_${ix}`} />)}
          </GemSchmeckleStashStyle>
          <CardStackStyle>
            {props.player.cards.cards.sort((c1, c2) => c1.points > c2.points ? -1 : 1).filter(c => c.gem === Gem[g as keyof typeof Gem]).map(c => 
              <StackedCardStyle>
                <CardUI card={c} size={CardSize.sm} />
              </StackedCardStyle>
            )}
            {
              Gem[g as keyof typeof Gem] === Gem.Star
              ? (
                <>
                  {props.player.reservedCards.map((c, i) => 
                    <StackedCardStyle onMouseEnter={() => setIsReservedCardFacing(true)} onMouseLeave={() => setIsReservedCardFacing(false)}>
                      <InteractiveCardUI player={props.player} index={i} card={c} size={CardSize.sm} flipped={!isReservedCardFacing} cards={props.player.reservedCards} />
                    </StackedCardStyle>
                  )}
                </>
              )
              : null
            }
          </CardStackStyle>
        </GemColumnStyle>  
      )}    
      </DashChromeStyle>
    </HudStyle>
  )
}