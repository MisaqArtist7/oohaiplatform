import { NextRequest, NextResponse } from "next/server";
import { adminUsersStore } from "@/lib/admin-dashboard-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = adminUsersStore.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "کاربر مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Error in GET user by id:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات کاربر" },
      { status: 500 }
    );
  }
}
