import { adminAuth } from './firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyApiAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'UNAUTHENTICATED', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { user: decodedToken };
  } catch (error) {
    return { error: 'UNAUTHENTICATED', status: 401 };
  }
}

export async function checkPlanLimit(plan: string, feature: string, currentCount: number) {
  const limits: Record<string, Record<string, number>> = {
    free: { alerts: 3, portfolios: 1, signals: 3 },
    pro: { alerts: 50, portfolios: 10, signals: Infinity },
    institutional: { alerts: Infinity, portfolios: Infinity, signals: Infinity },
  };

  const limit = limits[plan || 'free']?.[feature] ?? 0;
  if (currentCount >= limit) {
    return false;
  }
  return true;
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, message, errorCode: code }, { status });
}
