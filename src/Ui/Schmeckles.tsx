import { Frame, AnimationControls } from 'framer';
import { useAnimation } from "framer-motion"
import React, { ForwardedRef, useEffect, useRef, useState }  from "react"
import styled from "styled-components"
import { TakeGems } from "../Actions"
import { Gem } from "../Game"
import { AnimationRefs } from "./Game"
import { IconSize, GemUI } from "./Gems"


const SchmeckleSizeMap = {
  [IconSize.xs]: '30px',
  [IconSize.sm]: '32px',
  [IconSize.md]: '46px',
  [IconSize.lg]: '46px',
  [IconSize.xl]: '46px'
}

const SchmeckleStyle = styled.div.attrs((props: { size?: IconSize, held?: boolean }) => ({
  size: props.size ? SchmeckleSizeMap[props.size] : SchmeckleSizeMap[IconSize.md],
  held: !!props.held
}))`
  width: ${props => props.size};
  height: ${props => props.size};
  margin: 2px 0;
  position: relative;

  svg {
    background: #fff;
    position: absolute;
    z-index: 100;
    border: ${props => props.held ? '2px dashed #666' : '2px solid #666'};
    ${props => props.held ? `
      opacity: 0.7;
    ` : null}
    border-radius: 100%;
    padding: 5px;
  }
`


const RubySchmeckleStyle = styled(SchmeckleStyle)`
  svg {
    border-color: var(--ruby);
  }
`

const EmeraldSchmeckleStyle = styled(SchmeckleStyle)`
  svg {
    border-color: var(--emerald);
  }
`
const DiamondSchmeckleStyle = styled(SchmeckleStyle)`
  svg {
    border-color: #999;
    background: #fff;
    stroke-width: 10;
    stroke: #666;
  }
`

const OnyxSchmeckleStyle = styled(SchmeckleStyle)`
  svg { border-color: var(--onyx); }
`

const SapphireSchmeckleStyle = styled(SchmeckleStyle)`
  svg { border-color: var(--sapphire); }
`

const StarSchmeckleStyle = styled(SchmeckleStyle)`
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

export const SchmeckleGemStash = styled.div.attrs((props: { isPlayersTurn: boolean }) => ({
  isPlayersTurn: props.isPlayersTurn
}))`
  display: flex;
  flex-direction: row;
  width: 80px;
  background: #666;
  border-radius: 46px;
  height: 50px;
  padding-left: 2px;
  box-shadow: -1px -1px 1px #4d4d4d;

  &:not(:last-child) {
    margin-bottom: 6px;
  }
  padding-right: 36px;

  ${props => props.isPlayersTurn && `
    &:hover {
      cursor: pointer;
    }
  `}
`

export async function animateGemTo(animator: AnimationControls, startX: number, startY: number) {
  await animator.start(i => ({
    x: startX,
    y: startY,
    zIndex: 900,
    scale: 2.0,
    transition: { duration: 0 }
  }));
  await animator.start(i => ({
    visibility: 'visible',
    transition: { duration: 0 }
  }));
  await animator.start((i) => ({
    x: 0,
    y: 0,
    type: 'spring',
    rotate: 359,
    scale: 1.0,
    transition: { duration: 0.5 },
  }));
  await animator.start((i) => ({
    transition: { duration: 0.25 },
    zIndex: 0,
    transitionEnd: { scale: 1.0, x: 0, y: 0, rotate: 0 }
  }));
}

interface SchmeckleGemCoinProps {
  gem: Gem
  size?: IconSize
  held?: boolean
  lastAction?: TakeGems
  animationRefs?: AnimationRefs
}

export const SchmeckleGemCoinUI = React.forwardRef((props: SchmeckleGemCoinProps, ref: ForwardedRef<HTMLDivElement>) => {

  const animate = useAnimation();
  const frameRef = useRef<HTMLDivElement>(null);

  const map = {
    [Gem.Diamond]: DiamondSchmeckleStyle,
    [Gem.Emerald]: EmeraldSchmeckleStyle,
    [Gem.Onyx]: OnyxSchmeckleStyle,
    [Gem.Sapphire]: SapphireSchmeckleStyle,
    [Gem.Ruby]: RubySchmeckleStyle,
    [Gem.Star]: StarSchmeckleStyle
  }

  const SchmeckleCoinWrapUI = map[props.gem];


  useEffect(() => {    
    if (frameRef.current && props.animationRefs && props.lastAction) {
      const board = props.animationRefs.board.current as any;

      const originalGemArea = board.gemBankRef.current.gemRefs[props.gem].current.getBoundingClientRect();
      const destinationArea = frameRef.current.getBoundingClientRect();

      const x = originalGemArea.x - destinationArea.x;
      const y = originalGemArea.y - destinationArea.y;

      animateGemTo(animate,x,y);
    }

  }, [props.lastAction, props.animationRefs]);

  return(
    <>
      <SchmeckleCoinWrapUI size={props.size} held={props.held} ref={ref}>
        <Frame background={"transparent"} width={props.size ? props.size : IconSize.md} height={props.size} animate={animate} ref={frameRef} style={props.lastAction ? { visibility: 'hidden' } : {}}>
          <GemUI gem={props.gem} size={props.size ? props.size : IconSize.md} />
        </Frame>
      </SchmeckleCoinWrapUI>
    </>
  )
});
