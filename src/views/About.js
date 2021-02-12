import React from 'react'
import styled from 'styled-components'
import { SwatchHeader, Title } from './../components'
import { Section, lgBodyCopy, mediumType } from './../styles'
import { spacing, colors } from './../styles/theme.json'

const copy = `
<h2>Wada Sanzō <span lang="ja-jp">和田 三造</span></h2>
<p>1883–1967</p>
<p>Wada Sanzō was born in Hyogo Prefecture, moving to Fukuoka with his family at age 13, and moved again to Tokyo at age 16 with the intention of becoming a painter. In Tokyo, Wada studied under Kuroda Seiki both privately and at the Tokyo School of the Arts and was a member of the Hakubakai artists’ society, with whom he exhibited his works. Wada was sent to France by the Ministry of Education to study art in 1909. He stayed in Europe until 1914, returning to Japan in 1915 after a year-long stay in India and Burma (now Myanmar) studying the arts of those cultures.</p>
<p>Wada became a faculty member of the Imperial Art Institute <span lang="ja-jp">日本芸術院</span> and founded the Japan Standard Color Association <span lang="ja-jp">日本標準色協会</span> in 1927. In 1932 he was appointed professor at the Design Department of Tokyo School of the Arts where he served until 1944. Wada was a leading color theorist and created one of the first systematic approaches to color in Japan, published in the eleven-volume boxed series Color Schemes <span lang="ja-jp">配色総鑑</span> in 1934. The series was the first mass-produced in-depth analysis of color pairings and combinations, laying the groundwork for modern color studies in Japan. Each box contained another immaculately-bound two-color printed gatefold box which held a series of 30 postcard-sized pieces of cardstock each. The cards were incredibly precisely printed and die-cut squares of color combinations glued on top of bilingual English, kanji, and hiragana letterpress-printed color descriptions of each color dyad, triad, or tetrad. The entire collection is a tour de force of both print production and consideration of the impact of color.</p> 
<p>Wada reorganized the Japan Standard Color Association into the Japan Color Research Laboratory in 1945, and served as its president. He was also an award-winning designer—his poster for the ill-fated 1940 Tokyo Olympics won out against other competitors in the late 1930s and Wada also won the Costume Design Award at the 27th Academy Awards in 1954 for his work for the movie Hell’s Gate <span lang="ja-jp">地獄門</span>. Wada was prolific in regards to designing postcards, painting, printmaking and creating illustration work.</p>
<p>His book The Story of Color <span lang="ja-jp">色彩の話</span> was published in 1952 and reprinted in 1957.</p>
`

const createMarkup = () => {
  return {__html: copy};
}

export default () =>
  <React.Fragment>
    <SwatchHeader>
      <Title/>
    </SwatchHeader>
    <Section>
      <AboutCopy dangerouslySetInnerHTML={createMarkup()}/>
      <CreditsWrapper>
        <AboutCopy>
          <h3>Colophon</h3>
          <p>
            Based on the Book: <a href="http://seigensha.com/en/2016/11/01/978-4-86152-247-5/">A Dictionary of Color Combinations</a>
            <br/>Design & Development: <a href="https://dain.kim">Dain Blodorn Kim</a>
            <br/>Biography: <a href="http://ianlynam.com/about/">Ian Lynam</a>
            <br/>Github Repository: <a href="https://github.com/dblodorn/sanzo-wada">https://github.com/dblodorn/sanzo-wada</a>
            <br/>Open Source Contributions: <a href="https://github.com/paolotremadio">Paolo Tremadio</a>, <a href="https://github.com/mattdesl">Matt DesLauriers</a>, <a href="https://github.com/fand">Takayosi Amagi</a>
            <br/>Related Projects: <a href="https://github.com/jmaasch/sanzo">R Package for Data Visualization</a> by <a href="https://github.com/jmaasch">Jacqueline Maasch</a>
          </p>
        </AboutCopy>
      </CreditsWrapper>
    </Section>
  </React.Fragment>

// STYLES
const AboutCopy = styled.article`
  width: 100%;
  max-width: 84rem;
  margin: auto;
  padding-top: ${spacing.double_pad};
  padding-bottom: ${spacing.big_pad};
  padding-left: ${spacing.single_pad};
  padding-right: ${spacing.single_pad};
  * {
    color: ${colors.black}
  }
  h2, h3 {
    ${lgBodyCopy};
    padding-bottom: ${spacing.micro_pad};
  }
  p {
    ${mediumType};
    color: ${colors.black};
    padding-bottom: ${spacing.double_pad};
    line-height: 1.5;
    &:last-child {
      padding-bottom: 0;
    }
  }
`

const CreditsWrapper = styled.div`
  border-top: 1px solid ${colors.med_grey};
  width: 100%;
`