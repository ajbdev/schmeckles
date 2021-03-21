import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DrawPileUI, CardUI, CardSize, CardRowUI } from './Cards';
import Game, { Tier, CardPile, Card, GameState, Gem, GemStash, emptyGemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import { NobleUI } from './Nobles';
import { GemUI, IconSize } from './Gems';
import { Action } from '../Actions';
import { ReactComponent as CancelSvg } from './svg/cancel.svg';
import { ReactComponent as ConfirmSvg } from './svg/confirm.svg';
import { canAffordCard, canReserveCard, isPlayersTurn } from '../Rules';
import { Frame } from 'framer';
import { motion, useAnimation } from 'framer-motion';
import GemBankUI from './GemBank';
import { SchmeckleGemCoinUI } from './Schmeckles';

const game = Game.getInstance();


const NobleRowStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const BoardStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-self: center;
`

const TilesStyle = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(55,55,55,0.5);
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
  animationRefs: { [key:string]: any }
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
  animationRefs: { [key:string]: any }
  setAnimationRefs: (key:string, subKey:string, el:HTMLElement) => void
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
    const isTurn = isPlayersTurn(this.props.contextPlayer!, this.props.gameState.players, this.props.gameState.turn).passed;

    return (
      <>
        <BoardStyle>
          <GemBankUI 
            isPlayersTurn={isTurn} 
            gems={this.props.gameState.gems}
            setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} 
            setAnimationRefs={this.props.setAnimationRefs}
            heldGems={this.state.heldGems} 
          />
          <TilesStyle>
            <NobleRowStyle>
              {this.props.gameState.nobles.map((noble, i) => 
                <NobleUI noble={noble} key={i} />
              )}
            </NobleRowStyle>
            <CardRowUI player={this.props.contextPlayer!} isPlayersTurn={isTurn} tier={Tier.III} drawPile={this.props.gameState.tierIIIDrawPile} visibleCards={this.props.gameState.tierIIICards.cards} animationRefs={this.props.animationRefs}></CardRowUI>
            <CardRowUI player={this.props.contextPlayer!} isPlayersTurn={isTurn} tier={Tier.II} drawPile={this.props.gameState.tierIIDrawPile} visibleCards={this.props.gameState.tierIICards.cards} animationRefs={this.props.animationRefs}></CardRowUI>
            <CardRowUI player={this.props.contextPlayer!} isPlayersTurn={isTurn} tier={Tier.I} drawPile={this.props.gameState.tierIDrawPile} visibleCards={this.props.gameState.tierICards.cards} animationRefs={this.props.animationRefs}></CardRowUI>
          </TilesStyle>
        </BoardStyle>
        <HudGutterAreaStyle>
          {this.state.heldGems.length > 0 
            ? <HoldGemUI 
                player={this.props.contextPlayer!} 
                animationRefs={this.props.animationRefs} 
                gems={this.state.heldGems} 
                setHeldGems={(gems: Gem[]) => this.setHeldGems(gems)} 
              /> 
            : null}
        </HudGutterAreaStyle>
      </>
    )
  }
}