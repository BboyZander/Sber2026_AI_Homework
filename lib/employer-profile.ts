import type { TaskCategory } from "@/lib/constants";
import { TASK_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { getDemoUserById, getMockSession } from "@/lib/auth";
import type { EmployerCustomerType, EmployerProfile } from "@/types/user";
import { emitProfileUpdated } from "@/lib/profile-sync";

/** Ключ localStorage для данных кабинета работодателя (сбрасывается вместе с демо). */
export const EMPLOYER_PROFILE_STORAGE_KEY = "trajectory-employer-profile-overrides";

const STORAGE_KEY = EMPLOYER_PROFILE_STORAGE_KEY;

export const EMPLOYER_CUSTOMER_TYPES = ["legal_entity", "sole_proprietor"] as const;

function isEmployerCustomerType(x: string): x is EmployerCustomerType {
  return (EMPLOYER_CUSTOMER_TYPES as readonly string[]).includes(x);
}

export const EMPLOYER_CUSTOMER_TYPE_LABELS: Record<EmployerCustomerType, string> = {
  legal_entity: "Юридическое лицо",
  sole_proprietor: "ИП",
};

/** Подсказки для быстрого выбора тегов (отображение = значение в списке). */
export const EMPLOYER_TAG_SUGGESTIONS = ["Ивенты", "Промо", "B2B", "Доставка", "Контент", "Образование"] as const;

export type EmployerCabinetPatch = {
  companyName: string;
  city: string;
  customerType: EmployerCustomerType;
  taskCategories: TaskCategory[];
  cabinetDescription: string;
  cabinetTags: string[];
};

type StoredMap = Record<string, EmployerCabinetPatch>;

function readAll(): StoredMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    return data as StoredMap;
  } catch {
    return {};
  }
}

function writeAll(map: StoredMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadEmployerProfilePatch(employerId: string): EmployerCabinetPatch | null {
  const p = readAll()[employerId];
  if (!p || typeof p.companyName !== "string") return null;
  return p;
}

export function saveEmployerProfilePatch(employerId: string, patch: EmployerCabinetPatch): void {
  const all = readAll();
  all[employerId] = patch;
  writeAll(all);
  emitProfileUpdated({ role: "employer", userId: employerId });
}

export function getEmployerProfileMerged(base: EmployerProfile): EmployerProfile {
  const p = loadEmployerProfilePatch(base.id);
  if (!p) return base;
  const allowedCat = new Set<string>([...TASK_CATEGORIES]);
  const taskCategories = p.taskCategories.filter((c): c is TaskCategory => allowedCat.has(c));
  const companyName = p.companyName.trim() || base.companyName;
  const customerType = isEmployerCustomerType(String(p.customerType)) ? p.customerType : base.customerType ?? "legal_entity";
  return {
    ...base,
    companyName,
    name: companyName,
    city: p.city.trim() ? p.city.trim() : undefined,
    customerType,
    taskCategories,
    cabinetDescription: p.cabinetDescription.trim() ? p.cabinetDescription.trim() : undefined,
    cabinetTags: normalizeTags(p.cabinetTags),
  };
}

export function resolveSessionEmployer(fallback: EmployerProfile): EmployerProfile {
  if (typeof window === "undefined") return fallback;
  const s = getMockSession();
  if (s?.role !== "employer") return fallback;
  const u = getDemoUserById(s.userId);
  if (!u || u.role !== "employer") return fallback;
  const { login: _l, password: _p, ...rest } = u;
  return getEmployerProfileMerged(rest as EmployerProfile);
}

export function profilePatchFromEmployer(emp: EmployerProfile): EmployerCabinetPatch {
  return {
    companyName: emp.companyName,
    city: emp.city ?? "",
    customerType: emp.customerType ?? "legal_entity",
    taskCategories: emp.taskCategories?.length ? [...emp.taskCategories] : [],
    cabinetDescription: emp.cabinetDescription ?? "",
    cabinetTags: emp.cabinetTags?.length ? [...emp.cabinetTags] : [],
  };
}

export function normalizeTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const s = t.trim().slice(0, 24);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= 8) break;
  }
  return out;
}

const DESC_MAX = 400;
const COMPANY_MIN = 2;
const LEGAL_NAME_TAIL_MIN = 2;

/** Допустимые правовые формы в начале наименования юрлица (длинные — раньше в шаблоне). */
const LEGAL_FORM_HEAD =
  /^(ПАО|ОАО|ЗАО|ООО|НКО|ОДО|ТОО|АНО|ФГУП|ГУП|МУП|ТСЖ|СНТ|АО)\s+(.+)$/iu;

const LEGAL_FORM_CANON: Record<string, string> = {
  пао: "ПАО",
  оао: "ОАО",
  зао: "ЗАО",
  ооо: "ООО",
  нко: "НКО",
  одо: "ОДО",
  тоо: "ТОО",
  ано: "АНО",
  фгуп: "ФГУП",
  гуп: "ГУП",
  муп: "МУП",
  тсж: "ТСЖ",
  снт: "СНТ",
  ао: "АО",
};

/**
 * Общая нормализация наименования: лишние пробелы, типографские тире, «мусорные» знаки между словами.
 * Кавычки и обрамляющие точки у слов убираются; дефис внутри слова сохраняется.
 */
