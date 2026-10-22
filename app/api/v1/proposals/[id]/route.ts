import { NextRequest, NextResponse } from "next/server";
import { proposalsStore } from "@/lib/client-dashboard-data";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  segmentData: RouteParams
) {
  try {
    const params = await segmentData.params;
    const proposalId = params.id;

    if (!proposalId) {
      return NextResponse.json(
        { success: false, message: "شناسه پیشنهاد الزامی است" },
        { status: 400 }
      );
    }

    const proposal = proposalsStore.find(
      (p) =>
        p.id.toLowerCase() === proposalId.toLowerCase() ||
        p.trackingNumber.toLowerCase() === proposalId.toLowerCase()
    );

    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "پیشنهاد کمپین مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جزئیات پیشنهاد کمپین" },
      { status: 500 }
    );
  }
}
