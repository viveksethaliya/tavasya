import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image({ params }: { params: { slug: string } }) {
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
        Meridian Machine Works: {params.slug}
      </div>
    ),
    {
      ...size,
    }
  )
}
