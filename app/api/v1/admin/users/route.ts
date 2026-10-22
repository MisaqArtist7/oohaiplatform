import { NextRequest, NextResponse } from "next/server";
import { adminUsersStore, initialAdminRoles } from "@/lib/admin-dashboard-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const roleSlug = searchParams.get("role");

    let users = [...adminUsersStore];

    if (search) {
      users = users.filter(
        (u) =>
          (u.fullName || u.name).toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.phone.includes(search) ||
          (u.company ? u.company.toLowerCase().includes(search) : false) ||
          u.department.toLowerCase().includes(search)
      );
    }

    if (roleSlug && roleSlug !== "all") {
      users = users.filter((u) => u.roles.some((r) => r.slug === roleSlug));
    }

    return NextResponse.json({
      success: true,
      data: users,
      roles: initialAdminRoles,
      total: users.length,
    });
  } catch (err) {
    console.error("Error in GET /api/v1/admin/users:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست کاربران" },
      { status: 500 }
    );
  }
}
