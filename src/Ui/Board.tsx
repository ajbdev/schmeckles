import React, { ReactNode, RefObject, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DrawPileUI, CardUI, CardSize } from './Cards';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { NobleUI } from './Nobles';
import { GemUI, IconSize } from './Gems';
import { Action } from '../Actions';
import { ReactComponent as CancelSvg } from './svg/cancel.svg';
import { ReactComponent as ConfirmSvg } from './svg/confirm.svg';
import { canAffordCard, canReserveCard, isPlayersTurn } from '../Rules';
import GemBankUI from './GemBank';
import { SchmeckleGemCoinUI } from './Schmeckles';
import InteractiveCardUI from './InteractiveCard';

const game = Game.getInstance();


const NobleRowStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const BoardStyle = styled.div.attrs((props: { isPlayersTurn?: boolean }) => ({
  isPlayersTurn: !!props.isPlayersTurn
}))`
  display: flex;
  flex-direction: row;
  align-self: center;
  border: 4px solid var(--dark-gold);
  background: rgba(55,55,55,0.5);
  border-radius: 4px;
  position: relative;
  
  ${props => props.isPlayersTurn && `
    border: 4px solid var(--gold);
  `}
`

const TilesStyle = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
`

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

    const p = game.gameState.getPlayer(props.player.id);

    game.sendAction(p!, Action.TakeGems, { gems });

    props.setHeldGems([]);
  }

  return (
    <HoldUIStyle>
      <HoldGemSlotsStyle>
        <>
          {props.gems.map((g,i) => 
          <GemSlotStyle key={i} onClick={() => removeGem(i)}>
            <SchmeckleGemCoinUI gem={g} />
          </GemSlotStyle>)
        }
        </>
        <>
          {[...Array(3-props.gems.length)].map((s,i) => <GemSlotStyle key={i} />)}
        </>
        <ConfirmButtonStyle><ConfirmSvg onClick={() => confirmTakeGems()} /></ConfirmButtonStyle>
        <CancelButtonStyle onClick={() => props.setHeldGems([])}><CancelSvg /></CancelButtonStyle>
      </HoldGemSlotsStyle>       
    </HoldUIStyle>
  )
}


const CardRowStyle = styled.div`
  display: flex;
  flex-direction: row;
`

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

const StatusStyle = styled.div.attrs((props: { isPlayersTurn?: boolean }) => ({
  isPlayersTurn: !!props.isPlayersTurn
}))`
  position: absolute;
  text-align: center;
  left: -4px;
  right: -4px;
  bottom: -28px;
  background: var(--dark-gold);
  border: 4px solid var(--dark-gold);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  
  ${props => props.isPlayersTurn && `
    border: 4px solid var(--gold);
    background: var(--gold);
  `}
`

const statusText = (props: { isPlayersTurn?: boolean, contextPlayer?: Player }) => {
  if (props.isPlayersTurn) {
    return `Hey ${props.contextPlayer?.name}, it's your turn!`;
  }

  if (props.contextPlayer) {
    return `Playing as ${props.contextPlayer.name}`;
  }
}

const StatusUI = (props: { isPlayersTurn?: boolean, contextPlayer?: Player }) => (
  <StatusStyle isPlayersTurn={props.isPlayersTurn}>
    {statusText(props)}
  </StatusStyle>
)


export class BoardUI extends React.Component<BoardUIProps, BoardUIState> {
  tierICardRefs: RefObject<HTMLDivElement>[] = []
  tierIICardRefs: RefObject<HTMLDivElement>[] = []
  tierIIICardRefs: RefObject<HTMLDivElement>[] = []
  gemBankRef: RefObject<GemBankUI>

  constructor(props: BoardUIProps) {
    super(props)

    this.state = defaultState;

    for (let i = 0; i <= 3; i++) {
      this.tierICardRefs.push(React.createRef());
      this.tierIICardRefs.push(React.createRef());
      this.tierIIICardRefs.push(React.createRef());
    }

    this.gemBankRef = React.createRef()
  
  }

  setHeldGems(gems: Gem[]) {
    this.setState({ heldGems: gems })
  }

  render() {
    const isTurn = isPlayersTurn(this.props.contextPlayer!, this.props.gameState.players, this.props.gameState.turn).passed;


    const cardRows = [
      {
        tier: Tier.III,
        draw: this.props.gameState.tierIIIDrawPile.cards,
        visible: this.props.gameState.tierIIICards.cards,
        refs: this.tierIIICardRefs
      },
      {
        tier: Tier.II,
        draw: this.props.gameState.tierIIDrawPile.cards,
        visible: this.props.gameState.tierIICards.cards,
        refs: this.tierIICardRefs
      },
      {
        tier: Tier.I,
        draw: this.props.gameState.tierIDrawPile.cards,
        visible: this.props.gameState.tierICards.cards,
        refs: this.tierICardRefs
      }
    ]

    return (
      <>
        
        <BoardStyle isPlayersTurn={isTurn}>
          <GemBankUI 
            isPlayersTurn={isTurn}
            ref={this.gemBankRef}
            gems={this.props.gameState.gems} 
            setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} 
            heldGems={this.state.heldGems} 
          />
          <TilesStyle>
            <NobleRowStyle>
              {this.props.gameState.nobles.map((noble, i) => 
                <NobleUI noble={noble} key={i} />
              )}
            </NobleRowStyle>
            <>
              {cardRows.map(row =>
                <CardRowStyle key={row.tier}>
                  <DrawPileUI tier={row.tier} numberOfCards={row.draw.length} />
                  <>
                    {row.visible.map((card:Card, ix:number) => 
                      <InteractiveCardUI 
                        cards={row.visible} 
                        card={card} 
                        isPlayersTurn={isTurn}
                        player={this.props.contextPlayer}
                        ref={row.refs[ix]}
                        index={ix} 
                        key={ix}
                        {...this.props} 
                      />  
                    )}
                  </>
                </CardRowStyle>
              )}
            </>
          </TilesStyle>
        <div><StatusUI isPlayersTurn={isTurn} contextPlayer={this.props.contextPlayer} /></div>
        </BoardStyle>
        <HudGutterAreaStyle>
          {this.state.heldGems.length > 0 ? <HoldGemUI player={this.props.contextPlayer!} gems={this.state.heldGems} setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} /> : null}
        </HudGutterAreaStyle>
      </>
    )
  }
}