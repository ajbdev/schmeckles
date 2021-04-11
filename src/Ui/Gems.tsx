import styled from 'styled-components';
import { Gem, GemStash } from '../Game';
import { ReactComponent as DiamondSvg } from './svg/diamond.svg';
import { ReactComponent as EmeraldSvg } from './svg/emerald.svg';
import { ReactComponent as OnyxSvg } from './svg/onyx.svg';
import { ReactComponent as RubySvg } from './svg/ruby.svg';
import { ReactComponent as SapphireSvg } from './svg/sapphire.svg';
import { ReactComponent as StarSvg } from './svg/star.svg';

export enum GemCostSize { xs, sm, md, lg, xl }

export enum IconSize { xs = '1vw', sm = '1.5vw', md = '2vw', lg = '2.5vw', xl = '3vw' };

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

enum GemAwardSize {
  xs = '10px',
  sm = '14px',
  md = '18px',
  lg = '24px',
  xl = '32px'
}

interface GemTypeProps {
  gem: Gem
  size: IconSize
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

const GemCostNumberSize = {
  [GemCostSize.xs]: '11px',
  [GemCostSize.sm]: '15px;',
  [GemCostSize.md]: '16px',
  [GemCostSize.lg]: '22px',
  [GemCostSize.xl]: '28px'
}

interface GemCostStyleProps {
  size: GemCostSize
}

const GemCostStyle = styled.div.attrs((props: GemCostStyleProps) => ({
  size: GemCostNumberSize[props.size]
}))`
  width: ${props => props.size};
  height: ${props => props.size};
  font-size: ${props => props.size};
  border-radius: 100%;
  text-align: center;
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

const CardGemCostSize = {
  [GemCostSize.xs]: '12px',
  [GemCostSize.sm]: '14px;',
  [GemCostSize.md]: '17px',
  [GemCostSize.lg]: '20px',
  [GemCostSize.xl]: '22px'
}

const CostNumberStyle = styled.span.attrs((props: GemCostStyleProps) => ({
  size: CardGemCostSize[props.size]
}))`
  font-size: ${props => props.size};
  font-weight: bold;
  line-height: ${props => props.size};
  color: #fff;
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

const DiamondNumberStyle = styled(CostNumberStyle)`
  color: #666;
`

const CostDiamondIcon = styled(CostGemIcon)`
  
  svg {
    stroke-width: 5;
    stroke: #222;
  }
`

interface CostProps {
  cost: number;
  size?: GemCostSize
}

export const RubyCostUI = (props: CostProps) => {
  return (
    <RubyCostStyle size={props.size}>
      <CostNumberStyle size={props.size}>
        {props.cost}
      </CostNumberStyle>
      {props.size !== GemCostSize.xs
        ? (<CostGemIcon>
            <RubyIcon />
          </CostGemIcon>)
        : null
      }
    </RubyCostStyle>
  )
} 

export const EmeraldCostUI = (props: CostProps) => (
  <EmeraldCostStyle size={props.size}>
    <CostNumberStyle size={props.size}>
      {props.cost}
    </CostNumberStyle>
    {props.size !== GemCostSize.xs
      ? (<CostGemIcon>
          <EmeraldIcon />
        </CostGemIcon>)
      : null
    }
  </EmeraldCostStyle>
)

export const SapphireCostUI = (props: CostProps) => (
  <SapphireCostStyle size={props.size}>
    <CostNumberStyle size={props.size}>
      {props.cost}
    </CostNumberStyle>
    {props.size !== GemCostSize.xs
      ? (<CostGemIcon>
          <SapphireIcon />
        </CostGemIcon>)
      : null
    }
  </SapphireCostStyle>
)


export const OnyxCostUI = (props: CostProps) => (
  <OnyxCostStyle size={props.size}>
    <CostNumberStyle size={props.size}>
      {props.cost}
    </CostNumberStyle>
    {props.size !== GemCostSize.xs
      ? (<CostGemIcon>
          <OnyxIcon />
        </CostGemIcon>)
      : null
    }
  </OnyxCostStyle>
)

export const DiamondCostUI = (props: CostProps) => {
  return (
    <DiamondCostStyle size={props.size}>
      <DiamondNumberStyle size={props.size}>
        {props.cost}
      </DiamondNumberStyle>
      {props.size !== GemCostSize.xs
        ? (<CostDiamondIcon>
            <DiamondIcon />
          </CostDiamondIcon>)
        : null
      }
    </DiamondCostStyle>
  )
}

const GemGroupedCostStyle = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
`

export interface GemCostsUIProps {
  gems: GemStash
  size?: GemCostSize
}

export const GemCostsUI = (props: GemCostsUIProps) => {
  const size = props.size !== undefined ? props.size : GemCostSize.md;

  return (
    <GemGroupedCostStyle>
      {props.gems.diamond > 0 ? <DiamondCostUI cost={props.gems.diamond} size={size} /> : null}
      {props.gems.ruby > 0 ? <RubyCostUI cost={props.gems.ruby} size={size} /> : null}
      {props.gems.emerald > 0 ? <EmeraldCostUI cost={props.gems.emerald} size={size} /> : null}
      {props.gems.onyx > 0 ? <OnyxCostUI cost={props.gems.onyx} size={size} /> : null}
      {props.gems.sapphire > 0 ? <SapphireCostUI cost={props.gems.sapphire} size={size} /> : null}
    </GemGroupedCostStyle>
  )
}