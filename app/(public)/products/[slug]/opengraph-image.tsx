import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
import { getProductBySlug } from '@/data/products'

export default async function Image({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Tavasya Machines: {product?.name || params.slug}
      </div>
    ),
    {
      ...size,
    }
  )
}
