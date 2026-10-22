import { NextRequest, NextResponse } from "next/server";
import {
  adminUsersStore,
  assignRoleToUser,
  removeRoleFromUser,
} from "@/lib/admin-dashboard-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = adminUsersStore.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.roles,
    });
  } catch (err) {
    console.error("Error in GET user roles:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت نقش‌های کاربر" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json().catch(() => ({}));
    const { roleSlug } = body;

    if (!roleSlug) {
      return NextResponse.json(
        { success: false, message: "شناسه نقش الزامی است" },
        { status: 400 }
      );
    }

    const updatedUser = assignRoleToUser(userId, roleSlug);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "کاربر یا نقش نامعتبر است" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "نقش با موفقیت به کاربر اختصاص داده شد.",
    });
  } catch (err) {
    console.error("Error in POST assign role:", err);
    return NextResponse.json(
      { success: false, message: "خطا در انتساب نقش" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const roleSlug = body.roleSlug || searchParams.get("roleSlug");

    if (!roleSlug) {
      return NextResponse.json(
        { success: false, message: "شناسه نقش برای حذف الزامی است" },
        { status: 400 }
      );
    }

    const updatedUser = removeRoleFromUser(userId, roleSlug);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "نقش با موفقیت از کاربر حذف شد.",
    });
  } catch (err) {
    console.error("Error in DELETE remove role:", err);
    return NextResponse.json(
      { success: false, message: "خطا در سلب نقش از کاربر" },
      { status: 500 }
    );
  }
}
