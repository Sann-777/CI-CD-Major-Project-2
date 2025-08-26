import React from 'react'
import ContactForm from '../ContactUsPage/ContactForm'

const ContactFormSection: React.FC = () => {
  return (
    <div className="mx-auto py-12">
      <h1 className="text-center text-5xl font-semibold lg:text-6xl py-4">Get in Touch</h1>
      <p className="text-center text-richblack-300 mt-6 text-lg lg:text-xl leading-relaxed">
        We'd love to here for you, Send us a message.
      </p>
      <div className="mt-16 mx-auto">
        <ContactForm />
      </div>
    </div>
  )
}

export default ContactFormSection
