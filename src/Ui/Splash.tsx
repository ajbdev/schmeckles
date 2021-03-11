import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import FastAverageColor from 'fast-average-color';
import { generateRandomName, getAvatarFromName } from '../Player';
import { AvatarUI, AvatarSize, SelectAvatarUI } from './Avatars';
import { ReactComponent as ConfirmSvg } from './svg/confirm.svg';
import { ReactComponent as DiceSvg } from './svg/dice.svg';

const SplashScreenStyle = styled.div`
  width: 100%;
  background: #999;
  text-align: center;
  height: 100%;
`

interface SplashScreenProps {
  imageSrc: string;
  bgColor?: string;
}

export const SplashBackgroundStyle = styled.div.attrs((props: SplashScreenProps) => ({
  imageSrc: props.imageSrc,
  bgColor: props.bgColor || '#555555'
}))`
  background-image: url(${props => props.imageSrc});
  background-color: ${props => props.bgColor};
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  height: 100%;
`

const SplashTitle = styled.h1`
  font-size: 70px;
  color: #FFDC73;
  -webkit-text-stroke: 1px #BF9B30;
  margin: 0;
  user-select: none;
  padding: 20px 0 50px 0;
`

const GameTitleStyle = styled.h2`
  font-size: 36px;
  color: #FFDC73;
  -webkit-text-stroke: 0.5px #BF9B30;
  text-shadow: 1px 1px 1px #000;
  margin: 0;
  user-select: none;
  text-align: center;
`

export const GameTitle = () => (
  <GameTitleStyle>Schmeckles</GameTitleStyle>
)

const HostButton = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  background: #91a4e6;
  width: 100%;
  display: block;
  border: 2px solid #3451b3;
`

const JoinGameArea = styled.div`
  display: flex;
  align-self: center;
  margin-top: 20px;
`

const JoinGameInput = styled.input`
  font-size: 28px;
  padding: 10px;
  border: 2px solid #ccc;
  text-align: center;
  text-transform: uppercase;
  width: 50%;
`

const JoinGameButton = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  border: 2px solid #2f8a33;
  background: #5ee465;
  margin-left: 20px;
  width: 50%;
`
const StartLobbyButtonsStyle = styled.div`
  margin: 10px;
  max-width: 400px;
  align-self: center;
`

export enum BackgroundType { Menu = 'menu', Board = 'board'}

interface SplashBackgroundProps {
  children: React.ReactNode
  type: BackgroundType
  src?: string
}
interface SplashBackgroundState {
  background: {
    src: string;
    color: string;
  }
}

export function getRandomBackground(type: BackgroundType) {
  return `${process.env.PUBLIC_URL}/splash/${type}${Math.floor(Math.random() * 8)+1}.jpg`;
}

export class SplashBackground extends React.Component<SplashBackgroundProps, SplashBackgroundState> {
  state: SplashBackgroundState;

  constructor(props: SplashBackgroundProps) {
    super(props);

    this.state = {
      background: {
        src: props.src || '',
        color: ''
      }
    }
  }

  componentDidMount() {
    this.loadBackground();
  }

  async loadBackground() {
    const src = this.props.src || getRandomBackground(this.props.type);
    const fac = new FastAverageColor();

    const color = await fac.getColorAsync(src);

    this.setState({ background: { src: src, color: color.hex } });
  }

  render() {
    return (
      <SplashBackgroundStyle imageSrc={this.props.src || this.state.background.src} bgColor={this.state.background.color}>
        {this.props.children}
      </SplashBackgroundStyle>
    );
  }
}

const ChangeNameLink = styled.a`
  color: #00d9ff;
  text-decoration: underline;
  cursor: pointer;
`

const WelcomeStyle = styled.p`
  color: #fff;
  font-size: 24px;
  height: 32px;
  text-shadow: 1px 1px 1px #000;
  font-weight: bold;
  user-select: none;
`

const ChosenNameStyle = styled.a`
  border-bottom: 1px dashed #fff;
  cursor: pointer;
`

const ChangeNameInput = styled.input`
  padding: 2px;
  font-size: 20px;
  text-align: center;
  margin-left: 10px;
  width: 140px;
`

const ErrorMessage = styled.div`
  font-size: 20px;
  color: #fff;
  display: inline-block;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.5);
`

const ColumnStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
`

const SelectNewAvatarStyle = styled.div`
  cursor: pointer;
`

const CenteredStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const SelectPositioning = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`


const randomName = generateRandomName();
const randomAvatar = getAvatarFromName(randomName);

