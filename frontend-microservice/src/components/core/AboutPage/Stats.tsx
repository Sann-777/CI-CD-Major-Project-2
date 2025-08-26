import React from 'react'

const Stats = [
  { count: "5K", label: "Active Students" },
  { count: "10+", label: "Mentors" },
  { count: "200+", label: "Courses" },
  { count: "50+", label: "Awards" },
]

const StatsComponent: React.FC = () => {
  return (
    <div className="bg-richblack-700 py-16">
      {/* Stats */}
      <div className="flex flex-col gap-16 justify-between w-11/12 max-w-maxContent text-white mx-auto ">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-8">
          {Stats.map((data, index) => {
            return (
              <div className="flex flex-col py-12" key={index}>
                <h1 className="text-5xl lg:text-6xl font-bold text-richblack-5 mb-4">
                  {data.count}
                </h1>
                <h2 className="font-semibold text-lg lg:text-xl text-richblack-500">
                  {data.label}
                </h2>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StatsComponent
