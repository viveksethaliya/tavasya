'use client'

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RiMapPinLine, RiPhoneLine, RiMailLine } from "@remixicon/react"

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#1E3448] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Have a question? We&apos;re here to help.</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#324E64]">Contact Us:</h2>
            <dl className="mt-10 space-y-8 text-base leading-7 text-slate-600">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Address</span>
                  <RiMapPinLine className="h-7 w-6 text-[#F3BA43]" aria-hidden="true" />
                </dt>
                <dd>
                  <span className="block font-semibold text-[#324E64]">Address:</span>
                  Office No. 513, Viral Hights, Near Ayodhya Chowk, 150 Feet Ring Rd, Rajkot, 360006
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <RiMailLine className="h-7 w-6 text-[#F3BA43]" aria-hidden="true" />
                </dt>
                <dd>
                  <span className="block font-semibold text-[#324E64]">Official E mail I&apos;d:</span>
                  <a className="hover:text-[#324E64] font-medium" href="mailto:info@tavasyamachines.com">
                    info@tavasyamachines.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Telephone</span>
                  <RiPhoneLine className="h-7 w-6 text-[#F3BA43]" aria-hidden="true" />
                </dt>
                <dd>
                  <span className="block font-semibold text-[#324E64]">Talk to an Expert:</span>
                  <a className="hover:text-[#324E64] font-medium" href="tel:+917567585555">
                    +91 75675 85555
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <RiMailLine className="h-7 w-6 text-[#F3BA43]" aria-hidden="true" />
                </dt>
                <dd>
                  <span className="block font-semibold text-[#324E64]">Email Our Team:</span>
                  <a className="hover:text-[#324E64] font-medium" href="mailto:tavasyamachines@gmail.com">
                    tavasyamachines@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Contact Form — opens user's email client on submit */}
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-[#324E64] mb-8">Send us a message</h3>
            <form
              ref={formRef}
              action="mailto:info@tavasyamachines.com"
              method="post"
              encType="text/plain"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="mt-2">
                    <Input type="text" name="name" id="name" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="mt-2">
                    <Input type="email" name="email" id="email" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="mt-2">
                    <Input type="tel" name="phone" id="phone" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="mt-2">
                    <Input type="text" name="company" id="company" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="message">Message *</Label>
                  <div className="mt-2">
                    <Textarea name="message" id="message" rows={4} required />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full bg-[#324E64] hover:bg-[#324E64]/90 text-white py-6 text-lg rounded-xl"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
