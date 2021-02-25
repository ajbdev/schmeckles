import styled from 'styled-components';
import { ReactComponent as RubySvg } from './svg/ruby.svg';
import { ReactComponent as EmeraldSvg } from './svg/emerald.svg';
import { ReactComponent as DiamondSvg } from './svg/diamond.svg';
import { ReactComponent as OnyxSvg } from './svg/onyx.svg';
import { ReactComponent as SapphireSvg } from './svg/sapphire.svg';
import { ReactComponent as StarSvg } from './svg/star.svg';

export enum IconSize { xs = '12px', sm = '24px', md = '32px', lg = '48px', xl = '64px' };

interface IconProps {
  size?: IconSize;
}

// With wrapper, target the svg
const Icon = styled.div.attrs((props: IconProps) => ({
  size: props.size || IconSize.md
}))`
  svg {
    width: ${props => props.size};
    height: ${props => props.size}};
  }
  
`;

const RubyIcon = styled(RubySvg)`
  fill: #e60c0c;
`;

const EmeraldIcon = styled(EmeraldSvg)`
  fill: #5ee465;
`;

const DiamondIcon = styled(DiamondSvg)`
  fill: #f0f0f0;
`;

const SapphireIcon = styled(SapphireSvg)`
  fill: #2a55e6;
`;

const OnyxIcon = styled(OnyxSvg)`
  fill: #222;
`

const StarIcon = styled(StarSvg)`
  fill: #ffdb63;
`;

export const Ruby = (props: IconProps) => (
  <Icon {...props}>
    <RubyIcon />
  </Icon>
);

export const Emerald = (props: IconProps) => (
  <Icon {...props}>
    <EmeraldIcon />
  </Icon>
);

export const Diamond = (props: IconProps) => (
  <Icon {...props}>
    <DiamondIcon />
  </Icon>
);

export const Onyx = (props: IconProps) => (
  <Icon {...props}>
    <OnyxIcon />
  </Icon>
);

export const Sapphire = (props: IconProps) => (
  <Icon {...props}>
    <SapphireIcon />
  </Icon>
)

export const Star = (props: IconProps) => (
  <Icon {...props}>
    <StarIcon />
  </Icon>
)