import { NextResponse } from "next/server";
import { performReviewAction, ReviewActionInputSchema } from "@/lib/antigravity/review/review-store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ campaignSlug: string; prospectSlug: string }> },
) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = ReviewActionInputSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Invalid review action." }, { status: 400 });
  }

  const params = await context.params;

  try {
    const reviewRecord = await performReviewAction({
      campaignSlug: params.campaignSlug,
      prospectSlug: params.prospectSlug,
      input: validation.data,
    });

    return NextResponse.json({ ok: true, reviewRecord });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review action failed." },
      { status: 500 },
    );
  }
}
