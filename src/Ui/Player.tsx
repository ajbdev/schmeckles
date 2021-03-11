
import { Card, emptyGemStash, Gem, GemStash, PlayerTurn } from '../Game';
import { Player } from '../Player';
import styled, { keyframes } from 'styled-components';
import React from 'react';
import { GemUI, IconSize } from './Gems';

const PlayerGemsStyle = styled.div`
  display: flex;
  flex-direction: row;
`
const NumberChangeAnimation = keyframes`  
  from { opacity: 1; margin-top: 16px;  }
  to { opacity: 0; margin-top: 0px; }
`; 


const PlayerGemValueStyle = styled.div`
  margin-right: 10px;
  display: flex;
  vertical-align: middle;
`

const PlayerNumberStyle = styled.div`
  margin-right: 5px;
`

const NumberChangeStyle = styled.div`
  color: #fae100;
  position: absolute;
  animation-name: ${NumberChangeAnimation};
  animation-duration: 1.2s;
  animation-timing-function: 'ease';
  margin-top: 16px;
  margin-left: -12px;
`

export const PlayerGemsUI = (props: { gems: GemStash, diff?: GemStash }) => (
  <PlayerGemsStyle>
    {Object.keys(props.gems).map(
      g => (
        <PlayerGemValueStyle>
          <PlayerNumberStyle>
            {props.gems[g as Gem]}
          </PlayerNumberStyle>
          {props.diff && props.diff[g as Gem] !== 0
            ? <NumberChangeStyle>
                {props.diff[g as Gem] > 0 ? '+' : ''}{props.diff[g as Gem]}
              </NumberChangeStyle>
            : null
          }
          <GemUI gem={g as Gem} size={IconSize.sm} />
        </PlayerGemValueStyle>
      )
    )}
  </PlayerGemsStyle>
);

const PlayerNameStyle = styled.span`
`;

const TurnMarkerStyle = styled.span`
  font-size: 40px;
  font-weight: bold;
  position: absolute;
  margin-left: -24px;
  color: #fff;
`

const PlayerGemSpaceStyle = styled.div`
  padding-top: 10px;
`

const PlayerListItemStyle = styled.span.attrs((props: { isContextPlayer: boolean }) => ({
  isContextPlayer: props.isContextPlayer || false
}))`
  color: ${props => props.isContextPlayer ? '#fff' : '#222'}; 
  font-size: 20px;
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
}

const defaultState = {
  gems: emptyGemStash(),
  diff: undefined
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
        {this.props.isPlayersTurn ? <TurnMarkerStyle>▸</TurnMarkerStyle> : null}
        <PlayerListItemStyle 
          key={this.props.player.id}
          isContextPlayer={this.props.isContextPlayer}
        >
          <PlayerNameStyle>{this.props.player.name}</PlayerNameStyle>
          <PlayerGemSpaceStyle>
            <PlayerGemsUI gems={this.state.gems} diff={this.state.diff} />
          </PlayerGemSpaceStyle>
        </PlayerListItemStyle>  
      </>
    )
  }
}
 