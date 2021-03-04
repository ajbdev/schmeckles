import { useState } from "react"
import styled from "styled-components"
import { GameTitle } from "./Splash"

const LobbyPageStyle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const ContentColumnStyle = styled.div`
  flex-direction: column;
  display: flex;
`

const PlayerBoxes = styled.div`
  width: 450px;
  display: flex;
  flex-wrap: wrap;
`

const PlayerBoxStyle = styled.div`
  width: 200px;
  border: 2px solid #ccc;
  height: 200px;
  margin: 10px;
  background: rgba(55,55,55,0.5);
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const LobbyCode = styled.div`
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  padding: 20px;
`

interface LobbyProps {
  hostPlayerName: string;
}

interface PlayerState {
  name: string
}

const code = 'AAAA';

export default function Lobby(props: LobbyProps) {

  const [players, setPlayers] = useState<PlayerState[]>([{ name: props.hostPlayerName }]);

  return (
    <LobbyPageStyle>
      <ContentColumnStyle>
        <GameTitle />
        <LobbyCode>Lobby Code: {code}</LobbyCode>
        <PlayerBoxes>
        {[...Array(4)].map((p,i) =>
          <PlayerBoxStyle>
            {players[i] 
              ? (<>{players[i].name}</>)
              : (<>Waiting for player</>)
            }
            
          </PlayerBoxStyle>
        )}
        </PlayerBoxes>
      </ContentColumnStyle>
    </LobbyPageStyle>
  )
}