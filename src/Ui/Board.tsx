import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DrawPileUI, CardUI } from './Cards';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash } from '../Game';
import { NobleUI } from './Nobles';
import { GemUI, Sapphire, Onyx } from './Gems';
import { Action } from '../Actions';
import { ReactComponent as CancelSvg } from './svg/cancel.svg';
import { ReactComponent as ConfirmSvg } from './svg/confirm.svg';

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
    {props.visibleCards.map((card, i) => 
      <CardUI card={card} key={i} />  
    )}
  </CardRowStyle>
)
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

const game = Game.getInstance();

export const SchmeckelGemCoinUI = (props: { gem: Gem }) => {
  const map = {
    [Gem.Diamond]: DiamondSchmeckelStyle,
    [Gem.Emerald]: EmeraldSchmeckelStyle,
    [Gem.Onyx]: OnyxSchmeckelStyle,
    [Gem.Sapphire]: SapphireSchmeckelStyle,
    [Gem.Ruby]: RubySchmeckelStyle,
    [Gem.Star]: StarSchmeckelStyle
  }

  const SchmeckelCoinWrapUI = map[props.gem]

  return(
    <SchmeckelCoinWrapUI>
      <GemUI gem={props.gem} />
    </SchmeckelCoinWrapUI>
  )
}

interface SchmeckelStackUIProps {
  gem: Gem
  amount: number
  holdGem: (gem:Gem) => void
}

const SchmeckelStackUI = (props: SchmeckelStackUIProps) => (
  <SchmeckelGemStash onClick={() => props.holdGem(props.gem)} >
    {[...Array(props.amount)].map((a, i) => 
        <SchmeckelGemCoinUI gem={props.gem} key={i} />
    )}
  </SchmeckelGemStash>
)

interface GemBankProps {
  gems: GemStash
  setHeldGems: (gems:Gem[]) => void
  heldGems: Gem[]
}

const GemBankUI = (props: GemBankProps) => {

  const subtracted = {
    diamond: props.heldGems.filter((g) => g === Gem.Diamond).length,
    ruby: props.heldGems.filter((g) => g === Gem.Ruby).length,
    emerald: props.heldGems.filter((g) => g === Gem.Emerald).length,
    onyx: props.heldGems.filter((g) => g === Gem.Onyx).length,
    sapphire: props.heldGems.filter((g) => g === Gem.Sapphire).length,
    star: props.heldGems.filter((g) => g === Gem.Star).length,
  }

  const holdGem = (gem: Gem) => {
    if (props.heldGems.length < 3) {
      const gems = props.heldGems;
      
      gems.push(gem);

      props.setHeldGems(gems);
    }
  }

  return (
    <GemBankStyle>
      {props.gems.diamond > 0 ? <SchmeckelStackUI gem={Gem.Diamond} amount={props.gems.diamond-subtracted.diamond} holdGem={holdGem} /> : null}
      {props.gems.ruby > 0 ? <SchmeckelStackUI gem={Gem.Ruby} amount={props.gems.ruby-subtracted.ruby} holdGem={holdGem} />  : null}
      {props.gems.emerald > 0 ? <SchmeckelStackUI gem={Gem.Emerald} amount={props.gems.emerald-subtracted.emerald} holdGem={holdGem} />  : null}
      {props.gems.onyx > 0 ? <SchmeckelStackUI gem={Gem.Onyx} amount={props.gems.onyx-subtracted.onyx} holdGem={holdGem} />  : null}
      {props.gems.sapphire > 0 ? <SchmeckelStackUI gem={Gem.Sapphire} amount={props.gems.sapphire-subtracted.sapphire} holdGem={holdGem} />  : null}
      {props.gems.star > 0 ? <SchmeckelStackUI gem={Gem.Star} amount={props.gems.star-subtracted.star} holdGem={holdGem} />  : null}
    </GemBankStyle>
  )
}

const HoldUIStyle = styled.div`
  display: flex;
  justify-content: center;
`
const HoldGemSlotsStyle = styled.div`
  display: flex;
  border-radius: 40px;
  background: #aaa;
  padding: 5px;
  margin-top: 20px;
`

const GemSlotStyle = styled.div`
  border-radius: 100%;
  background: #777;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin-right: 5px;

  svg {
    top: -5px;
    left: -3px;
    cursor: pointer;
  }
`

const ConfirmButtonStyle = styled.div`
  width: 40px;
  height: 40px;
  padding: 5px;
  cursor: pointer;

  svg {
    width: 40px;
    height: 40px;
    fill: var(--confirm);
  }

  &:hover {
    svg { fill: var(--confirm-hover) }
  }
  `

const CancelButtonStyle = styled.div`
  width: 40px;
  height: 40px;
  padding: 5px;
  cursor: pointer;

  svg {
    margin-top: 4px;
    width: 32px;
    height: 32px;
    fill: var(--cancel);
  }

  &:hover {
    svg { fill: var(--cancel-hover) }
  }
`

interface HoldGemUIProps {
  gems: Gem[]
  setHeldGems: (gems:Gem[]) => void
}

const HoldGemUI = (props: HoldGemUIProps) => {
  const removeGem = (ix: number) => {
    const gems = props.gems.slice();

    gems.splice(ix, 1);

    props.setHeldGems(gems);
  }

  return ReactDOM.createPortal(
    <>
      <HoldUIStyle>
        <HoldGemSlotsStyle>
          {props.gems.map((g,i) => 
            <GemSlotStyle key={i} onClick={() => removeGem(i)}>
              <SchmeckelGemCoinUI gem={g} />
            </GemSlotStyle>)
          }
          {[...Array(3-props.gems.length)].map(s => <GemSlotStyle />)}
          <ConfirmButtonStyle><ConfirmSvg /></ConfirmButtonStyle>
          <CancelButtonStyle onClick={() => props.setHeldGems([])}><CancelSvg /></CancelButtonStyle>
        </HoldGemSlotsStyle>       
      </HoldUIStyle>
    </>,
    document.getElementById('root') as HTMLElement
  )
}

interface BoardUIProps {
  gameState: GameState
}

interface BoardUIState {
  heldGems: Gem[]
}

const defaultState = {
  heldGems: []
}

export class BoardUI extends React.Component<BoardUIProps, BoardUIState> {

  constructor(props: BoardUIProps) {
    super(props)

    this.state = defaultState;
  }

  setHeldGems(gems: Gem[]) {
    this.setState({ heldGems: gems })
  }

  render() {
    return (
      <BoardStyle>
        <GemBankUI gems={this.props.gameState.gems} setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} heldGems={this.state.heldGems} />
        <TilesStyle>
          <NobleRowStyle>
            {this.props.gameState.nobles.map((noble, i) => 
              <NobleUI noble={noble} key={i} />
            )}
          </NobleRowStyle>
          <CardRowUI tier={Tier.III} drawPile={this.props.gameState.tierIIIDrawPile} visibleCards={this.props.gameState.tierIIICards.cards}></CardRowUI>
          <CardRowUI tier={Tier.II} drawPile={this.props.gameState.tierIIDrawPile} visibleCards={this.props.gameState.tierIICards.cards}></CardRowUI>
          <CardRowUI tier={Tier.I} drawPile={this.props.gameState.tierIDrawPile} visibleCards={this.props.gameState.tierICards.cards}></CardRowUI>
        </TilesStyle>
        {this.state.heldGems.length > 0 ? <HoldGemUI gems={this.state.heldGems} setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} /> : null}
      </BoardStyle>
    )
  }
}