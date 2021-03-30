
import Game, { Card, emptyGemStash, Gem, GemStash, PlayerTurn, GameState } from '../Game';
import { Player, victoryPoints } from '../Player';
import styled, { keyframes } from 'styled-components';
import React, { useState } from 'react';
import { GemUI, IconSize } from './Gems';
import { CardSize, CardUI } from './Cards';
import { SchmeckleGemCoinUI } from './Schmeckles';
import InteractiveCardUI from './InteractiveCard'
import { NobleUI, NobleSize } from './Nobles';
import { AvatarSize, AvatarUI } from './Avatars';
import { Action, IAction, PurchaseCard, ReserveCard, TakeGems } from '../Actions';
import { AnimationRefs } from './Game';

const GemsStyle = styled.div`
  display: flex;
  flex-direction: row;
`
const NumberChangeAnimation = keyframes`  
  from { opacity: 1; margin-top: 16px;  }
  to { opacity: 0; margin-top: 0px; }
`; 

const GemValueStyle = styled.div`
  margin-right: 10px;
  display: flex;
  vertical-align: middle;
`

const NumberStyle = styled.div`
  margin-right: 5px;
`

const NumberChangeStyle = styled.div`
  color: #fa9600;
  position: absolute;
  animation-name: ${NumberChangeAnimation};
  animation-duration: 1.2s;
  animation-timing-function: 'ease';
  margin-top: 16px;
  margin-left: -12px;
`

export const PlayerGemsTallyUI = (props: { gems: GemStash, diff?: GemStash }) => (
  <GemsStyle>
    {Object.keys(props.gems).map(
      g => (
        <GemValueStyle key={`gem_${g}`}>
          <NumberStyle>
            {props.gems[g as Gem]}
          </NumberStyle>
          {props.diff && props.diff[g as Gem] !== 0
            ? <NumberChangeStyle>
                {props.diff[g as Gem] > 0 ? '+' : ''}{props.diff[g as Gem]}
              </NumberChangeStyle>
            : null
          }
          <GemUI gem={g as Gem} size={IconSize.sm} />
        </GemValueStyle>
      )
    )}
  </GemsStyle>
);

const NameStyle = styled.span.attrs((props: { border: string }) => ({
  border: props.border || '0'
}))`
  border-bottom: ${props => props.border};
  user-select: none;
  margin-left: 8px;
`;

const TurnMarkerStyle = styled.span`
  font-size: 40px;
  font-weight: bold;
  position: absolute;
  margin-left: -34px;
  color: var(--gold);
`

const VictoryPointsStyle = styled.div`
  margin-right: -30px;
  font-size: 26px;
  font-weight: bold;
  display: inline-block;
  margin-left: 10px;
  border-radius: 100%;
  width: 32px;
  height: 32px;
  color: #fff;
  background: var(--gold);
  border: 4px solid #a3803f;
  text-align: center;
  user-select: none;
`

const CardStackStyle = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  flex-wrap: wrap;
  width: 315px;
  
  & label {
    position: absolute;
    transform: rotate(-90deg);
    left: -39px;
    top: 40px;
    text-transform: uppercase;
    font-size: 10px;
  }
`

const CardSlotStyle = styled.div`
  width: 25px;
  &:hover {
    z-index: 101;
  }
`

const ReservedCardSlotStyle = styled.div`
`

const GemTallyStyle = styled.div`
  padding-top: 10px;
  width: 315px;
`

const CoinStackStyle = styled.div`
  display: flex;
  flex-direction: row;
  height: 30px;
  padding: 5px;
  position: relative;
  margin-bottom: 10px;
  & div {
    width: 15px;
  }

  & label {
    position: absolute;
    transform: rotate(-90deg);
    left: -24px;
    top: 14px;
    text-transform: uppercase;
    font-size: 10px;
  }
`

const CpuTagStyle = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  background: transparent;
  color: #fff;
  vertical-align: middle;
  margin-left: 10px;
  padding: 2px 4px;
  border: 2px solid #fff;
  border-radius: 4px;
  user-select: none;
`

const NobleStackStyle = styled.div`
  display: flex;
  flex-direction: row;
`

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ListItemStyle = styled.span.attrs((props: { isContextPlayer: boolean }) => ({
  isContextPlayer: props.isContextPlayer || false
}))`
  color: ${props => props.isContextPlayer ? '#fff' : '#222'}; 
  font-size: 20px;
  height: 260px;
  font-weight: bold;
  padding-left: 10px;
  position: relative;
`

const ReserveGutterStyle = styled.div`
  border-radius: 5px;
  height: 84px;
  position: relative;
  display: flex;
  & label {
    position: absolute;
    transform: rotate(-90deg);
    left: -34px;
    top: 40px;
    text-transform: uppercase;
    font-size: 10px;
  }
`

const PassButtonStyle = styled.button`
  margin-left: 50px;
`

interface PlayerUIProps { 
  player: Player
  animationRefs: AnimationRefs;
  isPlayersTurn: boolean
  isContextPlayer: boolean 
  lastAction?: IAction
}

interface PlayerUIState {
  flipCard: boolean;
}

const defaultState = {
  flipCard: true
}


const passTurn = (player: Player) => {
  if (window.confirm('Are you sure you want to pass your turn?')) {
    const game = Game.getInstance();

    const p = game.gameState.getPlayer(player.id);

    game.sendAction(p!, Action.PassTurn, {});
  }
}

