import React from 'react'

interface TabData {
  id: number
  tabName: string
  type: string
}

interface TabProps {
  tabData: TabData[]
  field: string
  setField: (value: string) => void
}

const Tab: React.FC<TabProps> = ({ tabData, field, setField }) => {
  return (
    <div className="flex bg-richblack-800 p-1 gap-x-1 my-6 rounded-full max-w-max">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={`${
            field === tab.type
              ? 'bg-richblack-900 text-richblack-5'
              : 'bg-transparent text-richblack-200'
          } py-2 px-5 rounded-full transition-all duration-200`}
        >
          {tab.tabName}
        </button>
      ))}
    </div>
  )
}

export default Tab
