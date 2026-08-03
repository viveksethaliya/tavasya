import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RiSettings4Line, RiTeamLine, RiShieldStarLine } from "@remixicon/react"

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#1E3448] py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-slate-600 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Powering the Next Generation of Agro-Food Cleaning & Grading
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Modern food processors rely on intelligent technology to meet global quality standards and that’s where our machines make the difference. Designed to clean and grade diverse agro-produce including cereals, pulses, oilseeds, spices, and peanuts, Tavasya systems ensure consistent quality output and higher operational efficiency across every batch.
            </p>
          </div>
        </div>
      </div>

      {/* Solutions / Points Section */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {[
              { name: 'Cereal & Grain Cleaning', icon: '/icons/image.png' },
              { name: 'Grading & Sorting Machines', icon: '/icons/image copy.png' },
              { name: 'Elevators & Conveyors', icon: '/icons/image copy 2.png' },
              { name: 'Peanut Husk Separator', icon: '/icons/image copy 3.png' },
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

      {/* Content Section */}
      <div className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0">
              <div className="flex flex-col gap-6 bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100">
                <div className="w-12 h-12 bg-[#F3BA43]/20 rounded-xl flex items-center justify-center">
                  <RiSettings4Line className="h-6 w-6 text-[#F3BA43]" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#324E64]">Tailored Engineering Solutions</h2>
                <p className="text-base leading-7 text-slate-600 flex-auto">
                  We listen. We design. We deliver. Tavasya puts customer needs at the center ensuring that every machine we build meets performance expectations and works seamlessly from day one.
                </p>
              </div>
              
              <div className="flex flex-col gap-6 bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100">
                <div className="w-12 h-12 bg-[#F3BA43]/20 rounded-xl flex items-center justify-center">
                  <RiShieldStarLine className="h-6 w-6 text-[#F3BA43]" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#324E64]">Adaptive Design & Technology</h2>
                <p className="text-base leading-7 text-slate-600 flex-auto">
                  Markets change, raw produce varies; we adapt. Tavasya invests in research & prototyping to incorporate latest cleaning technologies, better materials, efficient layouts. This allows us to respond quickly to new industry needs or operational challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General About Text */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <RiTeamLine className="mx-auto h-12 w-12 text-[#324E64] mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">About Tavasya Machine Solutions</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 text-left">
              Tavasya Machine Solutions is a forward-looking engineering company dedicated to transforming the agro-food sector with advanced cleaning and processing technologies. Founded with the vision to deliver innovation, reliability, and efficiency, we specialize in designing and manufacturing high-performance machines for agro-food cleaning.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600 text-left">
              Our solutions are built to meet the growing demand for quality, safety, and productivity in food processing. We provide end-to-end services covering design, manufacturing, installation, and lifetime support ensuring that our customers achieve seamless operations with maximum value.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600 text-left font-semibold">
              At Tavasya, our purpose is simple yet powerful: to innovate for a cleaner and better future in food processing. Guided by principles of trust, precision, and customer-first values, we are committed to setting new benchmarks in agro-food technology while contributing to a more sustainable and efficient food supply chain.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1E3448] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get in touch:</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Have questions? Want to see how Tavasya machines can elevate your operations? Drop us a message, request a quote, or visit our facility.
            </p>
            <div className="mt-10 max-w-xl mx-auto text-slate-300 text-left space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Contact Us:</h3>
              <p><strong className="text-white">Phone:</strong> +91 XXXXXXXXXX</p>
              <p><strong className="text-white">Email:</strong> info@tavasyamachines.com</p>
              <p><strong className="text-white">Address:</strong> Office No. 513, Viral Hights, Near Ayodhya Chowk, 150 Feet Ring Rd, Rajkot, 360006</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
