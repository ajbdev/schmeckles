
import React, { ForwardedRef, RefObject, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { AnimationControls, Frame, useAnimation } from 'framer'
import { Action, IAction, PurchaseCard, ReserveCard } from '../Actions';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { canAffordCard, canReserveCard } from '../Rules';
import { CardUI, CardSize } from './Cards';
import { AnimationRefs } from './Game';
import { useEffect } from 'react';

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
  reserveCard?: (a: any, b: any, c: any) => void
  lastAction?: ReserveCard | PurchaseCard
  animationRefs?: AnimationRefs
}


const purchaseCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.PurchaseCard, { cards, index: ix });
}

const reserveCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.ReserveCard, { cards, index: ix });
}

export async function animateCardTo(animator: AnimationControls, moveX: number, moveY: number, after: () => void) {
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

  after();
}

const InteractiveCardUI = React.forwardRef((props: InteractiveCardUIProps, ref: ForwardedRef<HTMLDivElement>) => {
  const canPurchase = canAffordCard(props.card, props.player).passed;
  const canReserve = canReserveCard(props.player).passed;

  const animate = useAnimation();;
  // if (props.animate) {
  //   animateCardTo(animate, props.animate.moveX, props.animate.moveY, props.animate.onFinish);
  // }

  useEffect(() => {    
    if (props.lastAction && props.lastAction.card.id === props.card.id) {
    }

  }, [props.lastAction, props.animationRefs, props.card]);

  const size = InteractiveCardSizes[props.size ? props.size : CardSize.md];

  return (
    <InteractiveCardStyle
      interactive={(canPurchase || canReserve) && props.isPlayersTurn}
      size={props.size}
      ref={ref}
    >
      <Frame background={"transparent"} width={size[0]} height={size[1]} animate={animate}>
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
      </Frame>
    </InteractiveCardStyle>
  )
});

export default InteractiveCardUI;