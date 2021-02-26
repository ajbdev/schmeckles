import React from 'react';
import styled from 'styled-components';
import { Noble } from '../Game';
import { VictoryPointsStyle } from './Cards';

export enum NobleSize { xs = '50px', sm = '68px', md = '90px', lg = '120px', xl = '160px' }

interface NobleSizeProps {
  size?: NobleSize;
}

// With wrapper, target the svg
const NobleStyle = styled.div.attrs((props: NobleSizeProps) => ({
  size: props.size || NobleSize.md
}))`
  width: ${props => props.size};
  height: ${props => props.size}};
  border: 1px solid #000;
  border-radius: 4px;
`;

export interface NobleUIProps {
  size?: NobleSize,
  noble: Noble
}

export const NobleUI = (props: NobleUIProps) => (
  <NobleStyle>
    <VictoryPointsStyle>{props.noble.points}</VictoryPointsStyle>
  </NobleStyle>
);