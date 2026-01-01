import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple hash function for password comparison
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Get credentials from environment
        const validUsername = process.env.AUTH_USERNAME;
        const validPasswordHash = process.env.AUTH_PASSWORD_HASH;

        if (!validUsername || !validPasswordHash) {
            return NextResponse.json(
                { error: 'Auth not configured' },
                { status: 500 }
            );
        }

        // Verify credentials
        const passwordHash = hashPassword(password);

        if (username === validUsername && passwordHash === validPasswordHash) {
            return NextResponse.json({
                success: true,
                user: username
            });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
