import React, { Component } from 'react'
import { Head, AgeVerification } from './components'
import styled, { injectGlobal } from 'styled-components'
import { media, flexColumn } from './styles'
import { colors, fonts } from './styles/theme.json'

class Document extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    window.scrollTo(0, 0)
  }
  render() {
    return (
      <Main>
        {this.props.children}
      </Main>
    )
  }
}

export default Document

// NORMALIZE CSS
injectGlobal`
  html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}
  ol, ul {
    list-style: none;
  }
  html {
    font-size: 58%;
    -webkit-font-smoothing: antialiased;
  }
  @media screen and (min-width: 960px) {
    html {
      font-size: 62.5%;
    }
  }
  @media screen and (min-width: 1550px) {
    html {
      font-size: 72.5%;
    }
  }
  @media screen and (min-width: 1750px) {
    html {
      font-size: 78.5%;
    }
  }
  body {
    font-size: 16px;
    overflow-x: hidden;
    width: 100vw;
    min-height: 100vh;
    margin: 0;
    font-family: arial;
    color: ${colors.black};
    font-family: ${fonts.sans};
    font-weight: 300;
    font-style: normal;
    text-decoration: none;
  }
  * {
    box-sizing: border-box;
    outline: 0;
  }
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #FF0000;
  }
  ::-webkit-input-placeholder,
  ::-moz-placeholder {
    color: white;
    font-size: 15vmin;
    ${fonts.sans};
  }
`

const Main = styled.main`
  ${flexColumn};
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 2;
  ${media.medium`
    min-height: 100vh;
  `}
`
