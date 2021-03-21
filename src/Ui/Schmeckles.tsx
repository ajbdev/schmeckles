import { Frame, motion } from "framer"
import { useRef } from "react"
import styled from "styled-components"
import { Gem } from "../Game"
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

const SchmeckleGemStash = styled.div.attrs((props: { isPlayersTurn: boolean }) => ({
  isPlayersTurn: props.isPlayersTurn
}))`
  display: flex;
  flex-direction: row;
  max-width: 80px;
  height: 50px;
  background: #666;
  border-radius: 46px;
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

interface SchmeckleGemCoinProps {
  gem: Gem 
  size?: IconSize
  held?: boolean
  isPlayersTurn?: boolean
  setAnimationRefs?: (key:string, subKey:string, el:HTMLElement) => void
}

export const SchmeckleGemCoinUI = (props: SchmeckleGemCoinProps) => {
  const map = {
    [Gem.Diamond]: DiamondSchmeckleStyle,
    [Gem.Emerald]: EmeraldSchmeckleStyle,
    [Gem.Onyx]: OnyxSchmeckleStyle,
    [Gem.Sapphire]: SapphireSchmeckleStyle,
    [Gem.Ruby]: RubySchmeckleStyle,
    [Gem.Star]: StarSchmeckleStyle
  }

  const SchmeckleCoinWrapUI = map[props.gem];

  const size = SchmeckleSizeMap[props.size || IconSize.md];

  return (
    <SchmeckleCoinWrapUI 
      size={props.size} 
      held={props.held}
      ref={(el:HTMLDivElement) => props.setAnimationRefs!('gemBank',props.gem, el)
      }>
      <Frame width={size} height={size} background={'transparent'} whileHover={props.isPlayersTurn && !props.held ? { scale: 1.25, zIndex: 101 } : undefined}>
        <GemUI gem={props.gem} size={props.size ? props.size : IconSize.md} />
      </Frame>
    </SchmeckleCoinWrapUI>
  )
}

interface SchmeckleStackUIProps {
  gem: Gem
  amount: number
  isPlayersTurn: boolean;
  holdGem: (gem:Gem) => void
  amountHeld: number
  setAnimationRefs: (key:string, subKey:string, el:HTMLElement) => void
}

export const SchmeckleStackUI = (props: SchmeckleStackUIProps) => (
  <SchmeckleGemStash isPlayersTurn={props.isPlayersTurn} onClick={() => props.isPlayersTurn && props.holdGem(props.gem)} >
    {[...Array(props.amount-props.amountHeld)].map((_, i) => 
      <SchmeckleGemCoinUI 
        gem={props.gem} 
        key={`${props.gem}_${i}`} 
        isPlayersTurn={props.isPlayersTurn} 
      />
    )}
    {[...Array(props.amountHeld)].map((_, i) =>
      <SchmeckleGemCoinUI
        setAnimationRefs={props.setAnimationRefs}
        gem={props.gem} key={`${props.gem}_held_${i}`} 
        held={true}
        isPlayersTurn={props.isPlayersTurn} 
      />
    )}
  </SchmeckleGemStash>
)