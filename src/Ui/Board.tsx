import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DrawPileUI, CardUI, CardSize } from './Cards';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash } from '../Game';
import { Player } from '../Player';
import { NobleUI } from './Nobles';
import { GemUI, IconSize } from './Gems';
import { Action } from '../Actions';
import { ReactComponent as CancelSvg } from './svg/cancel.svg';
import { ReactComponent as ConfirmSvg } from './svg/confirm.svg';

const game = Game.getInstance();

const CardRowStyle = styled.div`
  display: flex;
  flex-direction: row;
`

const NobleRowStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const InteractiveCardStyle = styled.div`
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid transparent;

  &:hover {
    border-color: #999;
    background: #999;

    & > div {
      display: block;
    }
  }
`

const CardButtonGutter = styled.div`
  position: absolute;
  display: none;
  background: #999;
  z-index: 101;
  border-radius: 4px;
  border: 1px solid #999;
  margin-top: -4px;
  padding: 4px;
  margin-left: -1px;
  margin-right: -1px;

  & button {
    width: 100%;
    padding: 5px;

    &:first-child {
      margin-bottom: 4px;
    }
  }
`

interface InteractiveCardUIProps {
  card: Card
  player: Player
  index: number
  cards: Card[]
  disableReserve?: boolean
  flipped?: boolean
  size?: CardSize
}

const purchaseCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.PurchaseCard, { cards, index: ix });
}

const reserveCard = (player: Player, cards: Card[], ix: number) => {
  game.sendAction(player, Action.ReserveCard, { cards, index: ix });
}

export const InteractiveCardUI = (props: InteractiveCardUIProps) => (
  <InteractiveCardStyle>
    <CardUI {...props} /> 
    <CardButtonGutter>
      <button onClick={() => purchaseCard(props.player, props.cards, props.index)}>Buy</button>
      {!props.card.reserved ? <button onClick={() => reserveCard(props.player, props.cards, props.index)}>Reserve</button> : null}
    </CardButtonGutter>
  </InteractiveCardStyle>
);

interface CardRowUIProps {
  tier: Tier
  drawPile: CardPile
  visibleCards: Card[]
  player: Player
}

export const CardRowUI = (props: CardRowUIProps ) => (
  <CardRowStyle>
    <DrawPileUI tier={props.drawPile.tier} numberOfCards={props.drawPile.cards.length}></DrawPileUI>
    {props.visibleCards.map((card, i) => 
      <InteractiveCardUI card={card} index={i} key={i} player={props.player} cards={props.visibleCards} />  
    )}
  </CardRowStyle>
)
const BoardStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-self: center;
`
const GemBankStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const GemBankHolderStyle = styled.div`
  background: #708090;
  border-radius: 5px;
  border-bottom: 6px solid #434d57;
  padding: 6px;
`

const TilesStyle = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(55,55,55,0.5);
  border-radius: 4px;
`

const SchmeckleSizeMap = {
  [IconSize.xs]: '30px',
  [IconSize.sm]: '32px',
  [IconSize.md]: '46px',
  [IconSize.lg]: '46px',
  [IconSize.xl]: '46px'
}

const SchmeckleStyle = styled.div.attrs((props: { size?: IconSize }) => ({
  size: props.size ? SchmeckleSizeMap[props.size] : SchmeckleSizeMap[IconSize.md]
}))`
  width: ${props => props.size};
  height: ${props => props.size};
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

const SchmeckleGemStash = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 80px;
  background: #666;
  border-radius: 46px;
  padding-left: 2px;
  box-shadow: -1px -1px 1px #4d4d4d;

  &:not(:last-child) {
    margin-bottom: 6px;
  }
  padding-right: 36px;

  &:hover {
    cursor: pointer;
    svg {
      border-color: #ffd900;
      fill: #ffd900;
      stroke: #ffd900;
    }
  }
`

export const SchmeckleGemCoinUI = (props: { gem: Gem, size?: IconSize }) => {
  const map = {
    [Gem.Diamond]: DiamondSchmeckleStyle,
    [Gem.Emerald]: EmeraldSchmeckleStyle,
    [Gem.Onyx]: OnyxSchmeckleStyle,
    [Gem.Sapphire]: SapphireSchmeckleStyle,
    [Gem.Ruby]: RubySchmeckleStyle,
    [Gem.Star]: StarSchmeckleStyle
  }

  const SchmeckleCoinWrapUI = map[props.gem]

  return(
    <SchmeckleCoinWrapUI size={props.size}>
      <GemUI gem={props.gem} size={props.size ? props.size : IconSize.md} />
    </SchmeckleCoinWrapUI>
  )
}

interface SchmeckleStackUIProps {
  gem: Gem
  amount: number
  holdGem: (gem:Gem) => void
}

