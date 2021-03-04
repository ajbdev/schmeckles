import styled from 'styled-components';
import React from 'react';
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
  children: React.ReactNode
}
interface SplashBackgroundState {
  background: {
    src: string;
    color: string;
  } | null
}

export class SplashBackground extends React.Component<SplashBackgroundProps, SplashBackgroundState> {
  state: SplashBackgroundState;

  constructor(props: SplashBackgroundProps) {
    super(props);

    this.state = {
      background: null
    }
  }

  async componentDidMount() {
    const src = `/splash/splash${Math.floor(Math.random() * 16)+1}.jpg`;
    const fac = new FastAverageColor();

    const color = await fac.getColorAsync(src, {
      ignoredColor: [
        [255, 255, 255, 255], // white
        [0, 0, 0, 255] // black
      ]
    });

    console.log(color);

    this.setState({ background: { src: src, color: color.hex } });
  }

  render() {
    if (this.state.background) {
      return (
        <SplashBackgroundStyle imageSrc={this.state.background.src} bgColor={this.state.background.color}>
          {this.props.children}
        </SplashBackgroundStyle>
      )
    }

    return (
      <>{this.props.children}</>
    );
  }
}


export default function Splash() {
  return (
    <SplashScreenStyle>
      <SplashBackground>
        <SplashTitle>Schmeckles</SplashTitle>
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