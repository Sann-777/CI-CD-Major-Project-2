import React from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { TypeAnimation } from 'react-type-animation'
import Button from './Button'

interface CodeBlocksProps {
  position: 'lg:flex-row' | 'lg:flex-row-reverse'
  heading: string
  subheading: string
  ctabtn1: {
    btnText: string
    link: string
    active: boolean
  }
  ctabtn2: {
    btnText: string
    link: string
    active: boolean
  }
  codeColor: string
  codeblock: string
  backgroundGradient?: string
}

const CodeBlocks: React.FC<CodeBlocksProps> = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeColor,
  codeblock,
  backgroundGradient,
}) => {
  return (
    <div className={`flex ${position} my-32 justify-between flex-col lg:gap-16 gap-12`}>
      {/* Section 1  */}
      <div className="w-full lg:w-[50%] flex flex-col gap-12">
        {heading}
        <div className="text-richblack-300 text-lg lg:text-xl font-bold w-[90%] mt-4 leading-relaxed">
          {subheading}
        </div>

        <div className="flex gap-8 mt-10">
          <Button active={ctabtn1.active} linkto={ctabtn1.link}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </Button>
          <Button active={ctabtn2.active} linkto={ctabtn2.link}>
            {ctabtn2.btnText}
          </Button>
        </div>
      </div>

      {/* Section 2 */}
      <div className="h-fit code-border flex flex-row py-6 text-sm sm:text-base lg:text-lg leading-[22px] sm:leading-7 relative w-[100%] lg:w-[550px]">
        {backgroundGradient}
        {/* Indexing */}
        <div className="text-center flex flex-col w-[10%] select-none text-richblack-400 font-inter font-bold">
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
          <p>5</p>
          <p>6</p>
          <p>7</p>
          <p>8</p>
          <p>9</p>
          <p>10</p>
          <p>11</p>
        </div>

        {/* Codes */}
        <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-2`}>
          <TypeAnimation
            sequence={[codeblock, 2000, '']}
            cursor={true}
            repeat={Infinity}
            speed={50}
            style={{
              whiteSpace: 'pre-line',
              display: 'block',
            }}
            omitDeletionAnimation={true}
          />
        </div>
      </div>
    </div>
  )
}

export default CodeBlocks
