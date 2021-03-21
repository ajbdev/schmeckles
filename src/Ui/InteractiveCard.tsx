import { Frame } from 'framer';
import { AnimationControls, useAnimation } from 'framer-motion';
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
  animationRefs: { [key:string]: any }
}


const purchaseCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.PurchaseCard, { cards, index: ix });
}

const reserveCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.ReserveCard, { cards, index: ix });
}

export async function animateCardTo(animator: AnimationControls, moveX: number, moveY: number) {
  await animator.start((i) => ({
    y: moveY,
    scale: 1.25,
    rotate: -20,
    transition: { duration: 0.2 },
  }));
  await animator.start((i) => ({
    x: moveX,
    scale: 0.547,
    rotate: -10,
    transition: { duration: 0.5 }
  }));
  await animator.start((i) => ({
    transition: { duration: 0.25 },
    rotate: 0,
    transitionEnd: { scale: 1.0, x: 0, y: 0, rotate: 0 }
  }));
}

export default function InteractiveCardUI(props: InteractiveCardUIProps) {
  const canPurchase = canAffordCard(props.card, props.player).passed;
  const canReserve = canReserveCard(props.player).passed;

  
  const cardRef = useRef<HTMLDivElement>(null);
  const animator = useAnimation();

  async function buyCardWithAnimation(p: Player, c: Card[], i: number) {
    if (cardRef.current) {
      const purchasedElDimensions = props.animationRefs[props.player.id].purchased.getBoundingClientRect();
      const cardElDimensions = cardRef.current.getBoundingClientRect();

      const moveX = purchasedElDimensions .x - cardElDimensions.x - 20;
      const moveY = purchasedElDimensions.y - cardElDimensions.y - 29;

      await animateCardTo(animator, moveX, moveY);
    }
    purchaseCard(p, c, i);
  }

  async function reserveCardWithAnimation(p: Player, c: Card[], i: number) {
    if (cardRef.current) {
      const reserveElDimensions = props.animationRefs[props.player.id].reserve.getBoundingClientRect();
      const cardElDimensions = cardRef.current.getBoundingClientRect();

      const moveX = reserveElDimensions.x - cardElDimensions.x - 20;
      const moveY = reserveElDimensions.y - cardElDimensions.y - 29;

      await animateCardTo(animator, moveX, moveY);
    }
    reserveCard(p, c, i);
  }

  const size = InteractiveCardSizes[props.size ? props.size : CardSize.md];

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
              <button onClick={() => buyCardWithAnimation(props.player, props.cards, props.index)} disabled={!canPurchase}>Buy</button>
              {!props.card.reserved ? <button onClick={() => reserveCardWithAnimation(props.player, props.cards, props.index)} disabled={!canReserve}>Reserve</button> : null}
            </CardActionsOverlayStyle>
          )
          : null
        }
      </Frame>
    </InteractiveCardStyle>
  )
};