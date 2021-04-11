import React from 'react';
import styled from 'styled-components';
import { Noble } from '../Game';
import { VictoryPointsStyle } from './Cards';
import { GemCostsUI } from './Gems';
import { ReactComponent as NobleSvg } from './svg/crown.svg';

export enum NobleSize { xs = '50px', sm = '68px', md = '90px', lg = '120px', xl = '160px' }

interface NobleSizeProps {
  size?: NobleSize;
}

const NobleSvgSizeMap = {
  [NobleSize.xs]: '15px',
  [NobleSize.sm]: '20px',
  [NobleSize.md]: '25px',
  [NobleSize.lg]: '25px',
  [NobleSize.xl]: '25px'
}

const SvgStyle = styled.div.attrs((props: NobleSizeProps) => ({
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

// With wrapper, target the svg
const NobleStyle = styled.div.attrs((props: NobleSizeProps) => ({
  size: props.size || NobleSize.md
}))`
  width: ${props => props.size};
  height: ${props => props.size}};
  border: 1px solid #000;
  border-radius: 4px;
  margin: 5px;
  background: #fff;
  position: relative;
`


export interface NobleUIProps {
  size?: NobleSize,
  noble: Noble
}

export const NobleUI = (props: NobleUIProps) => (
  <NobleStyle size={props.size}>
    <VictoryPointsStyle>{props.noble.points}</VictoryPointsStyle>
    <SvgStyle size={props.size}>
      <NobleSvg />
    </SvgStyle>
    {props.noble.costs && props.size !== NobleSize.xs
      ? (
        <GemCostsUI gems={props.noble.costs} />
      )
      : null
    }
  </NobleStyle>
);