export class PlayerUI extends React.Component<PlayerUIProps, PlayerUIState> {
  gemsRef: any;
  nextPurchasedCardRef: any;
  nextReservedCardRef: any;

  constructor(props: PlayerUIProps) {
    super(props);

    this.state = defaultState;

    this.gemsRef = React.createRef();
    this.nextPurchasedCardRef = React.createRef();
    this.nextReservedCardRef = React.createRef();
  }

  addGemTotal() {
    const gems = { ...this.props.player.gems };

    Object.keys(gems).forEach(g => { 
      gems[g as Gem] += this.props.player.cards.cards.filter(c => c.gem === (g as Gem)).length;
    });

    return gems;
  }

  getCardAnimation(c:Card) {

  }

  render() {

    return (
      <>
        <ListItemStyle 
          key={this.props.player.id}
          isContextPlayer={this.props.isContextPlayer}
        >
          {this.props.isPlayersTurn ? <TurnMarkerStyle>▸</TurnMarkerStyle> : null}

          <TopRow>
            <AvatarUI 
              src={this.props.player.avatar} 
              size={AvatarSize.sm} 
              border={this.props.isPlayersTurn ? '3px solid var(--gold)' : '3px solid #aaa'}
            />
            <NameStyle border={this.props.isPlayersTurn ? '3px solid var(--gold)' : ''}>{this.props.player.name}</NameStyle>
            {this.props.player.computer ? <CpuTagStyle>CPU</CpuTagStyle> : null}

            <NobleStackStyle>
              {this.props.player.nobles.map(n => 
                <NobleUI noble={n} size={NobleSize.xs} />                
              )}
            </NobleStackStyle>

            <VictoryPointsStyle>
              {victoryPoints(this.props.player)}
            </VictoryPointsStyle>

            {this.props.isPlayersTurn && this.props.isContextPlayer
              ? (
                <PassButtonStyle onClick={() => passTurn(this.props.player)}>Pass</PassButtonStyle>
              )
              : null
            }
          </TopRow>
          <GemTallyStyle>
            <PlayerGemsTallyUI gems={this.addGemTotal()} />
          </GemTallyStyle>

          <CoinStackStyle>
            {this.props.player.reservedCards.length > 0 && this.props.isContextPlayer ? <label>Gems</label> : null}
            <>
              {this.props.player.gemOrder.map((gem, ix) => 
                <SchmeckleGemCoinUI 
                  size={IconSize.xs} 
                  gem={gem} 
                  lastAction={
                    this.props.lastAction instanceof TakeGems 
                      && this.props.lastAction.player.id === this.props.player.id 
                      && ix >= this.props.player.gemOrder.length - Object.values(this.props.lastAction.gems).reduce((a,b) => a+b)
                    ? this.props.lastAction 
                    : undefined
                  }
                  animationRefs={this.props.animationRefs}
                  key={`${this.props.player.id}_gem_${gem}_${ix}`} 
                />
              
              )}
            </>
            <div ref={this.gemsRef} />
          </CoinStackStyle>

          <CardStackStyle>
            {this.props.player.cards.cards.length > 0 && this.props.isContextPlayer ? <label>Purchased</label> : null}
            <>
            {this.props.player.cards.cards.sort((c1, c2) => c1.points > c2.points ? -1 : 1).map((c,ix) =>
              <CardSlotStyle key={`${this.props.player.id}_card_${c.gem}_${ix}`}>
                <InteractiveCardUI 
                    card={c} 
                    index={ix}
                    cards={this.props.player.cards.cards}
                    lastAction={this.props.lastAction instanceof ReserveCard || this.props.lastAction instanceof PurchaseCard ? this.props.lastAction : undefined}
                    animationRefs={this.props.animationRefs}
                    isPlayersTurn={this.props.isPlayersTurn}
                    isAlreadyPurchased={true}
                    player={this.props.player}
                    size={CardSize.xs} 
                />
              </CardSlotStyle>
            )}
            </>            
            <div ref={this.nextPurchasedCardRef} />
          </CardStackStyle>

          <ReserveGutterStyle>
            {this.props.player.reservedCards.length > 0 && this.props.isContextPlayer ? <label>Reserved</label> : null}
            <>
              {this.props.player.reservedCards.map((c,ix) => 
                <ReservedCardSlotStyle 
                  key={`${this.props.player.id}_reserved_${c.gem}_${ix}`} 
                  onMouseEnter={() => this.setState({ flipCard: false })} 
                  onMouseLeave={() => this.setState({ flipCard: true })}
                >
                  <InteractiveCardUI 
                    card={c} 
                    index={ix}
                    cards={this.props.player.reservedCards}
                    lastAction={this.props.lastAction instanceof ReserveCard || this.props.lastAction instanceof PurchaseCard ? this.props.lastAction : undefined}
                    animationRefs={this.props.animationRefs}
                    isPlayersTurn={this.props.isPlayersTurn}
                    player={this.props.player}
                    size={CardSize.xs} 
                    flipped={this.state.flipCard} 
                  />
                </ReservedCardSlotStyle>
              )}
            </>
            <div ref={this.nextReservedCardRef} />
          </ReserveGutterStyle>
        </ListItemStyle>  
      </>
    )
  }
}
 