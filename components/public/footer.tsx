import Link from "next/link"
import Image from "next/image"
import {
  RiInstagramLine,
  RiFacebookBoxLine,
  RiLinkedinBoxLine,
  RiYoutubeLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine
} from "@remixicon/react"

const navigation = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61580009369378',
      icon: RiFacebookBoxLine,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/tavasya_machine_solutions/',
      icon: RiInstagramLine,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/tavasya-machine-solutions/',
      icon: RiLinkedinBoxLine,
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@TavasyaMachineSolutions',
      icon: RiYoutubeLine,
    },
  ],
}

export function PublicFooter() {
  return (
    <footer className="bg-[#1E3448] text-slate-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="relative h-12 w-48">
              <Image
                src="/Logo-E10.png"
                alt="Tavasya Machine Solutions"
                fill
                sizes="192px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Transforming food processing with advanced cleaning technologies. Engineered for reliability, precision, and efficiency.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-slate-400 hover:text-[#F3BA43]" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0 col-span-2">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Contact Us</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex items-start gap-3 text-sm leading-6">
                    <RiMapPinLine className="h-5 w-5 flex-shrink-0 text-[#F3BA43]" />
                    <span>Office No. 513, Viral Hights, Near Ayodhya Chowk, 150 Feet Ring Rd, Rajkot, 360006</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm leading-6">
                    <RiMailLine className="h-5 w-5 flex-shrink-0 text-[#F3BA43]" />
                    <span>Official E mail I’d: <a href="mailto:info@tavasyamachines.com" className="hover:text-white transition-colors">info@tavasyamachines.com</a></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm leading-6">
                    <RiPhoneLine className="h-5 w-5 flex-shrink-0 text-[#F3BA43]" />
                    <span>Phone Number: </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm leading-6">
                    <RiPhoneLine className="h-5 w-5 flex-shrink-0 text-[#F3BA43]" />
                    <span>Talk to an Expert: <a href="tel:+917567585555" className="hover:text-white transition-colors">+91 75675 85555</a></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm leading-6">
                    <RiMailLine className="h-5 w-5 flex-shrink-0 text-[#F3BA43]" />
                    <span>Email Our Team: <a href="mailto:tavasyamachines@gmail.com" className="hover:text-white transition-colors">tavasyamachines@gmail.com</a></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-400">
            &copy; {new Date().getFullYear()} Tavasya Machine Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
