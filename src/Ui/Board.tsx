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

  width: 46px;
  height: 46px;
  margin: 2px 0;
  position: relative;

  svg {
    background: #fff;
    position: absolute;
    z-index: 100;
    border: 2px solid #666;
    border-radius: 100%;
    padding: 5px;
  }
`

const RubySchmeckelStyle = styled(SchmeckelStyle)`
  svg {
    border-color: var(--ruby);
  }
`

const EmeraldSchmeckelStyle = styled(SchmeckelStyle)`
  svg {
    border-color: var(--emerald);
    width: 28px;
    height: 28px;
  }
`
const DiamondSchmeckelStyle = styled(SchmeckelStyle)`
  svg {
    border-color: #999;
    background: #fff;
    stroke-width: 10;
    stroke: #666;
  }
`

const OnyxSchmeckelStyle = styled(SchmeckelStyle)`
  svg { border-color: var(--onyx); }
`

const SapphireSchmeckelStyle = styled(SchmeckelStyle)`
  svg { border-color: var(--sapphire); }
`

const StarSchmeckelStyle = styled(SchmeckelStyle)`
  svg { border-color: var(--star); }
  cursor: default;

  &:hover {
    border: 0;
    svg {
      stroke-width: 0;
      stroke: #000;
    }
  }
`

const SchmeckelGemStash = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 80px;
  padding-right: 40px;

  &:hover {
    cursor: pointer;
    svg {
      border-color: #ffd900;
      fill: #ffd900;
      stroke: #ffd900;
    }
  }
`

interface SchmeckelUIProps {
  gem: Gem
  amount: number
}

export const SchmeckelUI = (props: SchmeckelUIProps) => {
  const map = {
    [Gem.Diamond]: DiamondSchmeckelStyle,
    [Gem.Emerald]: EmeraldSchmeckelStyle,
    [Gem.Onyx]: OnyxSchmeckelStyle,
    [Gem.Sapphire]: SapphireSchmeckelStyle,
    [Gem.Ruby]: RubySchmeckelStyle,
    [Gem.Star]: StarSchmeckelStyle
  }

  const SchmeckelGemCoin = map[props.gem];

  return (
    <>
      {[...Array(props.amount)].map(_ => 
        <SchmeckelGemCoin>
          <GemUI gem={props.gem} />
        </SchmeckelGemCoin>
      )}
    </>
  )
}

const SchmeckelStackUI = (props: SchmeckelUIProps) => (
  <SchmeckelGemStash>
    <SchmeckelUI {...props} />
  </SchmeckelGemStash>
)

interface GemBankProps {
  gems: GemStash
}

const GemBankUI = (props: GemBankProps) => (
  <GemBankStyle>
    {props.gems.diamond > 0 ? <SchmeckelStackUI gem={Gem.Diamond} amount={props.gems.diamond} /> : null}
    {props.gems.ruby > 0 ? <SchmeckelStackUI gem={Gem.Ruby} amount={props.gems.ruby} />  : null}
    {props.gems.emerald > 0 ? <SchmeckelStackUI gem={Gem.Emerald} amount={props.gems.emerald} />  : null}
    {props.gems.onyx > 0 ? <SchmeckelStackUI gem={Gem.Onyx} amount={props.gems.onyx} />  : null}
    {props.gems.sapphire > 0 ? <SchmeckelStackUI gem={Gem.Sapphire} amount={props.gems.sapphire} />  : null}
    {props.gems.star > 0 ? <SchmeckelStackUI gem={Gem.Star} amount={props.gems.star} />  : null}
  </GemBankStyle>
)


export const BoardUI = (props: BoardUIProps) => (
  <BoardStyle>
    <GemBankUI gems={props.gameState.gems} />
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