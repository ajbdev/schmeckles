import styled from 'styled-components';
import React, { useState } from 'react';
import FastAverageColor from 'fast-average-color';


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
  -webkit-text-stroke: 2px #BF9B30;
  margin: 0;
  padding: 20px 0 50px 0;
`

export const GameTitle = styled.h2`
  font-size: 30px;
  color: #FFDC73;
  -webkit-text-stroke: 2px #BF9B30;
  margin: 0;
  padding: 20px 0 50px 0;
`

const HostButton = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  background: #91a4e6;
  border: 2px solid #3451b3;
  width: 400px;
`

const JoinGameArea = styled.div`
  display: flex;
  margin: 20px auto;
  width: 400px;
`

const JoinGameInput = styled.input`
  font-size: 28px;
  padding: 10px;
  border: 2px solid #ccc;
  text-align: center;
  width: 150px;
`

const JoinGameButton = styled.button`
  border-radius: 0;
  font-size: 28px;
  padding: 10px;
  border: 2px solid #2f8a33;
  background: #5ee465;
  margin-left: 20px;
  width: 230px;
`
interface SplashBackgroundProps {
  children: React.ReactNode,
  src?: string
}
interface SplashBackgroundState {
  background: {
    src: string;
    color: string;
  }
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
    const src = this.props.src || `/splash/splash${Math.floor(Math.random() * 16)+1}.jpg`;
    const fac = new FastAverageColor();

    const color = await fac.getColorAsync(src);

    this.setState({ background: { src: src, color: color.hex } });
  }

  render() {
    return (
      <SplashBackgroundStyle imageSrc={this.state.background.src} bgColor={this.state.background.color}>
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

const names = ['Helgi','Finnbogi','Abu','Jean','Samo','Giovanni','Luís','Jeanne','Gregorio','Domini','Andres','Guglielmo','Hugo','Muhammad', 'Eldad', 'Wulfstan', 'Joseph', 'Aldo', 'Alessio', 'Cosimo', 'Fabritio', 'Francesca', 'Galileo', 'Isabetta', 'Lavinia', 'Madalena', 'Minerva', 'Nencia', 'Vinci'];

const randomName = names[Math.floor(Math.random()*names.length)];

interface SplashProps {

}

export default function Splash(props: SplashProps) {
  const [isChangingName, setIsChangingName] = useState(false);

  const [name, setName] = useState(randomName);

  const handleEnter = (i: any) => { 
    if (i.which === 13) {
      setIsChangingName(false);
    }
  }
  
  return (
    <SplashScreenStyle>
      <SplashBackground src={`/splash/splash6.jpg`}>
        <SplashTitle>Schmeckles</SplashTitle>
        <WelcomeStyle>
          Welcome, 
          {isChangingName 
            ? (
              <ChangeNameInput type="text" placeholder={name} autoFocus={true} onChange={v => setName(v.target.value)} onKeyPress={handleEnter} />
            )
            : (
              <>
                &nbsp;
                <ChosenNameStyle onClick={() => setIsChangingName(true)}>{name}</ChosenNameStyle>! 
                &nbsp;
                <ChangeNameLink onClick={() => setIsChangingName(true)}>Change Name</ChangeNameLink>
              </>
            )
            }
          

        </WelcomeStyle>
        <HostButton>
          Host a game
        </HostButton>
        <JoinGameArea>
          <JoinGameInput type="text" placeholder="Code" />
          <JoinGameButton>Join Game</JoinGameButton>

        </JoinGameArea>
      </SplashBackground>
    </SplashScreenStyle>
  )
}