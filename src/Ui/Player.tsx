import React from 'react';
import styled from 'styled-components';
import { Player, Gem, GemStash, CardPile } from '../Game';
import { SchmeckleGemCoinUI } from './Board';
import { CardUI } from './Cards';
import { GemUI, IconSize } from './Gems';


interface GemColumnUIProps {
  cards: CardPile
  gems: GemStash
}

interface HudUIProps {
  player: Player
}

const HudStyle = styled.div`
  background: #fff;
  z-index: 101;
  display: flex;
  justify-content: center;
  width: 640px;
  min-height: 200px;
  border-radius: 4px;
  background: rgb(25,25,25,0.7);
  border: 4px solid #FFDC73;
  box-shadow: -1px -1px 1px #BF9B30;
  align-self: center;
`;

interface HudUIProps {
  player: Player
}

const GemColumnStyle = styled.div`
  width: 110px;
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const GemSchmeckleStashStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 80px;
  margin-left: -24px;
  
  & > div:nth-child(2n) {
    margin-top: 14px;
  }
`

const CardStackStyle = styled.div`
  position: relative;
  
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
    stroke-width: 10;
    stroke: #222;
  }
`


export const HudUI = (props: HudUIProps) => {
  const gems = Object.keys(Gem).filter(g => props.player.gems[Gem[g as keyof typeof Gem]] > 0 || props.player.cards.cards.filter(c => c.gem === Gem[g as keyof typeof Gem]).length > 0);

  return (
    <HudStyle>
      {Object.keys(Gem).map(g =>
        <>
        <GemColumnStyle>
          <GemHudIndicatorStyle>
            <GemUI gem={Gem[g as keyof typeof Gem]} size={IconSize.sm} />
            {props.player.gems[Gem[g as keyof typeof Gem]]}
          </GemHudIndicatorStyle>
          <GemSchmeckleStashStyle>
            {[...Array(props.player.gems[Gem[g as keyof typeof Gem]])].map(_ => <SchmeckleGemCoinUI gem={Gem[g as keyof typeof Gem]} />)}
          </GemSchmeckleStashStyle>
          <CardStackStyle>
            {props.player.cards.cards.sort((c1, c2) => c1.points > c2.points ? -1 : 1).filter(c => c.gem === Gem[g as keyof typeof Gem]).map(c => 
              <StackedCardStyle>
                <CardUI card={c} />
              </StackedCardStyle>
            )}
          </CardStackStyle>
        </GemColumnStyle>  
        </>
      )}    
    </HudStyle>
  )
}