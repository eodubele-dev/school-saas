import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'EduFlow Platinum - The Operating System for Elite Schools'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    // We can load fonts here if needed, but for simplicity/speed we'll use system fonts or fetch if critical
    // For a robust implementation, we'd normally fetch a specific font file.
    // Using standard sans-serif for now with bold weights.

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    backgroundColor: '#0A0A0B', // Deep Charcoal
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Left Side: Teacher Image */}
                <div
                    style={{
                        display: 'flex',
                        width: '45%',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Note: In Next.js OG, local images need to be absolute URLs or fetchable. 
              Since this runs on the edge/server, we might need the full URL in production.
              However, for a static asset in public, we can try fetching it or using a hardcoded absolute URL if we knew the domain.
              SAFE FALLBACK: Use a solid color placeholder or simple pattern if fetch fails, 
              but ideally we load the image buffer. 
              
              For this implementation, let's assume we can reference the public URL. 
              If running locally, `http://localhost:3000/...` might work.
              Since I don't have the live domain, I will simulate the visual with a gradient/pattern 
              representing the "Teacher" to avoid build errors if the fetch fails during this turn.
              
              Wait, the user wants the "professional image of the teacher". 
              I can use a colored Div acting as a placeholder or try to embed if possible. 
              But `src` in ImageResponse supports absolute URLs.
              
              Let's use a nice gradient placeholder that matches the aesthetic if we can't easily get the absolute URL dynamically without env vars.
              Actually, let's try to assume a standard layout or just style it beautifully with text if image is tricky.
              
              BUT the blueprint explicitly asked for the image.
              I'll assume deployment domain is available or just use a placeholder style that "looks" like the image concept 
              (e.g., a silhouette or icon) if I can't guarantee the image path.
              
              Re-reading: "Visual: On the left, the professional image..."
              I will try to use a dummy placeholder image URL that represents a teacher or similar if I can, 
              or just a high-quality gradient block with an icon for now to ensure it works immediately without broken image icons.
          */}
                    <img
                        src={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/visuals/teacher-empowerment.png`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Teacher"
                    />
                    {/* Cyan Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(6,182,212,0.15)', // Cyan tint
                        }}
                    />
                </div>

                {/* Right Side: Copy & Hook */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '60px',
                        width: '55%',
                        color: 'white',
                    }}
                >
                    {/* Brand Tag */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '40px',
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                marginRight: '12px',
                                boxShadow: '0 0 10px #3b82f6'
                            }}
                        />
                        <span style={{ fontSize: '20px', color: '#94a3b8', letterSpacing: '0.05em' }}>EDUFLOW PLATINUM</span>
                    </div>

                    {/* The Hook */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '32px', color: '#e2e8f0', marginBottom: '10px' }}>
                            Recover up to
                        </span>
                        <span
                            style={{
                                fontSize: '72px',
                                fontWeight: 900,
                                color: '#22d3ee', // Cyan-400
                                textShadow: '0 0 30px rgba(34,211,238,0.3)',
                                lineHeight: 1,
                                marginBottom: '20px'
                            }}
                        >
                            ₦9M/Term
                        </span>
                        <span style={{ fontSize: '32px', color: '#e2e8f0' }}>
                            in Lost Fees.
                        </span>
                    </div>

                    {/* Footer Statement */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '30px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                            The Operating System for Elite Schools.
                        </span>
                    </div>

                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
