import { ImageResponse } from 'next/og';

// Use Edge Runtime for faster generation
export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // 1. Extract Settings from URL (matching your page.tsx defaults)
    const url = searchParams.get('url') || 'https://eticpa.et';
    const pageBgColor = searchParams.get('bg') || 'transparent'; // Default to transparent for API usage
    const cardColor = searchParams.get('card') || '#18181b';
    const scanMeText = searchParams.get('text') || 'SCAN ME';
    const scanMeColor = searchParams.get('tcolor') || '#ffffff';
    const scanMeSize = parseInt(searchParams.get('tsize') || '32');
    const qrColor = searchParams.get('qcolor') || '#000000';
    const qrBgColor = searchParams.get('qbg') || '#ffffff';
    const arrowColor = searchParams.get('acolor') || '#ffffff';
    const arrowStyle = searchParams.get('astyle') || 'triangle';

    // 2. Generate the internal QR code image URL
    // We rely on the same external API to generate the raw QR bitmap
    const qrRawUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}&color=${qrColor.replace('#', '')}&bgcolor=${qrBgColor.replace('#', '')}&margin=0`;

    // 3. Render the Image
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pageBgColor,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: cardColor,
                        borderRadius: 30,
                        padding: 32,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        width: 320,
                    }}
                >
                    {/* Header Text */}
                    {scanMeSize > 0 && (
                        <div
                            style={{
                                color: scanMeColor,
                                fontSize: scanMeSize,
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                                marginBottom: 8,
                                textTransform: 'uppercase',
                                fontFamily: 'sans-serif',
                            }}
                        >
                            {scanMeText}
                        </div>
                    )}

                    {/* Arrow Indicator */}
                    {arrowStyle !== 'none' && (
                        <div style={{ display: 'flex', marginBottom: 24 }}>
                            {arrowStyle === 'triangle' && (
                                // Using SVG for reliable rendering in ImageResponse
                                <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
                                    <path d="M0 0L40 20L80 0H0Z" fill={arrowColor} />
                                </svg>
                            )}
                            {arrowStyle === 'chevron' && (
                                <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                                    <path d="M2 2 L20 18 L38 2" stroke={arrowColor} strokeWidth="6" fill="none"/>
                                </svg>
                            )}
                            {arrowStyle === 'bar' && (
                                <div style={{ width: 60, height: 6, backgroundColor: arrowColor, borderRadius: 4 }} />
                            )}
                        </div>
                    )}

                    {/* QR Code Container */}
                    <div
                        style={{
                            display: 'flex',
                            padding: 16,
                            borderRadius: 16,
                            backgroundColor: qrBgColor,
                            width: 250,
                            height: 250,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* ImageResponse allows standard <img> tags.
              We use the external QR API as the source.
            */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrRawUrl}
                            width="218"
                            height="218"
                            style={{ objectFit: 'contain' }}
                            alt="QR"
                        />
                    </div>
                </div>
            </div>
        ),
        {
            width: 400,
            height: 500, // Fixed canvas size
        }
    );
}
