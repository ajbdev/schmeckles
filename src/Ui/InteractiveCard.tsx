
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Action } from '../Actions';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { canAffordCard, canReserveCard } from '../Rules';
import { CardUI, CardSize } from './Cards';

const game = Game.getInstance();


const InteractiveCardSizes: { [key:string]: string[] } = {
  xs: ['60px', '82px'],
  sm: ['78px', '107px'],
  md: ['100px', '139px'],
  lg: ['130px', '182px'],
  xl: ['170px', '240px']
}

const InteractiveCardStyle = styled.div.attrs((props: { interactive?: boolean, size?: CardSize }) => ({
  interactive: props.interactive,
  size: props.size || CardSize.md
}))`
  position: relative;
  width: ${props => InteractiveCardSizes[props.size][0]};
  height: ${props => InteractiveCardSizes[props.size][1]};
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  border-radius: 4px;
  border: 1px solid transparent;
`

const CardActionsOverlayStyle = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  margin: 5px;
  background: rgba(50,50,50,.1);
  display: none;
  flex-direction: column;
  justify-content: flex-end;
  padding: 5px;

  & button {
    display: block;
    cursor: pointer;
    padding: 5px;

    &:first-child {
      margin-bottom: 4px;
    }
  }

  ${InteractiveCardStyle}:hover & {
    display: flex;
  }
`

interface InteractiveCardUIProps {
  card: Card
  player: Player
  index: number
  cards: Card[]
  isPlayersTurn: boolean
  disableReserve?: boolean
  flipped?: boolean
  size?: CardSize
  reserveCard?: (a:any, b:any, c:any) => void
  playerRefs: { [key:string]: any }
}


const purchaseCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.PurchaseCard, { cards, index: ix });
}

const reserveCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.ReserveCard, { cards, index: ix });
}

export default function InteractiveCardUI(props: InteractiveCardUIProps) {
  const canPurchase = canAffordCard(props.card, props.player).passed;
  const canReserve = canReserveCard(props.player).passed;

  const size = InteractiveCardSizes[props.size ? props.size : CardSize.md];

  return (
    <InteractiveCardStyle 
      interactive={(canPurchase || canReserve) && props.isPlayersTurn} 
      size={props.size}
      >
      <CardUI {...props} outline={canPurchase ? "0px 0px 0px 3px var(--gold)" : "0"} /> 
      {props.isPlayersTurn
        ? (
          <CardActionsOverlayStyle>
            <button onClick={() => purchaseCard(props.player, props.cards, props.index)} disabled={!canPurchase}>Buy</button>
            {!props.card.reserved ? <button onClick={() => reserveCard(props.player, props.cards, props.index)} disabled={!canReserve}>Reserve</button> : null}
          </CardActionsOverlayStyle>
        )
        : null
      }
    </InteractiveCardStyle>
  )
};