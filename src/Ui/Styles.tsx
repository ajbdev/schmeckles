import styled from "styled-components";

export const FlexContainer = styled.div<{ direction?: string; justifyContent?: string }>`
  display: flex;
  ${props => props.direction ? `flex-direction: ${props.direction}` : ''};
  ${props => props.justifyContent ? `justify-content: ${props.justifyContent}` : ''};
`


