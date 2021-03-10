import styled from 'styled-components';
import { ReactComponent as RubySvg } from './svg/ruby.svg';
import { ReactComponent as EmeraldSvg } from './svg/emerald.svg';
import { ReactComponent as DiamondSvg } from './svg/diamond.svg';
import { ReactComponent as OnyxSvg } from './svg/onyx.svg';
import { ReactComponent as SapphireSvg } from './svg/sapphire.svg';
import { ReactComponent as StarSvg } from './svg/star.svg';
import { GemStash, Gem, Player } from '../Game';


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
  stroke-width: 10;
  stroke: #666;
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

interface GemTypeProps {
  gem: Gem
}

type GemUIProps = GemTypeProps & IconProps;

export const GemUI = (props: GemUIProps) => {
  const map = {
    [Gem.Diamond]: Diamond,
    [Gem.Emerald]: Emerald,
    [Gem.Onyx]: Onyx,
    [Gem.Ruby]: Ruby,
    [Gem.Sapphire]: Sapphire,
    [Gem.Star]: Star
  }

  const GemIconType = map[props.gem];

  return <GemIconType {...props} />
}

export enum GemCostSize { xs = '11px', sm = '15px', md = '18px', lg = '25px', xl = '32px' }

interface GemCostStyleProps {
  size?: GemCostSize
}

const GemCostStyle = styled.div.attrs((props: GemCostStyleProps) => ({
  size: props.size || GemCostSize.md
}))`
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius: 100%;
  text-align: center;
  font-family: Courgette;
  position: relative;
  border: 1px solid #000;
  margin: 2px;
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
  font-size: 22px;
  font-weight: bold;
  line-height: 22px;
  color: #fff;
  -webkit-text-fill-color: white;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #555;
`

const OnyxPointValueStyle = styled(PointValueStyle)`
-webkit-text-stroke-color: #bbb;
`

const CostGemIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 2px;
  svg {
    width: 16px;
    height: 16px;
  }
`

const CostDiamondIcon = styled(CostGemIcon)`
  svg {
    stroke-width: 5;
    stroke: #222;
  }
`

export const RubyCostUI = (props: CostProps) => (
  <RubyCostStyle>
    <PointValueStyle>
      {props.cost}
    </PointValueStyle>
    <CostGemIcon>
      <RubyIcon />
    </CostGemIcon>
  </RubyCostStyle>
)

export const EmeraldCostUI = (props: CostProps) => (
  <EmeraldCostStyle>
    <PointValueStyle>
      {props.cost}
    </PointValueStyle>
    <CostGemIcon>
      <EmeraldIcon />
    </CostGemIcon>
  </EmeraldCostStyle>
)

export const SapphireCostUI = (props: CostProps) => (
  <SapphireCostStyle>
    <PointValueStyle>
      {props.cost}
    </PointValueStyle>
    <CostGemIcon>
      <SapphireIcon />
    </CostGemIcon>
  </SapphireCostStyle>
)


export const OnyxCostUI = (props: CostProps) => (
  <OnyxCostStyle>
    <OnyxPointValueStyle>
      {props.cost}
    </OnyxPointValueStyle>
    <CostGemIcon>
      <OnyxIcon />
    </CostGemIcon>
  </OnyxCostStyle>
)

export const DiamondCostUI = (props: CostProps) => (
  <DiamondCostStyle>
    <PointValueStyle>
      {props.cost}
    </PointValueStyle>
    <CostDiamondIcon>
      <DiamondIcon />
    </CostDiamondIcon>
  </DiamondCostStyle>
)

const GemGroupedCostStyle = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
`


export interface GemCostsUIProps {
  gems: GemStash
}

export const GemCostsUI = (props: GemCostsUIProps) => (
  <GemGroupedCostStyle>
    {props.gems.diamond > 0 ? <DiamondCostUI cost={props.gems.diamond} /> : null}
    {props.gems.ruby > 0 ? <RubyCostUI cost={props.gems.ruby} /> : null}
    {props.gems.emerald > 0 ? <EmeraldCostUI cost={props.gems.emerald} /> : null}
    {props.gems.onyx > 0 ? <OnyxCostUI cost={props.gems.onyx} /> : null}
    {props.gems.sapphire > 0 ? <SapphireCostUI cost={props.gems.sapphire} /> : null}
  </GemGroupedCostStyle>
)