const SchmeckleStackUI = (props: SchmeckleStackUIProps) => (
  <SchmeckleGemStash onClick={() => props.holdGem(props.gem)} >
    {[...Array(props.amount)].map((a, i) => 
        <SchmeckleGemCoinUI gem={props.gem} key={i} />
    )}
  </SchmeckleGemStash>
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
      <GemBankHolderStyle>
        {props.gems.diamond > 0 ? <SchmeckleStackUI gem={Gem.Diamond} amount={props.gems.diamond-subtracted.diamond} holdGem={holdGem} /> : null}
        {props.gems.ruby > 0 ? <SchmeckleStackUI gem={Gem.Ruby} amount={props.gems.ruby-subtracted.ruby} holdGem={holdGem} />  : null}
        {props.gems.emerald > 0 ? <SchmeckleStackUI gem={Gem.Emerald} amount={props.gems.emerald-subtracted.emerald} holdGem={holdGem} />  : null}
        {props.gems.onyx > 0 ? <SchmeckleStackUI gem={Gem.Onyx} amount={props.gems.onyx-subtracted.onyx} holdGem={holdGem} />  : null}
        {props.gems.sapphire > 0 ? <SchmeckleStackUI gem={Gem.Sapphire} amount={props.gems.sapphire-subtracted.sapphire} holdGem={holdGem} />  : null}
        {props.gems.star > 0 ? <SchmeckleStackUI gem={Gem.Star} amount={props.gems.star-subtracted.star} holdGem={holdGem} />  : null}
      </GemBankHolderStyle>
    </GemBankStyle>
  )
}
const HudGutterAreaStyle = styled.div`
  display: flex;
  justify-content: center;
  height: 130px;
`

const HoldUIStyle = styled.div`
  align-self: center;
`
const HoldGemSlotsStyle = styled.div`
  display: flex;
  border-radius: 40px;
  background: #708090;
  border-bottom: 6px solid #434d57;
  padding: 5px;
`

const GemSlotStyle = styled.div`
  border-radius: 100%;
  background: #666;
  box-shadow: -1px -1px 1px #4d4d4d;
  width: 41px;
  height: 41px;
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
  player: Player
  setHeldGems: (gems:Gem[]) => void
}

const HoldGemUI = (props: HoldGemUIProps) => {
  const removeGem = (ix: number) => {
    const gems = props.gems.slice();

    gems.splice(ix, 1);

    props.setHeldGems(gems);
  }

  const confirmTakeGems = () => {
    const gems = emptyGemStash();

    props.gems.forEach(g => {
      gems[g as Gem]++;
    })

    game.sendAction(props.player, Action.TakeGems, { gems });

    props.setHeldGems([]);
  }

  return (
    <HoldUIStyle>
      <HoldGemSlotsStyle>
        {props.gems.map((g,i) => 
          <GemSlotStyle key={i} onClick={() => removeGem(i)}>
            <SchmeckleGemCoinUI gem={g} />
          </GemSlotStyle>)
        }
        {[...Array(3-props.gems.length)].map((s,i) => <GemSlotStyle key={i} />)}
        <ConfirmButtonStyle><ConfirmSvg onClick={() => confirmTakeGems()} /></ConfirmButtonStyle>
        <CancelButtonStyle onClick={() => props.setHeldGems([])}><CancelSvg /></CancelButtonStyle>
      </HoldGemSlotsStyle>       
    </HoldUIStyle>
  )
}

interface BoardUIProps {
  gameState: GameState
  contextPlayer: Player
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
      <>
        <BoardStyle>
          <GemBankUI gems={this.props.gameState.gems} setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} heldGems={this.state.heldGems} />
          <TilesStyle>
            <NobleRowStyle>
              {this.props.gameState.nobles.map((noble, i) => 
                <NobleUI noble={noble} key={i} />
              )}
            </NobleRowStyle>
            <CardRowUI player={this.props.contextPlayer!} tier={Tier.III} drawPile={this.props.gameState.tierIIIDrawPile} visibleCards={this.props.gameState.tierIIICards.cards}></CardRowUI>
            <CardRowUI player={this.props.contextPlayer!} tier={Tier.II} drawPile={this.props.gameState.tierIIDrawPile} visibleCards={this.props.gameState.tierIICards.cards}></CardRowUI>
            <CardRowUI player={this.props.contextPlayer!} tier={Tier.I} drawPile={this.props.gameState.tierIDrawPile} visibleCards={this.props.gameState.tierICards.cards}></CardRowUI>
          </TilesStyle>
        </BoardStyle>
        <HudGutterAreaStyle>
          {this.state.heldGems.length > 0 ? <HoldGemUI player={this.props.contextPlayer!} gems={this.state.heldGems} setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} /> : null}
        </HudGutterAreaStyle>
        
      </>
    )
  }
}