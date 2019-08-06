import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import chroma from 'chroma-js'
import { spacing, fonts, shared, breakpoints, colors } from './theme.json'

// Media Queries
const media = {
  small: (...args) => css`
    @media (max-width: 500px) {
      ${ css(...args) }
    }
  `,
  medium: (...args) => css`
    @media (max-width: ${breakpoints.desktop}px) {
      ${ css(...args) }
    }
  `
}

// Animation
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

const fadeUp = keyframes`
  0% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
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

const animationFadeUp = (time, delay) => {
  return css`
    animation: ${fadeUp} ${time}ms ease normal;
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

// LAYOUT UTILS
const maxWidth = css`
  width: 100%;
  max-width: ${shared.max_width};
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
  ${flexColumn};
  width: 100%;
  display: flex;
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
  font-size: ${fonts.sizes.lg};
  font-family: ${fonts.sans};
  line-height: 1.1;
  font-weight: bold;
  word-spacing: .5vmin;
  letter-spacing: .125vmin;
  padding-right: ${spacing.double_pad};
  margin-bottom: 3vmin;
  display: block;
  position: relative;
  ${media.small`
    font-size: 3.5rem;
  `}
`

const lgBodyCopy = css`
  font-size: ${fonts.sizes.med_lg};
  font-family: ${fonts.sans};
  font-weight: 500;
  line-height: 1.35;
  padding-right: ${spacing.single_pad};
`

const mediumType = css`
  font-size: ${fonts.sizes.med};
  font-family: ${fonts.sans};
  font-weight: 500;
  line-height: 1.45;
`

const smallType = css`
  font-size: ${fonts.sizes.sm};
  font-family: ${fonts.sans};
  line-height: .8;
`

const microType = css`
  font-size: ${fonts.sizes.micro};
  font-family: ${fonts.sans};
  line-height: .8;
  letter-spacing: 1px;
  word-spacing: 2px;
`

const H1 = styled.h1`
  ${mediumType};
  color: ${colors.med_grey};
`

const H1Big = styled.h1`
  ${bigType};
  color: ${colors.black};
`

const H2 = styled.h2`
  ${smallType};
  ${media.small`
    width: 100%;
    text-align: center;
  `}
`

const H2Big = styled.h2`
  ${mediumType};
`

const P = styled.p`
  ${mediumType};
  padding-bottom: ${spacing.single_pad};
  max-width: ${shared.max_width};
  padding-right: ${spacing.double_pad};
  &:last-child {
    padding-bottom: 0;
  }
`

const PBig = styled.p`
  ${lgBodyCopy};
  color: ${colors.black};
  padding-bottom: ${spacing.double_pad};
  &:last-child {
    padding-bottom: 0;
  }
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

const SwatchLink = styled(Link)`
  width: 100%;
  height: 100%;
  position: absolute;
  display: block;
  text-decoration: none;
  top: 0;
  left: 0;
  cursor: pointer;
  color: ${colors.grey};
`

const ComboLink = styled(Link)`
  ${bigType};  
  color: ${colors.grey};
  margin-bottom: ${spacing.double_pad};
  display: inline-flex;
  &:hover {
    color: ${colors.white};
  }
`

const ComboTitle = styled.h1`
  ${mediumType};
  padding-left: ${spacing.single_pad};
  padding-right: calc(${spacing.single_pad} - 4px);
  &:after {
    content: '|';
    padding-left: ${spacing.single_pad};
  }
  ${media.small`
    padding: 0 ${spacing.single_pad} ${spacing.single_pad};
    &:after {
      content: '';
    }
  `}
`

const ComboHex = styled.div`
  ${flexRow};
`

const buttonStyle = css`
  ${buttonInit};
  ${microType};
  ${flexRowCenteredAll};
  color: ${colors.med_grey};
  text-transform: uppercase;
  height: 3rem;
  background-color: ${chroma(colors.grey).darken(.2)};
  color: ${colors.white};
  border-radius: 1.5rem;
  will-change: background-color;
  transition: background-color 250ms ease;
  width: 10.5rem;
  text-decoration: none;
  span {
    padding-top: 2px;
  }
  &:hover {
    background-color: ${chroma(colors.grey).darken(1.5)};
  }
  &.active {
    background-color: ${chroma(colors.grey).darken(.5)};
  }
  ${media.small`
    background-color: ${chroma(colors.grey).darken(1.125)}; 
    width: auto;
    min-width: 10rem;
    padding: 0 1.5rem;
    span {
      padding-top: 1px;
    }
    &.active {
      background-color: ${chroma(colors.grey).darken(1.5)};
    }
  `}
`

const StyledButton = styled.button`
  ${buttonStyle};
`

const ButtonLink = styled(Link)`
  ${buttonStyle};
`

const SmallLink = styled(Link)`
  ${smallType};
  text-decoration: underline;
  color: ${colors.grey};
`

const ButtonHref = styled.a`
  ${buttonStyle}; 
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
  animationPopIn,
  media,
  bigType,
  mediumType,
  buttonInit,
  H2,
  H1,
  H1Big,
  H2Big,
  P,
  PBig,
  smallType,
  lgBodyCopy,
  StyledButton,
  ButtonHref,
  SwatchLink,
  ButtonLink,
  ComboLink,
  animationFadeIn,
  SmallLink,
  ComboTitle,
  ComboHex,
  animationFadeUp
}
