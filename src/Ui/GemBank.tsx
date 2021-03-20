import styled from "styled-components";
import { GemStash, Gem } from "../Game";
import { SchmeckleStackUI } from "./Schmeckles";

const GemBankStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const GemBankHolderStyle = styled.div`
  background: #708090;
  border-radius: 5px;
  border-bottom: 6px solid #434d57;
  padding: 6px;
`

interface GemBankProps {
  gems: GemStash
  setHeldGems: (gems:Gem[]) => void
  heldGems: Gem[]
  isPlayersTurn: boolean
}

export default function GemBankUI(props: GemBankProps) {

  const subtracted = {
    diamond: props.heldGems.filter((g) => g === Gem.Diamond).length,
    ruby: props.heldGems.filter((g) => g === Gem.Ruby).length,
    emerald: props.heldGems.filter((g) => g === Gem.Emerald).length,
    onyx: props.heldGems.filter((g) => g === Gem.Onyx).length,
    sapphire: props.heldGems.filter((g) => g === Gem.Sapphire).length,
    star: props.heldGems.filter((g) => g === Gem.Star).length,
  }

  const holdGem = (gem: Gem) => {
    if (props.heldGems.length < 3) {
      const gems = props.heldGems;
      
      gems.push(gem);

      props.setHeldGems(gems);
    }
  }

  return (
    <GemBankStyle>
      <GemBankHolderStyle>
        {props.gems.diamond > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Diamond} amount={props.gems.diamond-subtracted.diamond} holdGem={holdGem} /> : null}
        {props.gems.ruby > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Ruby} amount={props.gems.ruby-subtracted.ruby} holdGem={holdGem} />  : null}
        {props.gems.emerald > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Emerald} amount={props.gems.emerald-subtracted.emerald} holdGem={holdGem} />  : null}
        {props.gems.onyx > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Onyx} amount={props.gems.onyx-subtracted.onyx} holdGem={holdGem} />  : null}
        {props.gems.sapphire > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Sapphire} amount={props.gems.sapphire-subtracted.sapphire} holdGem={holdGem} />  : null}
        {props.gems.star > 0 ? <SchmeckleStackUI isPlayersTurn={props.isPlayersTurn} gem={Gem.Star} amount={props.gems.star-subtracted.star} holdGem={holdGem} />  : null}
      </GemBankHolderStyle>
    </GemBankStyle>
  )
}