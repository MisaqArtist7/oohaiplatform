/**
 * وضعیت‌های پیشنهاد هوشمند کمپین تبلیغاتی مطابق سند بک‌اند
 * مقادیر مستندشده pending و completed هستند، اما به دلیل امکان افزودن وضعیت‌های جدید توسط سرور،
 * با `(string & {})` مقادیر ناشناخته نیز بدون خطا پذیرفته می‌شوند.
 */
export type ProposalStatus = "pending" | "completed" | (string & {});

/**
 * ساختار هر سازه در نتیجه پیشنهاد هوشمند
 * صرفاً شامل فیلدهای قطعی و مستندشده بک‌اند بدون افزودن فیلدهای جعلی
 */
export interface ProposalResult {
  id: number;
  proposal_id: number;
  structure_id: number;
  rank: number;
  reasoning: string;
  created_at: string;
  updated_at: string;
}

/**
 * مدل کامل پیشنهاد هوشمند در بک‌اند
 */
export interface Proposal {
  id: number;
  uuid: string;
  user_id: number;
  budget: string; // مقدار مبلغ به ریال در بک‌اند (مثال: "200000000.00")
  city_id: number;
  scenario: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  results?: ProposalResult[];
}

/**
 * ورودی فرم و هوک ایجاد پیشنهاد جدید (مبلغ ورودی در سطح کلاینت به تومان است)
 */
export interface CreateProposalInput {
  budgetToman: number;
  cityId: number;
  scenario: string;
}

/**
 * ساختار پاسخ سرور پس از ثبت پیشنهاد (201 Created)
 */
export interface CreateProposalResponse {
  message: string;
  proposal: {
    id: number;
    status: ProposalStatus;
  };
}

/**
 * پاسخ اندپوینت تک‌پیشنهاد (GET /api/v1/proposals/{id})
 */
export interface ProposalDetailResponse {
  proposal: Proposal;
}
