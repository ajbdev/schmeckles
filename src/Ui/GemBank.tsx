import React, { ForwardedRef, RefObject } from "react";
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

interface GemRefs {
  ruby: RefObject<HTMLDivElement>,
  emerald: RefObject<HTMLDivElement>,
  diamond: RefObject<HTMLDivElement>,
  onyx: RefObject<HTMLDivElement>,
  sapphire: RefObject<HTMLDivElement>,
  star: RefObject<HTMLDivElement>
}


export default class GemBankUI extends React.Component<GemBankProps> {
  gemRefs: GemRefs
  
  constructor(props: GemBankProps) {
    super(props);

    this.gemRefs = {
      ruby: React.createRef(),
      emerald: React.createRef(),
      diamond: React.createRef(),
      onyx: React.createRef(),
      sapphire: React.createRef(),
      star: React.createRef()
    }
  }

  holdGem = (gem: Gem) => {
    if (this.props.heldGems.length < 3) {
      const gems = this.props.heldGems;
      
      gems.push(gem);

      this.props.setHeldGems(gems);
    }
  }

  render() {
    return (
      <GemBankStyle>
        <GemBankHolderStyle>
          {Object.values(Gem).map(gemType =>
            this.props.gems[gemType as Gem] > 0
              ? <SchmeckleStackUI
                key={`schmeckle_stack_${gemType}`}
                isPlayersTurn={this.props.isPlayersTurn}
                gem={gemType as Gem}
                amount={this.props.gems[gemType as Gem]}
                holdGem={this.holdGem}
                amountHeld={this.props.heldGems.filter((g) => g === gemType as Gem).length}
              />
              : null
          )}
        </GemBankHolderStyle>
      </GemBankStyle>
    )
  }
}
