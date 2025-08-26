import React from 'react'

interface HighlightTextProps {
  text: string
  className?: string
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, className = "" }) => {
  return (
    <span className={`bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text font-bold ${className}`}>
      {" "}
      {text}
    </span>
  )
}

export default HighlightText
