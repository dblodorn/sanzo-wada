import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled from 'styled-components'
import { mediumType, media, animationFadeUp, smallType } from './../styles'
import { spacing } from './../styles/theme.json'

export default class extends React.Component {
	constructor(props) {
    super(props)
    this.state = {
			copied: false
		}
		this.timer = null
		this.copyHexHandler = this.copyHexHandler.bind(this)
  }

	copyHexHandler = () => {
		this.setState({ copied: true })
		this.timer = setTimeout(() => {
			this.setState({ copied: false })
		}, 2500)
	}

	componentWillUnmount () {
		clearTimeout(this.timer)
	}

	render () {
		return (
			<ComboHexItem hexVal={this.props.hex} className={this.state.copied ? 'copied' : 'not-copied'}>
				<CopyToClipboard text={this.props.hex}
					onCopy={() => this.copyHexHandler()}>
					<SwatchSpan style={{ color: this.props.hex }}>{this.props.hex}</SwatchSpan>
				</CopyToClipboard>
			</ComboHexItem>
		)
	}
}

const ComboHexItem = styled.p`
  ${mediumType};
  margin-right: .5rem;
  width: 100%;
	&:after {
		${smallType};
		content: '${props => props.hexVal} Copied';
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
		background-color: ${props => props.hexVal};
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
