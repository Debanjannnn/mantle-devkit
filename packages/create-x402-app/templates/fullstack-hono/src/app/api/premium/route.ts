import { NextRequest, NextResponse } from 'next/server'
import { processPaymentMiddleware, initializePlatform } from 'x402-mantle-sdk/server'

let initialized = false

export async function GET(request: NextRequest) {
  // Initialize platform once
  if (!initialized) {
    await initializePlatform()
    initialized = true
  }

  // Convert headers to plain object
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Process payment - returns 402 if payment required
  const result = await processPaymentMiddleware(
    { price: '0.001', token: 'MNT', testnet: true },
    headers
  )

  // Payment required - return 402 with payment details
  if (result.paymentRequired) {
    const response = NextResponse.json(result.paymentRequired.body, { status: 402 })
    Object.entries(result.paymentRequired.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Payment verified - return premium content
  if (result.allowed) {
    return NextResponse.json({
      success: true,
      message: 'Premium content unlocked!',
      data: {
        secret: 'This is premium data that required payment.',
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Error handling
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status })
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
}
