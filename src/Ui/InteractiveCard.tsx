import { Frame } from 'framer';
import { useAnimation } from 'framer-motion';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Action } from '../Actions';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { canAffordCard, canReserveCard } from '../Rules';
import { CardUI, CardSize, CardSizes } from './Cards';

const game = Game.getInstance();



const InteractiveCardStyle = styled.div.attrs((props: { interactive?: boolean, size?: CardSize }) => ({
  interactive: props.interactive,
  size: props.size || CardSize.md
}))`
  position: relative;
  width: ${props => CardSizes[props.size][0]};
  height: ${props => CardSizes[props.size][1]};
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
  margin-left: 5px;
  margin-top: 5px;
  margin-right: -5px;
  margin-bottom: -5px;
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

  
  const cardRef = useRef<HTMLDivElement>(null);
  const animator = useAnimation();

  async function reserveCardWithAnimation(p: Player, c: Card[], i: number) {
    if (cardRef.current) {
      const reserveElDimensions = props.playerRefs[props.player.id].reserve.getBoundingClientRect();
      const cardElDimensions = cardRef.current.getBoundingClientRect();

      const moveY = reserveElDimensions.y - cardElDimensions.y;
      const moveX = reserveElDimensions.x - cardElDimensions.x;

      await animator.start((i) => ({
        y: moveY,
        scale: 1.25,
        rotate: -20,
        transition: { duration: 0.2 },
      }));
      await animator.start((i) => ({
        x: moveX,
        scale: 0.5,
        rotate: 0,
        transition: { duration: 0.5 },
        transitionEnd: { scale: 1.0, x: 0, y: 0, rotate: 0 }
      }));
    }
    reserveCard(p, c, i);
  }

  const size = CardSizes[props.size ? props.size : CardSize.md];

  return (
    <InteractiveCardStyle 
      interactive={(canPurchase || canReserve) && props.isPlayersTurn} 
      ref={cardRef}
      size={props.size}
      >
      <Frame 
        background={"transparent"}
        animate={animator}
        width={size[0]} 
        height={size[1]}>
        <CardUI {...props} outline={canPurchase ? "0px 0px 0px 3px var(--gold)" : "0"} /> 
        {props.isPlayersTurn
          ? (
            <CardActionsOverlayStyle>
              <button onClick={() => purchaseCard(props.player, props.cards, props.index)} disabled={!canPurchase}>Buy</button>
              {!props.card.reserved ? <button onClick={() => reserveCardWithAnimation(props.player, props.cards, props.index)} disabled={!canReserve}>Reserve</button> : null}
            </CardActionsOverlayStyle>
          )
          : null
        }
      </Frame>
    </InteractiveCardStyle>
  )
};