interface SplashProps {
  hostLobby: (playerName: string) => void;
  joinLobby: (code: string, playerName: string) => void;
  errorMessage: string;
}

const RandomAvatarStyle = styled.button`
  background: transparent;
  vertical-align: middle;
  margin-left: 6px;
  border-radius: 3px;
  cursor: pointer;
  border: 0;
  svg {
    fill: #fff;
    stroke: #555555;
    margin-top: 4px;
    stroke-width: 20;
    height: 28px;
    width: 28px;
  }
`

const RandomAvatarButtonUI = (props: { onClick: () => void }) => (
  <RandomAvatarStyle {...props}>
    <DiceSvg />
  </RandomAvatarStyle>
)

const ConfirmButtonStyle = styled.button`
  border: 2px solid var(--confirm);
  background: transparent;
  vertical-align: middle;
  margin-left: 6px;
  border-radius: 3px;
  cursor: pointer;
  svg {
    fill: var(--confirm);
    height: 23px;
    width: 20px;
  }
`;

const ConfirmButtonUI = (props: { onClick: () => void}) => (
  <ConfirmButtonStyle {...props}>
    <ConfirmSvg />
  </ConfirmButtonStyle>
);


export default function Splash(props: SplashProps) {
  const [isChangingName, setIsChangingName] = useState(false);

  const [name, setName] = useState(randomName);
  const [suggestedName, setSuggestedName] = useState(randomName);

  const [avatar, setAvatar] = useState(randomAvatar);
  const [suggestedAvatar, setSuggestedAvatar] = useState('');

  const [code, setCode] = useState('');

  const suggestAvatar = () => {
    const newName = generateRandomName();

    setSuggestedName(newName);
    setSuggestedAvatar(getAvatarFromName(newName));
  }

  const changePlayer = () => {
    setName('');
    setIsChangingName(true);
  }

  const setPlayer = () => {
    if (name.trim().length === 0) {
      setName(suggestedName);
    }

    setIsChangingName(false);
  }

  const handleEnter = (i: any) => { 
    if (i.which === 13) {
      setIsChangingName(false);
    }
  }

  useEffect(() => {
    if (window.location.pathname.length > 1) {
      const c = window.location.pathname.replace('/','');

      if (c.length === 4) {
        setCode(c)
      }
    }
  }, [])
  
  return (
    <SplashScreenStyle>
      <SplashBackground type={BackgroundType.Menu}>
        <ColumnStyle>
          <div>
            <SplashTitle>Schmeckles</SplashTitle>
          </div>
          <CenteredStyle>
            { props.errorMessage ? <ErrorMessage>{props.errorMessage}</ErrorMessage> : null}

            <WelcomeStyle>
              Welcome, 
              {isChangingName 
                ? (
                  <>
                    <ChangeNameInput type="text" placeholder={suggestedName} autoFocus={true} onChange={v => setName(v.target.value)} onKeyPress={handleEnter} />
                    <RandomAvatarButtonUI onClick={() => suggestAvatar()} />
                    <ConfirmButtonUI onClick={() => setPlayer()} />
                  </>
                )
                : (
                  <>
                    &nbsp;
                    <ChosenNameStyle onClick={() => changePlayer()}>{name}</ChosenNameStyle>! 
                    &nbsp;
                    <ChangeNameLink onClick={() => changePlayer()}>Change</ChangeNameLink>
                  </>
                )
                }
            </WelcomeStyle>
            <SelectPositioning>
            {isChangingName
              ? (
                <SelectAvatarUI size={AvatarSize.xl} selectedAvatar={avatar} suggestedAvatar={suggestedAvatar} setSelectedAvatar={(avatar:string) => setAvatar(avatar)} />
              )
              : (
                <SelectNewAvatarStyle onClick={() => changePlayer()}>
                  <AvatarUI src={avatar} size={AvatarSize.xl} />
                </SelectNewAvatarStyle>
              )
            }
            </SelectPositioning>
          </CenteredStyle>
          <StartLobbyButtonsStyle>
            <HostButton onClick={() => props.hostLobby(name)}>
              Host a game
            </HostButton>
            <JoinGameArea>
              <JoinGameInput type="text" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
              <JoinGameButton disabled={code.length !== 4} onClick={() => props.joinLobby(code, name)}>Join Game</JoinGameButton>
            </JoinGameArea>
          </StartLobbyButtonsStyle>
        </ColumnStyle>
      </SplashBackground>
    </SplashScreenStyle>
  )
}