import styled from "styled-components";

export const FlexContainer = styled.div<Pick<{ direction?: string; justifyContent?: string }, 'direction' | 'justifyContent'>>`
  display: flex;
  ${props => props.direction ? `flex-direction: ${props.direction}` : ''};
  ${props => props.justifyContent ? `justify-content: ${props.justifyContent}` : ''};
`