export function normalizeCompanyNameForSave(raw: string): string {
  let s = raw.trim().replace(/[–—−]/g, "-");
  s = s.replace(/[.,;:!?_/|\\·•]+/g, " ");
  s = s.replace(/[''"«»„“”]+/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s
    .split(" ")
    .map((w) =>
      w
        .replace(/^['".«»„“”]+|['".«»„“”]+$/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join(" ");
  return s;
}

/** Запрещённые ОПФ и явные «товарные» маркеры в названии ИП (после префикса «ИП»). */
const ORG_MARKERS_IN_IP_NAME =
  /\b(ООО|ЗАО|ОАО|ПАО|АО|НКО|ОДО|ТОО|ИПООО|ТМ|Торговая\s+марка|товарный\s+знак)\b/iu;

/**
 * Проверка названия для ИП: только «ИП» + ФИО кириллицей, без ОПФ и товарных наименований.
 * @returns текст ошибки или undefined, если ок.
 */
export function validateSoleProprietorCompanyName(raw: string): string | undefined {
  const t = normalizeCompanyNameForSave(raw);
  if (t.length < 8) {
    return "Для ИП укажите «ИП», затем фамилию и имя (отчество — по желанию).";
  }
  if (!/^ИП\u0020+/iu.test(t)) {
    return "Для ИП название должно начинаться с «ИП» и пробела, далее только ФИО.";
  }
  const after = t.replace(/^ИП\u0020+/iu, "").trim();
  if (!after) {
    return "После «ИП» укажите фамилию и имя.";
  }
  if (ORG_MARKERS_IN_IP_NAME.test(t)) {
    return "Нельзя указывать организационно-правовые формы, товарные знаки и коммерческие наименования — только «ИП» и ФИО.";
  }
  if (/[«»"'„“”0-9@#%&]/.test(after)) {
    return "В ФИО не используйте кавычки, цифры и служебные символы.";
  }
  if (!/^[А-ЯЁа-яё\- ]+$/.test(after)) {
    return "После «ИП» допускаются только кириллица, пробелы и дефис (в т.ч. в составной фамилии).";
  }
  const parts = after.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return "Укажите минимум фамилию и имя после «ИП».";
  }
  return undefined;
}

/** Нормализация отображаемого названия ИП: «ИП » + ФИО, единичные пробелы. */
export function formatSoleProprietorCompanyName(raw: string): string {
  const t = normalizeCompanyNameForSave(raw);
  const after = t.replace(/^ИП\u0020+/iu, "").trim();
  return after ? `ИП ${after}` : "ИП";
}

/**
 * Юрлицо: правовая форма + наименование (минимум одно слово после формы, не короче порога).
 * @returns текст ошибки или undefined, если ок.
 */
export function validateLegalEntityCompanyName(raw: string): string | undefined {
  const t = normalizeCompanyNameForSave(raw);
  if (t.length < COMPANY_MIN) {
    return `Укажите название не короче ${COMPANY_MIN} символов.`;
  }
  const m = LEGAL_FORM_HEAD.exec(t);
  if (!m) {
    return "Укажите правовую форму (ООО, АО, ПАО и т.п.) и наименование через пробел.";
  }
  const tail = normalizeCompanyNameForSave(m[2]);
  if (tail.length < LEGAL_NAME_TAIL_MIN) {
    return "Добавьте наименование организации после правовой формы.";
  }
  return undefined;
}

/** Канонический вид: ОПФ в стандартном написании + остаток с нормализацией пробелов. */
export function formatLegalEntityCompanyName(raw: string): string {
  const t = normalizeCompanyNameForSave(raw);
  const m = LEGAL_FORM_HEAD.exec(t);
  if (!m) return t;
  const key = m[1].toLowerCase();
  const form = LEGAL_FORM_CANON[key] ?? m[1].toUpperCase();
  const tail = normalizeCompanyNameForSave(m[2]);
  return `${form} ${tail}`.trim();
}

export function validateEmployerCabinetPatch(values: EmployerCabinetPatch):
  | { ok: true; patch: EmployerCabinetPatch }
  | { ok: false; companyError?: string; descriptionError?: string } {
  const companyRaw = values.companyName.trim();
  const cabinetDescription = values.cabinetDescription.trim();
  if (cabinetDescription.length > DESC_MAX) {
    return { ok: false, descriptionError: `Описание — не длиннее ${DESC_MAX} символов.` };
  }
  const allowedCat = new Set<string>([...TASK_CATEGORIES]);
  const taskCategories = values.taskCategories.filter((c): c is TaskCategory => allowedCat.has(c));
  const customerType = isEmployerCustomerType(values.customerType) ? values.customerType : "legal_entity";

  let companyName: string;
  if (customerType === "sole_proprietor") {
    const ipErr = validateSoleProprietorCompanyName(companyRaw);
    if (ipErr) return { ok: false, companyError: ipErr };
    companyName = formatSoleProprietorCompanyName(companyRaw);
  } else {
    const leErr = validateLegalEntityCompanyName(companyRaw);
    if (leErr) return { ok: false, companyError: leErr };
    companyName = formatLegalEntityCompanyName(companyRaw);
  }

  return {
    ok: true,
    patch: {
      companyName,
      city: values.city.trim(),
      customerType,
      taskCategories,
      cabinetDescription,
      cabinetTags: normalizeTags(values.cabinetTags),
    },
  };
}

export function taskCategoryLabel(code: TaskCategory): string {
  return CATEGORY_LABELS[code];
}
