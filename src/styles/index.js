import styled, { css, keyframes } from 'styled-components'
import { spacing, fonts, global, breakpoints } from './theme.json'

// Media Queries
const media = {
  small: (...args) => css`
    @media (max-width: 500px) {
      ${ css(...args) }
    }
  `,
  medium: (...args) => css`
    @media (min-width: ${breakpoints.desktop}px) {
      ${ css(...args) }
    }
  `
}

// Animation
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const animationRotate = css`
  animation: ${spin} 700ms linear 0s infinite normal;
  animation-fill-mode: forwards;
`

const fadesIn = keyframes`
  0% {
    opacity: 0;
    letter-spacing: 20vmin;
    filter: blur(20px);
    transform: scale(.9);
  }
  50% {
    letter-spacing: 2vmin;
    filter: blur(12px);
    transform: scale(.95);
  }
  100% {
    letter-spacing: 1.5vmin;
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
`

const simpleFade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const animationPopIn = css`
  animation: ${fadesIn} 2500ms cubic-bezier(0,1,.2,.99) 0s normal;
  animation-fill-mode: both;
  will-change: all;
  transform: translateZ(0);
`

const animationFadeIn = (time, delay) => {
  return css`
    animation: ${simpleFade} ${time}ms ease normal;
    animation-delay: ${delay}ms;
    animation-fill-mode: both;
  `
}

// FLEX LAYOUT
const flexColumn = css`
  display: flex;
  flex-direction: column;
`
const flexColumnCentered = css`
  ${flexColumn};
  align-items: center;
`

const flexRow = css`
  display: flex;
  flex-direction: row;
`

const flexRowWrap = css`
  ${flexRow};
  flex-wrap: wrap;
`

const flexRowCenteredVert = css`
  ${flexRow};
  align-items: center;
`

const flexRowCenteredAll = css`
  ${flexRowCenteredVert};
  justify-content: center;
`

const flexRowSpaceBetween = css`
  ${flexRow};
  justify-content: space-between;
`

const largeWrapper = css`
  position: relative;
  height: auto;
  transform: translateY(-2vh);
  padding: 2vh 0 12vh;
  padding-left: 4vmin;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 0;
  pointer-events: none;
  top: 25vmin;
  z-index: 1;
  ${media.medium`
    position: fixed;
    height: 108vh;
    top: 0;
  `}
`

// LAYOUT UTILS
const maxWidth = css`
  width: 100%;
  max-width: ${global.max_width};
  padding-left: ${spacing.double_pad};
  padding-right: ${spacing.double_pad};
`

const absoluteCentered = css`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
`

// DOM NODES
const Section = styled.section`
  ${maxWidth};
  ${flexColumn};
  display: flex;
  padding-top: ${spacing.single_pad};
  padding-bottom: ${spacing.single_pad};
`

// STYLE UTILS
const transitionAll = (time) => {
  return css`
    transition-property: all;
    transition-duration: ${time}ms;
    transition-timing-function: ease;
  `
}

// TYPOGRAPHY
const sansFont = css`
  font-family: ${fonts.sans};
  font-weight: 700;
  text-transform: lowercase;
`

const bigType = css`
  font-size: ${fonts.sizes.giant_sm};
  font-family: ${fonts.sans};
  line-height: .8;
  font-weight: bold;
  ${media.medium`
    font-size: ${fonts.sizes.giant};
  `}
`

const mediumType = css`
  font-size: ${fonts.sizes.medium};
  font-family: ${fonts.sans};
  line-height: 1;
  font-weight: bold;
`

const buttonInit = css`
  -webkit-tap-highlight-color: rgba(255,255,255,0);
  border: 0;
  background-color: rgba(255,255,255,0);
  border-radius: 0;
  appearance: none;
  cursor: pointer;
  display: block;
`

const SocialLink = styled.a`
  width: 4rem;
  height: 4rem;
  position: relative;
  display: inline-flex;
  margin-right: 2vmin;
  svg {
    width: 100%;
    height: 100%;
  }
  ${media.medium`
    width: 4.5vmin;
    height: 4.5vmin;
  `}
`

const LogoWrapperFixed = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9000;
  ${media.medium`
    top: 6vmin;
    right: 4vmin;
  `}
`

export {
  flexColumn,
  flexColumnCentered,
  flexRow,
  flexRowWrap,
  flexRowCenteredVert,
  flexRowSpaceBetween,
  flexRowCenteredAll,
  sansFont,
  maxWidth,
  Section,
  absoluteCentered,
  transitionAll,
  animationRotate,
  animationPopIn,
  media,
  bigType,
  buttonInit,
  mediumType,
  largeWrapper,
  animationFadeIn,
  SocialLink,
  LogoWrapperFixed
}
