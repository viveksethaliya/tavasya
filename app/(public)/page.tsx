import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import {
  RiStarSLine,
  RiCheckDoubleLine,
  RiArrowRightLine
} from "@remixicon/react"

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 1st Section: Hero */}
      <div className="relative bg-[#1E3448] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt="Advanced agro-food cleaning and sorting machine facility"
            fill
            className="object-cover object-center opacity-30 mix-blend-overlay"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Advanced Agro-Processing Machines
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Engineering innovation, trust, and precision into every machine we build.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-x-6">
              <Link href="/contact">
                <Button size="lg" className="bg-[#F3BA43] text-[#324E64] hover:bg-[#F3BA43]/90 font-bold px-8 shadow-sm w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-white hover:text-[#F3BA43] transition-colors flex items-center gap-2">
                Learn More <RiArrowRightLine className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Section: Features */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="mt-2 text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">
              Every solution we engineer is built to reduce waste, enhance food safety, and create a more sustainable path for the agro-food industry
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
              {[
                { name: 'Cereal & Grain Cleaning', icon: '/icons/image.png' },
                { name: 'Grading & Sorting Machines', icon: '/icons/image1.png' },
                { name: 'Elevators & Conveyors', icon: '/icons/image3.png' },
                { name: 'Peanut Husk Separator', icon: '/icons/image2.png' },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <dt className="flex flex-col items-center lg:items-start gap-y-4 text-lg font-semibold leading-7 text-[#324E64]">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-3 relative overflow-hidden">
                      <Image src={feature.icon} alt={feature.name} fill className="object-contain p-2" />
                    </div>
                    {feature.name}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 3rd Section: Excellence & Testimonials */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start">
            <div className="lg:pr-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-[#F3BA43]">Expertise</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">35+ Years of Engineering Excellence</p>
                <div className="mt-10 max-w-xl text-base leading-7 text-slate-600">
                  With decades of expertise in agro-food engineering, we bring trusted experience and proven innovation to every solution we create. Our machines are built to handle groundnuts, food grains, pulses, oilseeds, and spices/condiments, ensuring cleaner produce, safer operations, and lasting performance.
                </div>

                <h3 className="mt-8 text-2xl font-bold tracking-tight text-[#324E64]">What We Stand For</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Our commitment lies in delivering trust through technology. Each of our solutions is crafted to ensure purity, performance, and perfection. redefining quality standards for the global food and FMCG industries.
                </p>
                <ul role="list" className="mt-8 space-y-4 text-slate-600">
                  {[
                    'Supporting cleaner, safer, and healthier food systems',
                    'Innovative designs to meet tomorrow’s food challenges',
                    'Scalable solutions for diverse food processing industries',
                    'Enhancing productivity across the food supply chain',
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-x-3">
                      <RiCheckDoubleLine className="mt-1 h-5 w-5 flex-none text-[#F3BA43]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-[#1E3448] rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl">
              <h3 className="text-xl font-semibold leading-7 text-white mb-8">Client Reviews</h3>
              <div className="space-y-8">
                {[
                  {
                    quote: "Tavasya’s cleaning system has completely optimized our processing line. The quality of the output and consistency we’ve achieved are unmatched. Their technology truly delivers on precision and performance.",
                    author: "Operations Head, Food Processing Company"
                  },
                  {
                    quote: "We’ve been using Tavasya machines for over a year, and the reliability has been exceptional. From installation to after-sales support, their team is professional, prompt, and committed to long-term partnerships.",
                    author: "Plant Manager, FMCG Manufacturing Unit"
                  },
                  {
                    quote: "The efficiency of our cleaning process improved significantly after integrating Tavasya’s solutions. The machines are well-engineered and built to handle continuous operations with zero compromise on quality.",
                    author: "Production Director, Agro-Food Industry"
                  },
                  {
                    quote: "What sets Tavasya apart is their understanding of industrial needs. They customized the system to fit our existing setup perfectly. it’s rare to find such engineering precision and customer focus.",
                    author: "Procurement Lead, Food Ingredients Company"
                  }
                ].map((testimonial, idx) => (
                  <figure key={idx} className="border-l-2 border-[#F3BA43] pl-6">
                    <div className="flex gap-1 text-[#F3BA43] mb-2">
                      <RiStarSLine className="h-4 w-4" />
                      <RiStarSLine className="h-4 w-4" />
                      <RiStarSLine className="h-4 w-4" />
                      <RiStarSLine className="h-4 w-4" />
                      <RiStarSLine className="h-4 w-4" />
                    </div>
                    <blockquote className="text-slate-300 text-sm leading-6 italic">
                      <p>“{testimonial.quote}”</p>
                    </blockquote>
                    <figcaption className="mt-3 text-sm font-semibold text-white">
                      - {testimonial.author}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4th Section: Company Features */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">Our Company Features</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              At Tavasya Machine Solutions, we combine engineering expertise with innovation to redefine the standards of agro-food cleaning and processing.<br />
              From design to installation, every step reflects our commitment to quality, precision, and sustainability.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  title: "Advanced Cleaning Technology",
                  sentence: "Delivering next-generation cleaning systems designed for accuracy, efficiency, and reliability.",
                  readMore: "Our machines are engineered using advanced air, vibration, and grading mechanisms that ensure the removal of dust, stones, and impurities with exceptional precision. Whether for groundnuts or other agro-produce, Tavasya’s cleaning systems guarantee consistent results, minimal wastage, and superior output quality helping you meet modern food safety and production standards."
                },
                {
                  title: "End-to-End Engineering Excellence",
                  sentence: "From concept to commissioning, we provide fully integrated solutions tailored to your needs.",
                  readMore: "Our expert team ensures that every machine fits seamlessly into your workflow. With durable construction, user-friendly operation, and continuous performance monitoring, we help your facility achieve long-term productivity and peace of mind."
                },
                {
                  title: "Sustainability & Customer Commitment",
                  sentence: "Innovating responsibly to create lasting value for customers and the planet.",
                  readMore: "Our focus goes beyond building machines, we create solutions that deliver long-term value and consistent performance. Each system is engineered for reliability, precision, and ease of operation, helping our customers achieve higher productivity and uncompromised quality."
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <dt className="text-xl font-bold leading-7 text-[#324E64]">{feature.title}</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto font-medium text-slate-900">{feature.sentence}</p>

                    <Dialog>
                      <DialogTrigger className="mt-6 text-sm font-semibold text-[#F3BA43] hover:text-[#324E64] transition-colors text-left focus:outline-none">
                        Read More &rarr;
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl text-[#324E64]">{feature.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 text-base leading-7 text-slate-600">
                          {feature.readMore}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
