import React, { ForwardedRef, RefObject } from "react";
import styled from "styled-components";
import { GemStash, Gem } from "../Game";
import { SchmeckleGemCoinUI, SchmeckleGemStash } from "./Schmeckles";

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
  ruby: RefObject<HTMLDivElement>[],
  emerald: RefObject<HTMLDivElement>[],
  diamond: RefObject<HTMLDivElement>[],
  onyx: RefObject<HTMLDivElement>[],
  sapphire: RefObject<HTMLDivElement>[],
  star: RefObject<HTMLDivElement>[]
}
export default class GemBankUI extends React.Component<GemBankProps> {
  gemRefs: GemRefs
  
  constructor(props: GemBankProps) {
    super(props);

    this.gemRefs = {
      ruby: [React.createRef(),React.createRef()],
      emerald: [React.createRef(),React.createRef()],
      diamond: [React.createRef(),React.createRef()],
      onyx: [React.createRef(),React.createRef()],
      sapphire: [React.createRef(),React.createRef()],
      star: [React.createRef(),React.createRef()]
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
              ? 
              <SchmeckleGemStash 
                  key={`schmeckle_stack_${gemType}`} 
                  isPlayersTurn={this.props.isPlayersTurn} 
                  onClick={() => this.props.isPlayersTurn && this.holdGem(gemType)} 
                >
                <>
                {[...Array(this.props.gems[gemType as Gem]-this.props.heldGems.filter((g) => g === gemType as Gem).length)].map((_, i) => 
                  <SchmeckleGemCoinUI gem={gemType as Gem} key={`${gemType}_${i}`} />
                )}
                </>
                <>
                {[...Array(this.props.heldGems.filter((g) => g === gemType as Gem).length)].map((_, i) =>
                  <SchmeckleGemCoinUI gem={gemType as Gem} key={`${gemType}_held_${i}`} held={true} ref={this.gemRefs[gemType as Gem][i]} />
                )}
                </>
              </SchmeckleGemStash>
              : null
          )}
        </GemBankHolderStyle>
      </GemBankStyle>
    )
  }
}
