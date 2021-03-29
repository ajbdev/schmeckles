
import React, { ForwardedRef, RefObject, useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { animationControls, AnimationControls, Frame, useAnimation } from 'framer'
import { Action, IAction, PurchaseCard, ReserveCard } from '../Actions';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { canAffordCard, canReserveCard } from '../Rules';
import { CardUI, CardSize } from './Cards';
import { AnimationRefs } from './Game';
import { useEffect } from 'react';
import { PlayerUI } from './Player';

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
  isAlreadyPurchased?: boolean;
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

export async function animateCardTo(animator: AnimationControls, startX: number, startY: number) {
  await animator.start(i => ({
    x: startX,
    y: startY,
    zIndex: 900,
    transition: { duration: 0 }
  }));
  await animator.start((i) => ({
    y: -30,
    scale: 1.25,
    rotate: -20,
    transition: { duration: 0.2 },
  }));
  await animator.start((i) => ({
    x: -20,
    scale: 0.547,
    rotate: -10,
    transition: { duration: 0.5 }
  }));
  await animator.start((i) => ({
    transition: { duration: 0.25 },
    rotate: 0,
    zIndex: 0,
    transitionEnd: { scale: 1.0, x: 0, y: 0, rotate: 0 }
  }));
}

export async function animateCardFadeIn(animator: AnimationControls) {
  await animator.start({ opacity: 0, transition: { duration: 0 } });

  await animator.start({ opacity: 1.0, transition: { duration: 1.0 } });
}

const InteractiveCardUI = React.forwardRef((props: InteractiveCardUIProps, ref: ForwardedRef<HTMLDivElement>) => {
  const canPurchase = canAffordCard(props.card, props.player).passed && !props.isAlreadyPurchased;
  const canReserve = canReserveCard(props.player).passed && !props.isAlreadyPurchased;
  const [isAnimating, setIsAnimating] = useState(false);
  const animate = useAnimation();
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {    
    if (frameRef.current && props.animationRefs && props.lastAction && props.lastAction.card.id === props.card.id) {
      setIsAnimating(true);

      const board = props.animationRefs.board.current as any;
      const originalCardSpot = board[`tier${Tier[props.lastAction.card.tier]}CardRefs`][props.lastAction.index];

      const originalCardArea = originalCardSpot.current.getBoundingClientRect();
      const destinationArea = frameRef.current.getBoundingClientRect();

      const x = originalCardArea.x  - destinationArea.x;
      const y = originalCardArea.y  - destinationArea.y;

      animateCardTo(animate, x, y).then(r => setIsAnimating(false));
    } else if (frameRef.current && props.card.drawn) {
      animateCardFadeIn(animate);
    }
  }, [props.lastAction, props.animationRefs, props.card]);

  const sz = isAnimating ? CardSize.md : props.size;

  const size = InteractiveCardSizes[sz ? sz : CardSize.md];
  const flipped = isAnimating ? false : props.flipped;

  return (
    <InteractiveCardStyle
      interactive={(canPurchase || canReserve) && props.isPlayersTurn}
      size={sz}
      ref={ref}
    >
      <Frame background={"transparent"} width={size[0]} height={size[1]} animate={animate} ref={frameRef}>
        <CardUI {...props} flipped={flipped} size={sz} outline={canPurchase ? "0px 0px 0px 3px var(--gold)" : "0"} />
        {props.isPlayersTurn && !props.isAlreadyPurchased
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