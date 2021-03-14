
import { Card, emptyGemStash, Gem, GemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import styled, { keyframes } from 'styled-components';
import React, { useState } from 'react';
import { GemUI, IconSize } from './Gems';
import { CardSize, CardUI } from './Cards';

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

export const PlayerGemsUI = (props: { gems: GemStash, diff?: GemStash }) => (
  <GemsStyle>
    {Object.keys(props.gems).map(
      g => (
        <GemValueStyle>
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

const NameStyle = styled.span`
  user-select: none;
`;

const TurnMarkerStyle = styled.span`
  font-size: 40px;
  font-weight: bold;
  position: absolute;
  margin-left: -34px;
  color: #fff;
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
  flex-direction: row;
  flex-wrap: wrap;
  width: 315px;
`

const CardSlotStyle = styled.div`
  width: 25px;
  &:hover {
    z-index: 101;
  }
`

const ReservedCardSlotStyle = styled.div`
  width: 51px;
`

const GemSpaceStyle = styled.div`
  padding-top: 10px;
  width: 315px;
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

interface PlayerUIProps { 
  player: Player
  isPlayersTurn: boolean
  isContextPlayer: boolean 
}

interface PlayerUIState {
  gems: GemStash
  diff?: GemStash
  flipCard: boolean;
}

const defaultState = {
  gems: emptyGemStash(),
  diff: undefined,
  flipCard: true
}

export class PlayerUI extends React.Component<PlayerUIProps, PlayerUIState> {
  constructor(props: PlayerUIProps) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    this.setState({ gems: { ...this.props.player.gems } });
  }

  addGemTotal() {
    const gems = { ...this.props.player.gems };

    Object.keys(gems).forEach(g => { 
      gems[g as Gem] += this.props.player.cards.cards.filter(c => c.gem === (g as Gem)).length;
    });

    return gems;
  }

  componentDidUpdate(prevProps: PlayerUIProps) {
    const gems = this.addGemTotal();

    const diff = emptyGemStash();

    const hasDiff = Object.keys(gems).map(g => { 
      const v = (gems[g as Gem] - this.state.gems[g as Gem]);
      diff[g as Gem] = v;
      return v;
    }).reduce((a:number, b:number) => a + b) > 0;

    if (hasDiff) {
      this.setState({
        diff: diff,
        gems: gems
      });
      setTimeout(() => this.setState({ diff: emptyGemStash() }), 1000);
    }
  }

  render() {

    return (
      <>
        <ListItemStyle 
          key={this.props.player.id}
          isContextPlayer={this.props.isContextPlayer}
        >
        {this.props.isPlayersTurn ? <TurnMarkerStyle>▸</TurnMarkerStyle> : null}

          <NameStyle>{this.props.player.name}</NameStyle>

          <VictoryPointsStyle>
            {this.props.player.victoryPoints()}
          </VictoryPointsStyle>
          <GemSpaceStyle>
            <PlayerGemsUI gems={this.state.gems} diff={this.state.diff} />
          </GemSpaceStyle>

          <CardStackStyle>
            {this.props.player.cards.cards.sort((c1, c2) => c1.points > c2.points ? -1 : 1).map(c =>
              <CardSlotStyle>
                <CardUI card={c} size={CardSize.xs} hideCosts={true} />
              </CardSlotStyle>
            )}
            {this.props.player.reservedCards.map(c => 
              <ReservedCardSlotStyle onMouseEnter={() => this.setState({ flipCard: false })} onMouseLeave={() => this.setState({ flipCard: true })}>
                <CardUI card={c} size={CardSize.xs} flipped={this.state.flipCard} />
              </ReservedCardSlotStyle>
            )}
          </CardStackStyle>
        </ListItemStyle>  
      </>
    )
  }
}
 