
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { avatars } from '../Player';
import { shuffle } from '../Game';

export enum AvatarSize { xs = '16px', sm = '32px', md = '55px', lg = '80px', xl = '100px' };

interface AvatarProps {
  name?: string
  size?: AvatarSize
  border?: string
  src: string;
}

const goldBorderColor = `3px solid var(--gold)`;

const AvatarStyle = styled.div.attrs((props: AvatarProps) => ({
  src: props.src,
  border: props.border || goldBorderColor,
  size: props.size || AvatarSize.md
}))`
  display: inline-block;
  width: ${props => props.size};
  height: ${props => props.size};
  background: url(${props => props.src});
  background-size: cover;
  border: ${props => props.border};
  border-radius: 3px;
`

export const AvatarUI = (props: AvatarProps) => (
  <AvatarStyle src={props.src} size={props.size} border={props.border} />
)

const SelectableAvatarStyle = styled.div.attrs((props: SelectableAvatarProps) => ({

}))`
  display: inline-block;
  cursor: pointer;
`

interface SelectableAvatarProps extends AvatarProps {
  onClick: () => void
}

export const SelectableAvatarUI = (props: SelectableAvatarProps) => {


  return (
    <SelectableAvatarStyle onClick={props.onClick}>
      <AvatarUI {...props} />
    </SelectableAvatarStyle>
  );
}

interface SelectAvatarProps {
  size: AvatarSize
  selectedAvatar: string
  setSelectedAvatar: (avatar:string) => void;
}


const SelectionMaskStyle = styled.div.attrs((props: SelectableAvatarProps) => ({
  size: props.size || AvatarSize.md,
}))`
  width: 500px;
  overflow: hidden;
  border: 3px solid #333;
  height: ${props => props.size};
  background: #000;
`

interface SelectionWrapperStyleProps extends SelectAvatarProps {
  scroll: number
  scrollSpeed: string
} 

const SelectionWrapperStyle = styled.div.attrs((props: SelectionWrapperStyleProps) => ({
  size: props.size || AvatarSize.md,
  scroll: props.scroll || 0,
  scrollSpeed: props.scrollSpeed || '0.5s'
}))`
  border-radius: 4px;
  background: #000;
  white-space: nowrap;
  position: relative;
  transform: translateX(${props => props.scroll}px);
  transition: transform ${props => props.scrollSpeed};
  height: ${props => props.size};
`

const ControlOverlayStyle = styled.div.attrs((props: SelectAvatarProps) => ({
  size: props.size || AvatarSize.md
}))`
  position: absolute;
  border: ${goldBorderColor};
  height: ${props => props.size};
  width: ${props => props.size};
`;

const Scroller = styled.div.attrs((props: SelectAvatarProps) => ({
  size: props.size || AvatarSize.md
}))`
  position: absolute;
  height: calc(${props => props.size} + 6px);
  content: '';
  background: var(--gold);
  width: 20px;
  color: #3a2c00;
  display: block;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: -3px;
  border-top: 5px;
  border-bottom: 5px;
  user-select: none;

  &:hover {
    color: #886800;
  }
`

const ScrollLeft = styled(Scroller).attrs((props: SelectAvatarProps) => ({
  size: props.size || AvatarSize.md
}))`
    margin-left: -20px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;

`

const ScrollRight = styled(Scroller).attrs((props: SelectAvatarProps) => ({
  size: props.size || AvatarSize.md
}))`
  margin-left: ${props => props.size};
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`


const allAvatars = shuffle(avatars.males.avatars.concat(avatars.females.avatars));

const midPoint = Math.floor(allAvatars.length / 2);



export const SelectAvatarUI = (props: SelectAvatarProps) => {

  const [selections, setSelections] = useState(allAvatars);

  const [scrolled, setScrolled] = useState((midPoint) * -100);

  const [selection, setSelection] = useState(midPoint);

  const [scrollSpeed, setScrollSpeed] = useState('0s')

  const traverseSelections = (steps: number) => {
    setScrolled(scrolled + (steps * 100));

    const newSelection = selection+ (steps * -1);
    setSelection(newSelection);

    props.setSelectedAvatar(selections[newSelection]);

    setScrollSpeed('0.5s');
  }

  useEffect(() => {
    const newSelections = selections.filter((s:string) => s !== props.selectedAvatar);

    newSelections.splice(midPoint, 0, props.selectedAvatar);

    setScrolled((midPoint-2) * -100)

    setSelections(newSelections);
  },[]);

  return (
    <>
      <SelectionMaskStyle size={props.size}>
        <SelectionWrapperStyle size={props.size} scroll={scrolled} scrollSpeed={scrollSpeed}>
          {selections.map((avatar:string, ix:number) => 
            <SelectableAvatarUI 
              onClick={() => traverseSelections((ix-selection)*-1)}
              key={`${avatar}_${ix}`} 
              src={avatar} 
              size={props.size} 
              border={"0"} 
            /> 
          )}
        </SelectionWrapperStyle>
      </SelectionMaskStyle>
      <ControlOverlayStyle size={props.size}>
        <ScrollLeft size={props.size} onClick={() => traverseSelections(1)}>◂</ScrollLeft>
        <ScrollRight size={props.size} onClick={() => traverseSelections(-1)}>▸</ScrollRight>
      </ControlOverlayStyle>
    </>
  );
}