import React from 'react'
import { getInquiries } from '@/features/contact/queries'
import { StatusSelect } from './_components/status-select'
import { MessageDialog } from './_components/message-dialog'
import { RiMailLine, RiBuildingLine, RiPhoneLine } from '@remixicon/react'

export const metadata = {
  title: 'Inquiries - Admin Panel',
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries()

  return (
    <div className="w-full pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#324E64]">Inquiries</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage contact form submissions and quote requests from the website.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RiMailLine className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>No inquiries received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Contact Details</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Message</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inquiry.name}</div>
                      <div className="text-sm mt-1 flex items-center gap-2">
                        <RiMailLine className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-[#324E64] transition-colors">{inquiry.email}</a>
                      </div>
                      {inquiry.phone && (
                        <div className="text-sm mt-1 flex items-center gap-2">
                          <RiPhoneLine className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${inquiry.phone}`} className="hover:text-[#324E64] transition-colors">{inquiry.phone}</a>
                        </div>
                      )}
                      {inquiry.company && (
                        <div className="text-sm mt-1 flex items-center gap-2">
                          <RiBuildingLine className="h-4 w-4 text-slate-400" />
                          {inquiry.company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-md xl:max-w-2xl">
                      <MessageDialog name={inquiry.name} message={inquiry.message} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusSelect id={inquiry.id} currentStatus={inquiry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
