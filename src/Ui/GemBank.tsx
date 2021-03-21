import { AnimationControls } from "framer-motion";
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
  setAnimationRefs: (key:string, subKey:string, el:HTMLElement) => void
}



export async function animateGemTo(animator: AnimationControls, moveX: number, moveY: number) {
  await animator.start((i) => ({
    y: moveY,
    scale: 1.25,
    rotate: -20,
    transition: { duration: 0.2 },
  }));
  await animator.start((i) => ({
    x: moveX,
    scale: 0.547,
    rotate: -10,
    transition: { duration: 0.5 }
  }));
  await animator.start((i) => ({
    transition: { duration: 0.25 },
    rotate: 0,
    transitionEnd: { scale: 1.0, x: 0, y: 0, rotate: 0 }
  }));
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
          <SchmeckleStackUI 
            key={`schmeckle_stack_${gemType}`}
            isPlayersTurn={props.isPlayersTurn}
            setAnimationRefs={props.setAnimationRefs} 
            gem={gemType as Gem} 
            amount={props.gems[gemType as Gem]} 
            holdGem={holdGem} 
            amountHeld={props.heldGems.filter((g) => g === gemType as Gem).length} 
          />
        )}
      </GemBankHolderStyle>
    </GemBankStyle>
  )
}