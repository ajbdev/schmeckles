import React from 'react';
import styled from 'styled-components';
import { Noble } from '../Game';
import { VictoryPoints } from './Cards';
import { GemCostsUI } from './Gems';
import { ReactComponent as NobleSvg } from './svg/crown.svg';

export enum NobleSize { xs = '50px', sm = '68px', md = '90px', lg = '120px', xl = '160px' }

const NobleSvgSizeMap = {
  [NobleSize.xs]: '15px',
  [NobleSize.sm]: '20px',
  [NobleSize.md]: '25px',
  [NobleSize.lg]: '32px',
  [NobleSize.xl]: '38px'
}

const Svg = styled.div.attrs((props: { size?: NobleSize }) => ({
  size: props.size ? NobleSvgSizeMap[props.size] : NobleSvgSizeMap[NobleSize.md]
}))`
  position: absolute;
  top: 2px;
  right: 2px;

  & svg {
    fill: #ccc;
    width: ${props => props.size};
    height: ${props => props.size};
  }
`

const NobleTile = styled.div<{ size?: NobleSize }>`
  width: ${props => props.size ? props.size : NobleSize.md };
  height: ${props => props.size ? props.size : NobleSize.md };
  border: 1px solid #000;
  border-radius: 4px;
  margin: 5px;
  background: #fff;
  position: relative;
`

export default (props: {size?: NobleSize, noble: Noble}) => (
  <NobleTile size={props.size}>
    <VictoryPoints>{props.noble.points}</VictoryPoints>
    <Svg size={props.size}>
      <NobleSvg />
    </Svg>
    {props.noble.costs && props.size !== NobleSize.xs
      ? (
        <GemCostsUI gems={props.noble.costs} />
      )
      : null
    }
  </NobleTile>
);

