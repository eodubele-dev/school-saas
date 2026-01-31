import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const headers = Object.fromEntries(req.headers)
    return NextResponse.json({
        host: headers.host,
        'x-forwarded-host': headers['x-forwarded-host'],
        url: req.url,
        env_node_env: process.env.NODE_ENV,
        timestamp: Date.now()
    }, {
        headers: {
            'Cache-Control': 'no-store, max-age=0'
        }
    })
}
