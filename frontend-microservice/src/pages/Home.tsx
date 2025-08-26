import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import { TypeAnimation } from 'react-type-animation'
import CTAButton from '@/components/core/HomePage/Button'
import Banner from '@/assets/Images/banner.mp4'
import CodeBlocks from '@/components/core/HomePage/CodeBlocks'
import TimelineSection from '@/components/core/HomePage/TimelineSection'
import LearningLanguageSection from '@/components/core/HomePage/LearningLanguageSection'
import InstructorSection from '@/components/core/HomePage/InstructorSection'
import Footer from '@/components/Common/Footer'
import ExploreMore from '@/components/core/HomePage/ExploreMore'
import ReviewSlider from '@/components/Common/ReviewSlider'
import HighlightText from '@/components/core/HomePage/HighlightText'

const Home = () => {
  return (
    <div>
      {/* Section 1 */}
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
        {/* Become a Instructor Button */}
        <Link to={'/signup'}>
          <div className="group mx-auto mt-16 w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        {/* Heading */}
        <div className="text-center text-4xl font-semibold lg:text-5xl py-4 max-w-4xl">
          Unlock your <HighlightText text="coding potential" /> with
          our online courses.
        </div>

        {/* Sub Heading */}
        <div className="mt-4 w-[90%] text-center text-base font-medium text-richblack-300 lg:w-[60%] lg:text-lg leading-6">
          Our courses are designed and taught by industry experts who have
          years of experience in coding and are passionate about sharing their
          knowledge with you.
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-row gap-6">
          <CTAButton active={true} linkto={'/signup'}>
            Try it Yourself
          </CTAButton>
          <CTAButton active={false} linkto={'/login'}>
            Learn More
          </CTAButton>
        </div>

        {/* Video */}
        <div className="mx-3 my-12 w-full max-w-4xl">
          <video
            className="w-full rounded-lg shadow-lg"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            onError={(e) => {
              console.error('Video loading error:', e)
              e.currentTarget.style.display = 'none'
            }}
          >
            <source src={Banner} type="video/mp4" />
            <source src="/src/assets/Images/banner.mp4" type="video/mp4" />
            <div className="flex items-center justify-center h-64 bg-richblack-800 rounded-lg">
              <p className="text-richblack-300">Video not available</p>
            </div>
          </video>
        </div>

        {/* Code Section 1 */}
        <div>
          <CodeBlocks
            position={'lg:flex-row'}
            heading={
              <div className="text-5xl font-semibold lg:text-6xl py-4">
                Unlock your
                <span className="text-gradient"> coding potential </span>
                with our online courses.
              </div>
            }
            subheading={
              'Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you.'
            }
            ctabtn1={{
              btnText: 'Try it Yourself',
              link: '/signup',
              active: true,
            }}
            ctabtn2={{
              btnText: 'Learn More',
              link: '/signup',
              active: false,
            }}
            codeColor={'text-yellow-25'}
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks
            position={'lg:flex-row-reverse'}
            heading={
              <div className="w-[100%] text-5xl font-semibold lg:w-[50%] lg:text-6xl py-4">
                Start
                <span className="text-gradient"> coding in seconds</span>
              </div>
            }
            subheading={
              'Go ahead, give it a try. Our hands-on learning environment means you\'ll be writing real code from your very first lesson.'
            }
            ctabtn1={{
              btnText: 'Continue Lesson',
              link: '/signup',
              active: true,
            }}
            ctabtn2={{
              btnText: 'Learn More',
              link: '/signup',
              active: false,
            }}
            codeColor={'text-white'}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        {/* Explore More Section */}
        <ExploreMore />
      </div>

      {/* Section 2 */}
      <div className="bg-pure-greys-5 text-richblack-700">
        <div className="homepage_bg h-[320px]">
          {/* Explore Full Catalog Section */}
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              <CTAButton active={true} linkto={'/signup'}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={'/login'}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
          {/* Job that is in Demand - Section 1 */}
          <div className="mb-16 mt-[-100px] flex flex-col justify-between gap-12 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-5xl font-semibold lg:w-[45%] lg:text-6xl py-4">
              Get the skills you need for a{' '}
              <span className="text-gradient">job that is in demand.</span>
            </div>
            <div className="flex flex-col items-start gap-12 lg:w-[40%]">
              <div className="text-lg lg:text-xl leading-relaxed">
                The modern StudyNotion is the dictates its own terms. Today, to
                be a competitive specialist requires more than professional
                skills.
              </div>
              <CTAButton active={true} linkto={'/signup'}>
                <div className="">Learn More</div>
              </CTAButton>
            </div>
          </div>

          {/* Timeline Section - Section 2 */}
          <TimelineSection />

          {/* Learning Language Section - Section 3 */}
          <LearningLanguageSection />
        </div>
      </div>

      {/* Section 3 */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        {/* Become a instructor section */}
        <InstructorSection />

        {/* Reviws from Other Learner */}
        <h1 className="text-center text-5xl font-semibold mt-12 lg:text-6xl py-4">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
