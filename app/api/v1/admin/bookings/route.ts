import { NextRequest, NextResponse } from "next/server";
import { adminBookingsStore } from "@/lib/admin-dashboard-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customer = searchParams.get("customer")?.toLowerCase().trim();
    const structure = searchParams.get("structure")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let items = [...adminBookingsStore];

    if (status && status !== "all") {
      items = items.filter((b) => b.status.value === status);
    }

    if (customer) {
      items = items.filter((b) => {
        const cName = (b.customer?.fullName || b.contactPerson || "").toLowerCase();
        const comp = (b.customer?.companyName || b.brandName || "").toLowerCase();
        const ph = b.customer?.phone || b.contactPhone || "";
        return cName.includes(customer) || comp.includes(customer) || ph.includes(customer);
      });
    }

    if (structure) {
      items = items.filter(
        (b) =>
          b.structure.title.toLowerCase().includes(structure) ||
          b.structure.code.toLowerCase().includes(structure) ||
          b.structure.address.toLowerCase().includes(structure)
      );
    }

    if (search) {
      items = items.filter((b) => {
        const cName = (b.customer?.fullName || b.contactPerson || "").toLowerCase();
        const comp = (b.customer?.companyName || b.brandName || "").toLowerCase();
        return (
          b.id.toLowerCase().includes(search) ||
          b.trackingCode.toLowerCase().includes(search) ||
          cName.includes(search) ||
          comp.includes(search) ||
          b.structure.title.toLowerCase().includes(search) ||
          b.structure.code.toLowerCase().includes(search)
        );
      });
    }

    if (startDate) {
      items = items.filter((b) => b.startDate >= startDate);
    }
    if (endDate) {
      items = items.filter((b) => b.endDate <= endDate);
    }

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
      counts: {
        all: adminBookingsStore.length,
        pending_review: adminBookingsStore.filter((b) => b.status.value === "pending_review").length,
        locked_for_contract: adminBookingsStore.filter((b) => b.status.value === "locked_for_contract").length,
        proforma_issued: adminBookingsStore.filter((b) => b.status.value === "proforma_issued").length,
        payment_submitted: adminBookingsStore.filter((b) => b.status.value === "payment_submitted").length,
        approved: adminBookingsStore.filter((b) => b.status.value === "approved").length,
        active: adminBookingsStore.filter((b) => b.status.value === "active").length,
        rejected: adminBookingsStore.filter((b) => b.status.value === "rejected").length,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/v1/admin/bookings:", err);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست رزروهای ادمین" },
      { status: 500 }
    );
  }
}
