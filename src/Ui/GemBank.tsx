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
        {Object.values(Gem).map(gemType => 
          props.gems[gemType as Gem] > 0 
            ? <SchmeckleStackUI 
                key={`schmeckle_stack_${gemType}`}
                isPlayersTurn={props.isPlayersTurn} 
                gem={gemType as Gem} 
                amount={props.gems[gemType as Gem]} 
                holdGem={holdGem} 
                amountHeld={props.heldGems.filter((g) => g === gemType as Gem).length} 
              />
            : <div>AABBCC</div>
        )}
      </GemBankHolderStyle>
    </GemBankStyle>
  )
}