import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      console.error('ADMIN_PIN environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Timing-safe comparison to prevent timing attacks
    const pinBuffer = Buffer.from(pin.padEnd(64, '\0'));
    const adminPinBuffer = Buffer.from(adminPin.padEnd(64, '\0'));
    const isValid = pinBuffer.length === adminPinBuffer.length &&
      timingSafeEqual(pinBuffer, adminPinBuffer);

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
