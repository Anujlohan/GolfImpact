import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { SubscriptionService } from '@/lib/services/subscription.service';
import { checkoutSchema } from '@/lib/validations/subscription';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const parsed = checkoutSchema.parse(body);

    const origin = req.nextUrl.origin;
    const result = await SubscriptionService.createCheckoutSession(
      auth.userId,
      auth.email,
      parsed.planId,
      origin
    );

    return NextResponse.json({ url: result.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
