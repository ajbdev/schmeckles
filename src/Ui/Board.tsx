import React from 'react';
import styled from 'styled-components';
import { DrawPileUI, CardUI } from './Cards';
import { Tier, CardPile, Card, GameState } from '../Game';
import { NobleUI } from './Nobles';

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
`

const TilesStyle = styled.div`
  display: flex;
  flex-direction: column;
`

export const BoardUI = (props: BoardUIProps) => (
  <BoardStyle>
    <GemBankStyle>

    </GemBankStyle>
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