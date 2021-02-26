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
    height: ${props => props.size};
  }
`;

const RubyIcon = styled(RubySvg)`
  fill: var(--ruby);
`;

const EmeraldIcon = styled(EmeraldSvg)`
fill: var(--emerald);
`;

const DiamondIcon = styled(DiamondSvg)`
  fill: var(--diamond);
`;

const SapphireIcon = styled(SapphireSvg)`
  fill: var(--sapphire);
`;

const OnyxIcon = styled(OnyxSvg)`
  fill: var(--onyx);
`

const StarIcon = styled(StarSvg)`
  fill: var(--star);
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
);

export const Star = (props: IconProps) => (
  <Icon {...props}>
    <StarIcon />
  </Icon>
);

export enum GemCostSize { xs = '14px', sm = '18px', md = '24px', lg = '30px', xl = '38px' }

interface GemCostStyleProps {
  size?: GemCostSize
}

const GemCostStyle = styled.div.attrs((props: GemCostStyleProps) => ({
  size: props.size || GemCostSize.md
}))`
  width: ${props => props.size};
  height: ${props => props.size};
  border: 1px solid #000;
  border-radius: 100%;
  text-align: center;
  font-family: Courgette;
`

const RubyCostStyle = styled(GemCostStyle)`
  background: var(--ruby);
`

const EmeraldCostStyle = styled(GemCostStyle)`
  background: var(--emerald);
`

const DiamondCostStyle = styled(GemCostStyle)`
  background: var(--diamond);
`

const SapphireCostStyle = styled(GemCostStyle)`
  background: var(--sapphire);
`

const OnyxCostStyle = styled(GemCostStyle)`
  background: var(--onyx);
`

interface CostProps {
  cost: number;
}

const PointValueStyle = styled.span`
  font-size: 26px;
  color: #fff;
  -webkit-text-fill-color: white;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #555;
`

export const RubyCostUI = (props: CostProps) => (
  <RubyCostStyle>
    <PointValueStyle>
      {props.cost}
    </PointValueStyle>
  </RubyCostStyle>
)