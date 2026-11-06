'use client'

import { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled from 'styled-components'
import { mediumType, animationFadeUp, smallType } from './../styles'

export default function CopyHex(props: { hex: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyHexHandler = () => {
    setCopied(true)
    timer.current = setTimeout(() => {
      setCopied(false)
    }, 2500)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  return (
    <ComboHexItem $hexVal={props.hex} className={copied ? 'copied' : 'not-copied'}>
      <CopyToClipboard text={props.hex} onCopy={() => copyHexHandler()}>
        <SwatchSpan style={{ color: props.hex }}>{props.hex}</SwatchSpan>
      </CopyToClipboard>
    </ComboHexItem>
  )
}

const ComboHexItem = styled.p<{ $hexVal: string }>`
  ${mediumType};
  margin-right: .5rem;
  width: 100%;
	&:after {
		${smallType};
		content: '${props => props.$hexVal} Copied';
		pointer-events: none;
		position: fixed;
		z-index: 10000;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		margin: auto;
		display: block;
		width: 18rem;
		height: 2rem;
		padding-top: 1.45rem;
		padding-bottom: .35rem;
		text-align: center;
		color: white;
		opacity: 0;
		background-color: ${props => props.$hexVal};
		border: 2px solid white;
		text-transform: uppercase;
	}
	&.copied {
		&:after {
			${animationFadeUp(1150, 15)};
		}
	}
`

const SwatchSpan = styled.span`
	display: inline-block;
	cursor: pointer;
	padding: 0 5px;
	border-radius: 4px;
	position: relative;
	&:hover {
		background-color: rgba(0,0,0,.05);
	}
`
