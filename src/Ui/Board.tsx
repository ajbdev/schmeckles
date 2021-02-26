import React from 'react';
import styled from 'styled-components';
import { DrawPileUI, CardUI } from './Cards';
import { Tier, CardPile, Card, GameState, Gem, GemStash } from '../Game';
import { NobleUI } from './Nobles';
import { GemUI, Star } from './Gems';

const CardRowStyle = styled.div`
  display: flex;
  flex-direction: row;
`

const NobleRowStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

interface CardRowUIProps {
  tier: Tier,
  drawPile: CardPile,
  visibleCards: Card[]
}

export const CardRowUI = (props: CardRowUIProps ) => (
  <CardRowStyle>
    <DrawPileUI tier={props.drawPile.tier} numberOfCards={props.drawPile.cards.length}></DrawPileUI>
    {props.visibleCards.map((card) => 
      <CardUI card={card} />  
    )}
  </CardRowStyle>
)

interface BoardUIProps {
  gameState: GameState
}

const BoardStyle = styled.div`
  display: flex;
  flex-direction: row;
`
const GemBankStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`
const TilesStyle = styled.div`
  display: flex;
  flex-direction: column;
`

const SchmeckelStyle = styled.div`
  border-radius: 100%;
  border: 2px solid #666;
  width: 46px;
  height: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2px;
  position: relative;

  &:nth-child(2n) {
    margin-left: 24px;
  }

  svg {
    position: absolute;
    top: 6px;
    left: 7px;
  }
`

interface SchmeckelUIProps {
  gem: Gem
}

const RubySchmeckelStyle = styled(SchmeckelStyle)`
  border-color: var(--ruby);
  svg {
    top:  7px;
  }
`

const EmeraldSchmeckelStyle = styled(SchmeckelStyle)`
  border-color: var(--emerald);
  svg {
    top: 9px;
    left: 9px;
    width: 28px;
    height: 28px;
  }
`
const DiamondSchmeckelStyle = styled(SchmeckelStyle)`
  border-color: #999;
  background: #fff;
  svg {
    top: 9px;
    stroke-width: 10;
    stroke: #666;
  }
`

const OnyxSchmeckelStyle = styled(SchmeckelStyle)`
  border-color: var(--onyx);
`

const SapphireSchmeckelStyle = styled(SchmeckelStyle)`
  border-color: var(--sapphire);
`

const StarSchmeckelStyle = styled(SchmeckelStyle)`
  border-color: var(--star);
`

const SchmeckelUI = (props: SchmeckelUIProps) => {
  const map = {
    [Gem.Diamond]: DiamondSchmeckelStyle,
    [Gem.Emerald]: EmeraldSchmeckelStyle,
    [Gem.Onyx]: OnyxSchmeckelStyle,
    [Gem.Sapphire]: SapphireSchmeckelStyle,
    [Gem.Ruby]: RubySchmeckelStyle,
    [Gem.Star]: StarSchmeckelStyle
  }

  const SchmeckelGemWrapper = map[props.gem];

  return (
    <SchmeckelGemWrapper>
      <GemUI gem={props.gem} />
    </SchmeckelGemWrapper>
  )
}



const GemBankUI = (props: GemStash) => (
  <GemBankStyle>
    {props.diamond > 0 ? <SchmeckelUI gem={Gem.Diamond} /> : null}
    {props.ruby > 0 ? <SchmeckelUI gem={Gem.Ruby} />  : null}
    {props.emerald > 0 ? <SchmeckelUI gem={Gem.Emerald} />  : null}
    {props.onyx > 0 ? <SchmeckelUI gem={Gem.Onyx} />  : null}
    {props.sapphire > 0 ? <SchmeckelUI gem={Gem.Sapphire} />  : null}
    {props.star > 0 ? <SchmeckelUI gem={Gem.Star} />  : null}
  </GemBankStyle>
)


export const BoardUI = (props: BoardUIProps) => (
  <BoardStyle>
    <GemBankUI {...props.gameState.gems} />
    <TilesStyle>
      <NobleRowStyle>
        {props.gameState.nobles.map(noble => 
          <NobleUI noble={noble} />
        )}
      </NobleRowStyle>
      <CardRowUI tier={Tier.III} drawPile={props.gameState.tierIIIDrawPile} visibleCards={props.gameState.tierIIICards.cards}></CardRowUI>
      <CardRowUI tier={Tier.II} drawPile={props.gameState.tierIIDrawPile} visibleCards={props.gameState.tierIICards.cards}></CardRowUI>
      <CardRowUI tier={Tier.I} drawPile={props.gameState.tierIDrawPile} visibleCards={props.gameState.tierICards.cards}></CardRowUI>
    </TilesStyle>
  </BoardStyle>
)