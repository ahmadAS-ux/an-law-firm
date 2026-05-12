import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Permission definitions
const PERMISSIONS = [
  { key: "createMatter",          category: "matter",  description: "Create matters",                 descriptionAr: "إنشاء مسائل" },
  { key: "approveMatter",         category: "matter",  description: "Approve matters",                descriptionAr: "اعتماد المسائل" },
  { key: "activateMatter",        category: "matter",  description: "Activate approved matters",      descriptionAr: "تفعيل المسائل المعتمدة" },
  { key: "editApprovedMatter",    category: "matter",  description: "Edit approved matters",          descriptionAr: "تعديل المسائل المعتمدة" },
  { key: "deleteMatter",          category: "matter",  description: "Delete matters",                 descriptionAr: "حذف المسائل" },
  { key: "assignTeamMembers",     category: "matter",  description: "Assign team members",            descriptionAr: "تعيين أعضاء الفريق" },
  { key: "viewFinancialReports",  category: "billing", description: "View financial reports",         descriptionAr: "عرض التقارير المالية" },
  { key: "generateInvoices",      category: "billing", description: "Generate invoices",              descriptionAr: "إنشاء فواتير" },
  { key: "manageBilling",         category: "billing", description: "Manage billing",                 descriptionAr: "إدارة الفوترة" },
  { key: "managePermissions",     category: "system",  description: "Manage permissions",             descriptionAr: "إدارة الصلاحيات" },
  { key: "manageUsers",           category: "system",  description: "Manage users",                   descriptionAr: "إدارة المستخدمين" },
  { key: "systemSettings",        category: "system",  description: "System settings",                descriptionAr: "إعدادات النظام" },
  { key: "addTimeEntry",          category: "time",    description: "Add time entries",               descriptionAr: "إضافة إدخالات الوقت" },
  { key: "viewOwnTimeEntries",    category: "time",    description: "View own time entries",          descriptionAr: "عرض إدخالات الوقت الخاصة" },
  { key: "viewOthersTimeEntries", category: "time",    description: "View others time entries",       descriptionAr: "عرض إدخالات وقت الآخرين" },
  { key: "editOwnTimeEntries",    category: "time",    description: "Edit own time entries",          descriptionAr: "تعديل إدخالات الوقت الخاصة" },
  { key: "editOthersTimeEntries", category: "time",    description: "Edit others time entries",       descriptionAr: "تعديل إدخالات وقت الآخرين" },
  { key: "approveTimeEntries",    category: "time",    description: "Approve time entries",           descriptionAr: "اعتماد إدخالات الوقت" },
  { key: "rejectTimeEntries",     category: "time",    description: "Reject time entries",            descriptionAr: "رفض إدخالات الوقت" },
  { key: "lockBilledEntries",     category: "billing", description: "Lock billed time entries",       descriptionAr: "تأمين إدخالات الوقت المفوترة" },
  { key: "viewBillingRates",      category: "billing", description: "View billing rates",             descriptionAr: "عرض أسعار الفوترة" },
  { key: "modifyBillingRates",    category: "billing", description: "Modify billing rates",           descriptionAr: "تعديل أسعار الفوترة" },
  { key: "viewMatterContent",     category: "matter",  description: "View matter content",            descriptionAr: "عرض محتوى المسائل" },
  { key: "viewClientConfidential",category: "matter",  description: "View confidential client info",  descriptionAr: "عرض معلومات العميل السرية" },
  { key: "viewAuditLog",          category: "system",  description: "View audit log",                 descriptionAr: "عرض سجل التدقيق" },
  { key: "editPermissions",       category: "system",  description: "Edit permissions matrix",        descriptionAr: "تعديل مصفوفة الصلاحيات" },
  { key: "viewOwnReports",        category: "reports", description: "View own time and performance reports",         descriptionAr: "عرض التقارير الشخصية" },
  { key: "viewDepartmentReports", category: "reports", description: "View reports for own department employees",     descriptionAr: "عرض تقارير موظفي القسم" },
  { key: "viewAllReports",        category: "reports", description: "View firm-wide reports across all departments", descriptionAr: "عرض تقارير الشركة الكاملة" },
];

type PermGrant = {
  granted: boolean;
  scope?: string;
  isLocked?: boolean;
  lockedDirection?: string;
};

// Permission matrix per role: key -> PermGrant
const ROLE_MATRIX: Record<string, Record<string, PermGrant>> = {
  PARTNER: Object.fromEntries(
    PERMISSIONS.map((p) => [p.key, { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" }])
  ),

  SYSTEM_ADMIN: {
    createMatter:          { granted: false },
    approveMatter:         { granted: false },
    activateMatter:        { granted: false },
    editApprovedMatter:    { granted: false },
    deleteMatter:          { granted: false },
    assignTeamMembers:     { granted: false },
    viewFinancialReports:  { granted: false, isLocked: true, lockedDirection: "OFF" },
    generateInvoices:      { granted: false },
    manageBilling:         { granted: false, isLocked: true, lockedDirection: "OFF" },
    managePermissions:     { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" },
    manageUsers:           { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" },
    systemSettings:        { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" },
    addTimeEntry:          { granted: false },
    viewOwnTimeEntries:    { granted: false },
    viewOthersTimeEntries: { granted: false },
    editOwnTimeEntries:    { granted: false },
    editOthersTimeEntries: { granted: false },
    approveTimeEntries:    { granted: false },
    rejectTimeEntries:     { granted: false },
    lockBilledEntries:     { granted: false },
    viewBillingRates:      { granted: false },
    modifyBillingRates:    { granted: false },
    viewMatterContent:     { granted: false, isLocked: true, lockedDirection: "OFF" },
    viewClientConfidential:{ granted: false, isLocked: true, lockedDirection: "OFF" },
    viewAuditLog:          { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" },
    editPermissions:       { granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" },
    viewOwnReports:        { granted: false, isLocked: true, lockedDirection: "OFF" },
    viewDepartmentReports: { granted: false, isLocked: true, lockedDirection: "OFF" },
    viewAllReports:        { granted: false, isLocked: true, lockedDirection: "OFF" },
  },

  DEPARTMENT_MANAGER: {
    createMatter:          { granted: true, scope: "OWN_DEPARTMENT" },
    approveMatter:         { granted: true, scope: "OWN_DEPARTMENT" },
    activateMatter:        { granted: true, scope: "OWN_DEPARTMENT" },
    editApprovedMatter:    { granted: true, scope: "OWN_DEPARTMENT" },
    deleteMatter:          { granted: false },
    assignTeamMembers:     { granted: true, scope: "OWN_DEPARTMENT" },
    viewFinancialReports:  { granted: false },
    generateInvoices:      { granted: false },
    manageBilling:         { granted: false },
    managePermissions:     { granted: false },
    manageUsers:           { granted: false },
    systemSettings:        { granted: false },
    addTimeEntry:          { granted: true, scope: "ALL" },
    viewOwnTimeEntries:    { granted: true, scope: "ALL" },
    viewOthersTimeEntries: { granted: true, scope: "OWN_DEPARTMENT" },
    editOwnTimeEntries:    { granted: true, scope: "ALL" },
    editOthersTimeEntries: { granted: true, scope: "OWN_DEPARTMENT" },
    approveTimeEntries:    { granted: true, scope: "OWN_DEPARTMENT" },
    rejectTimeEntries:     { granted: true, scope: "OWN_DEPARTMENT" },
    lockBilledEntries:     { granted: false },
    viewBillingRates:      { granted: true, scope: "OWN_DEPARTMENT" },
    modifyBillingRates:    { granted: false },
    viewMatterContent:     { granted: true, scope: "OWN_DEPARTMENT" },
    viewClientConfidential:{ granted: false },
    viewAuditLog:          { granted: false },
    editPermissions:       { granted: false },
    viewOwnReports:        { granted: true, scope: "OWN" },
    viewDepartmentReports: { granted: true, scope: "OWN_DEPARTMENT" },
    viewAllReports:        { granted: false },
  },

  EMPLOYEE: {
    createMatter:          { granted: true, scope: "ALL" },
    approveMatter:         { granted: false },
    activateMatter:        { granted: false },
    editApprovedMatter:    { granted: false },
    deleteMatter:          { granted: false },
    assignTeamMembers:     { granted: false },
    viewFinancialReports:  { granted: false },
    generateInvoices:      { granted: false },
    manageBilling:         { granted: false },
    managePermissions:     { granted: false },
    manageUsers:           { granted: false },
    systemSettings:        { granted: false },
    addTimeEntry:          { granted: true, scope: "ALL" },
    viewOwnTimeEntries:    { granted: true, scope: "ALL" },
    viewOthersTimeEntries: { granted: false },
    editOwnTimeEntries:    { granted: true, scope: "ALL" },
    editOthersTimeEntries: { granted: false },
    approveTimeEntries:    { granted: false },
    rejectTimeEntries:     { granted: false },
    lockBilledEntries:     { granted: false },
    viewBillingRates:      { granted: false },
    modifyBillingRates:    { granted: false },
    viewMatterContent:     { granted: true, scope: "OWN" },
    viewClientConfidential:{ granted: false },
    viewAuditLog:          { granted: false },
    editPermissions:       { granted: false },
    viewOwnReports:        { granted: true, scope: "OWN" },
    viewDepartmentReports: { granted: false },
    viewAllReports:        { granted: false },
  },

  ADMIN_STAFF: {
    createMatter:          { granted: false },
    approveMatter:         { granted: false },
    activateMatter:        { granted: false },
    editApprovedMatter:    { granted: false },
    deleteMatter:          { granted: false },
    assignTeamMembers:     { granted: false },
    viewFinancialReports:  { granted: false },
    generateInvoices:      { granted: false },
    manageBilling:         { granted: false },
    managePermissions:     { granted: false },
    manageUsers:           { granted: false },
    systemSettings:        { granted: false },
    addTimeEntry:          { granted: true, scope: "PARTIAL" },
    viewOwnTimeEntries:    { granted: true, scope: "ALL" },
    viewOthersTimeEntries: { granted: false },
    editOwnTimeEntries:    { granted: true, scope: "ALL" },
    editOthersTimeEntries: { granted: false },
    approveTimeEntries:    { granted: false },
    rejectTimeEntries:     { granted: false },
    lockBilledEntries:     { granted: false },
    viewBillingRates:      { granted: false },
    modifyBillingRates:    { granted: false },
    viewMatterContent:     { granted: false },
    viewClientConfidential:{ granted: false },
    viewAuditLog:          { granted: false },
    editPermissions:       { granted: false },
    viewOwnReports:        { granted: false },
    viewDepartmentReports: { granted: false },
    viewAllReports:        { granted: false },
  },

  ACCOUNTANT: {
    createMatter:          { granted: false },
    approveMatter:         { granted: false },
    activateMatter:        { granted: false },
    editApprovedMatter:    { granted: false },
    deleteMatter:          { granted: false },
    assignTeamMembers:     { granted: false },
    viewFinancialReports:  { granted: true, scope: "ALL" },
    generateInvoices:      { granted: true, scope: "ALL" },
    manageBilling:         { granted: true, scope: "ALL" },
    managePermissions:     { granted: false },
    manageUsers:           { granted: false },
    systemSettings:        { granted: false },
    addTimeEntry:          { granted: true, scope: "ALL" },
    viewOwnTimeEntries:    { granted: true, scope: "ALL" },
    viewOthersTimeEntries: { granted: true, scope: "PARTIAL" },
    editOwnTimeEntries:    { granted: true, scope: "ALL" },
    editOthersTimeEntries: { granted: false },
    approveTimeEntries:    { granted: false },
    rejectTimeEntries:     { granted: false },
    lockBilledEntries:     { granted: true, scope: "ALL" },
    viewBillingRates:      { granted: true, scope: "ALL" },
    modifyBillingRates:    { granted: true, scope: "ALL" },
    viewMatterContent:     { granted: false },
    viewClientConfidential:{ granted: false },
    viewAuditLog:          { granted: false },
    editPermissions:       { granted: false },
    viewOwnReports:        { granted: true, scope: "OWN" },
    viewDepartmentReports: { granted: false, isLocked: true, lockedDirection: "OFF" },
    viewAllReports:        { granted: false, isLocked: true, lockedDirection: "OFF" },
  },
};

const ROLES_DEF = [
  { name: "PARTNER",            nameAr: "شريك",               isLocked: true  },
  { name: "SYSTEM_ADMIN",       nameAr: "مسؤول النظام",        isLocked: true  },
  { name: "DEPARTMENT_MANAGER", nameAr: "مدير الإدارة",        isLocked: false },
  { name: "EMPLOYEE",           nameAr: "موظف",                isLocked: false },
  { name: "ADMIN_STAFF",        nameAr: "موظف إداري",          isLocked: false },
  { name: "ACCOUNTANT",         nameAr: "محاسب",               isLocked: false },
];

async function main() {
  // ── 1. Departments ──────────────────────────────────────────────────────────
  const litigation = await prisma.department.upsert({
    where: { name: "Litigation" },
    create: { name: "Litigation", nameAr: "التقاضي" },
    update: {},
  });
  const corporate = await prisma.department.upsert({
    where: { name: "Corporate" },
    create: { name: "Corporate", nameAr: "الشركات" },
    update: {},
  });

  // ── 2. Roles ─────────────────────────────────────────────────────────────────
  const roleMap: Record<string, string> = {};
  for (const rd of ROLES_DEF) {
    const r = await prisma.role.upsert({
      where: { name: rd.name },
      create: rd,
      update: { nameAr: rd.nameAr, isLocked: rd.isLocked },
    });
    roleMap[rd.name] = r.id;
  }

  // ── 3. Permissions ───────────────────────────────────────────────────────────
  const permMap: Record<string, string> = {};
  for (const pd of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { key: pd.key },
      create: pd,
      update: { category: pd.category, description: pd.description, descriptionAr: pd.descriptionAr },
    });
    permMap[pd.key] = p.id;
  }

  // ── 4. Role Permission Matrix ─────────────────────────────────────────────────
  for (const [roleName, grants] of Object.entries(ROLE_MATRIX)) {
    const rId = roleMap[roleName];
    for (const permKey of PERMISSIONS.map((p) => p.key)) {
      const grant = grants[permKey] ?? { granted: false };
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: rId, permissionId: permMap[permKey] } },
        create: {
          roleId:          rId,
          permissionId:    permMap[permKey],
          granted:         grant.granted,
          scope:           grant.scope ?? "ALL",
          isLocked:        grant.isLocked ?? false,
          lockedDirection: grant.lockedDirection ?? null,
        },
        update: {
          granted:         grant.granted,
          scope:           grant.scope ?? "ALL",
          isLocked:        grant.isLocked ?? false,
          lockedDirection: grant.lockedDirection ?? null,
        },
      });
    }
  }

  // ── 5. ReportConfig singleton ────────────────────────────────────────────────
  await prisma.reportConfig.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  // ── 6. Migrate existing users to DB roles ─────────────────────────────────────
  const legacyMapping: Record<string, string> = {
    PARTNER:  "PARTNER",
    ADMIN:    "SYSTEM_ADMIN",
    MANAGER:  "DEPARTMENT_MANAGER",
    EMPLOYEE: "EMPLOYEE",
  };
  for (const [legacyRole, newRoleName] of Object.entries(legacyMapping)) {
    await prisma.user.updateMany({
      where: { role: legacyRole, roleId: null },
      data: {
        roleId:       roleMap[newRoleName],
        departmentId: ["MANAGER", "EMPLOYEE"].includes(legacyRole) ? litigation.id : undefined,
      },
    });
  }

  // ── 6. Migrate existing cases to Litigation department ───────────────────────
  await prisma.case.updateMany({
    where: { departmentId: null },
    data: { departmentId: litigation.id },
  });

  // ── 7. Demo data (fresh DB only) ──────────────────────────────────────────────
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("Existing database — roles/departments/permissions seeded, users/cases migrated.");
    return;
  }

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.conflictCheck.deleteMany();
  await prisma.file.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.workType.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "abdullah@anlawfirm.com",
        name: "Abdullah Al-Aamri",
        nameAr: "عبدالله العامري",
        role: "PARTNER",
        roleId: roleMap["PARTNER"],
      },
    }),
    prisma.user.create({
      data: {
        email: "nawaf@anlawfirm.com",
        name: "Dr. Nawaf Al-Sheikh",
        nameAr: "د.نواف آل الشيخ",
        role: "PARTNER",
        roleId: roleMap["PARTNER"],
      },
    }),
    prisma.user.create({
      data: {
        email: "sara@anlawfirm.com",
        name: "Sara Al-Rashid",
        nameAr: "سارة الراشد",
        role: "ADMIN",
        roleId: roleMap["SYSTEM_ADMIN"],
      },
    }),
    prisma.user.create({
      data: {
        email: "khalid@anlawfirm.com",
        name: "Khalid Al-Dosari",
        nameAr: "خالد الدوسري",
        role: "MANAGER",
        roleId: roleMap["DEPARTMENT_MANAGER"],
        departmentId: corporate.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "fatimah@anlawfirm.com",
        name: "Fatimah Al-Harbi",
        nameAr: "فاطمة الحربي",
        role: "MANAGER",
        roleId: roleMap["DEPARTMENT_MANAGER"],
        departmentId: litigation.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "omar@anlawfirm.com",
        name: "Omar Al-Zahrani",
        nameAr: "عمر الزهراني",
        role: "EMPLOYEE",
        roleId: roleMap["EMPLOYEE"],
        departmentId: corporate.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "noura@anlawfirm.com",
        name: "Noura Al-Ghamdi",
        nameAr: "نورة الغامدي",
        role: "EMPLOYEE",
        roleId: roleMap["EMPLOYEE"],
        departmentId: litigation.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "yousef@anlawfirm.com",
        name: "Yousef Al-Qahtani",
        nameAr: "يوسف القحطاني",
        role: "EMPLOYEE",
        roleId: roleMap["EMPLOYEE"],
        departmentId: corporate.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "reem@anlawfirm.com",
        name: "Reem Al-Mutairi",
        nameAr: "ريم المطيري",
        role: "EMPLOYEE",
        roleId: roleMap["EMPLOYEE"],
        departmentId: litigation.id,
      },
    }),
  ]);

  const [abdullah, _nawaf, sara, khalid, fatimah, omar, noura, yousef, reem] = users;

  const teamCorp = await prisma.team.create({
    data: { name: "Corporate Law", nameAr: "القانون التجاري", managerId: khalid.id },
  });
  const teamLit = await prisma.team.create({
    data: { name: "Litigation", nameAr: "التقاضي", managerId: fatimah.id },
  });

  for (const [id, teamId] of [
    [khalid.id, teamCorp.id], [omar.id, teamCorp.id], [yousef.id, teamCorp.id],
    [fatimah.id, teamLit.id], [noura.id, teamLit.id], [reem.id, teamLit.id],
  ]) {
    await prisma.user.update({ where: { id }, data: { teamId } });
  }

  // Update department managers
  await prisma.department.update({ where: { id: litigation.id }, data: { managerId: fatimah.id } });
  await prisma.department.update({ where: { id: corporate.id }, data: { managerId: khalid.id } });

  const workTypes = await prisma.$transaction([
    prisma.workType.create({ data: { name: "Contract Review",    nameAr: "مراجعة العقود",         description: "Contract review",  descriptionAr: "مراجعة العقود" } }),
    prisma.workType.create({ data: { name: "Litigation",         nameAr: "التقاضي",               description: "Litigation",       descriptionAr: "التقاضي" } }),
    prisma.workType.create({ data: { name: "Legal Consultation", nameAr: "الاستشارة القانونية",   description: "Consultation",     descriptionAr: "استشارة" } }),
    prisma.workType.create({ data: { name: "Court Appearance",   nameAr: "حضور المحكمة",          description: "Court",            descriptionAr: "محكمة" } }),
    prisma.workType.create({ data: { name: "Administrative",     nameAr: "إداري",                 description: "Admin",            descriptionAr: "إداري" } }),
    prisma.workType.create({ data: { name: "Internal Meeting",   nameAr: "اجتماع داخلي",          description: "Meeting",          descriptionAr: "اجتماع" } }),
  ]);

  const clientData = [
    { name: "Saudi Construction Co.",              nameAr: "شركة البناء السعودية",                email: "info@saudiconstruction.sa",  phone: "+966501234567" },
    { name: "Al-Faisal Trading Group",             nameAr: "مجموعة الفيصل التجارية",              email: "contact@alfaisal-trading.com", phone: "+966507654321" },
    { name: "Riyadh Medical Center",               nameAr: "مركز الرياض الطبي",                   email: "legal@riyadhmed.sa",         phone: "+966112223344" },
    { name: "National Logistics Corp",             nameAr: "شركة الخدمات اللوجستية الوطنية",      email: "ops@natlog.sa",              phone: "+966554433221" },
    { name: "Gulf Investment Partners",            nameAr: "شركاء الخليج للاستثمار",              email: "office@gip.sa",              phone: "+966501112233" },
    { name: "Ahmed bin Saleh Al-Otaibi",           nameAr: "أحمد بن صالح العتيبي",                email: "ahmed.otaibi@email.com",     phone: "+966556677889" },
    { name: "Nora Al-Subaie",                      nameAr: "نورة السبيعي",                        email: "nora.subaie@email.com",      phone: "+966558899001" },
    { name: "Tech Valley Solutions",               nameAr: "شركة وادي التقنية",                   email: "legal@techvalley.sa",        phone: "+966114445566" },
    { name: "Al-Jazeera Real Estate",              nameAr: "الجزيرة العقارية",                    email: "info@aljazeera-re.sa",       phone: "+966502223344" },
    { name: "Hassan Mohammed Al-Shehri",           nameAr: "حسن محمد الشهري",                     email: "h.shehri@email.com",         phone: "+966553344556" },
  ];

  const clients = [];
  for (const c of clientData) {
    clients.push(await prisma.client.create({
      data: { ...c, address: "Riyadh, Saudi Arabia", addressAr: "الرياض، المملكة العربية السعودية", notes: "Seed client", notesAr: "عميل تجريبي", createdById: sara.id },
    }));
  }

  const caseTitles = [
    ["Contract dispute — supply agreement",  "نزاع تعاقدي — اتفاق توريد",      "OPEN",   "HIGH"  ],
    ["Consultation — employment policy",      "استشارة — سياسة العمل",           "ACTIVE", "MEDIUM"],
    ["Litigation — commercial claim",         "تقاضي — دعوى تجارية",             "ACTIVE", "URGENT"],
    ["Property lease dispute",                "نزاع عقار إيجار",                 "OPEN",   "MEDIUM"],
    ["Employment termination review",         "مراجعة إنهاء عمل",                "ACTIVE", "LOW"   ],
    ["M&A due diligence",                     "العناية الواجبة للاندماج",         "CLOSED", "HIGH"  ],
    ["Arbitration — construction",            "تحكيم — إنشاءات",                 "ACTIVE", "HIGH"  ],
    ["Trademark opposition",                  "معارضة علامة",                    "OPEN",   "LOW"   ],
    ["Debt recovery",                         "استرداد ديون",                    "ACTIVE", "MEDIUM"],
    ["Regulatory compliance review",          "مراجعة امتثال",                   "OPEN",   "MEDIUM"],
    ["Shareholders dispute",                  "نزاع مساهمين",                    "ACTIVE", "URGENT"],
    ["Insurance claim defense",               "دفاع مطالبة تأمين",               "CLOSED", "MEDIUM"],
    ["Real estate transaction",               "صفقة عقارية",                     "ACTIVE", "LOW"   ],
    ["Labor court representation",            "تمثيل محكمة عمل",                 "OPEN",   "HIGH"  ],
    ["Corporate restructuring advice",        "استشارة إعادة هيكلة",             "ACTIVE", "MEDIUM"],
  ];

  const assignees = [omar, noura, yousef, reem, khalid, fatimah];
  const cases = [];
  for (let i = 0; i < 15; i++) {
    const [t, tAr, status, pri] = caseTitles[i];
    const deptId = i % 2 === 0 ? litigation.id : corporate.id;
    cases.push(await prisma.case.create({
      data: {
        caseNumber:   `AN-2026-${String(i + 1).padStart(4, "0")}`,
        title:        t,
        titleAr:      tAr,
        description:  "Seed case",
        descriptionAr:"قضية تجريبية",
        status,
        priority:     pri,
        openDate:     new Date(2026, 0, 1 + i),
        closeDate:    status === "CLOSED" ? new Date(2026, 1, 1 + i) : null,
        clientId:     clients[i % clients.length].id,
        assignedToId: assignees[i % assignees.length].id,
        createdById:  abdullah.id,
        departmentId: deptId,
      },
    }));
  }

  const taskStatuses = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
  const priorities   = ["LOW",  "MEDIUM",      "HIGH",      "URGENT"    ] as const;
  for (let i = 0; i < 22; i++) {
    const cs  = cases[i % cases.length];
    const due = new Date();
    due.setDate(due.getDate() - 7 + (i % 14));
    await prisma.task.create({
      data: {
        title:        `Task ${i + 1} — follow up`,
        titleAr:      `مهمة ${i + 1} — متابعة`,
        description:  "Seed task",
        descriptionAr:"مهمة تجريبية",
        status:       taskStatuses[i % 4],
        priority:     priorities[i % 4],
        dueDate:      due,
        caseId:       cs.id,
        assignedToId: assignees[i % assignees.length].id,
        createdById:  sara.id,
        completedAt:  taskStatuses[i % 4] === "COMPLETED" ? new Date() : null,
      },
    });
  }

  const dayMs    = 86400000;
  const baseDate = Date.now() - 28 * dayMs;
  for (let i = 0; i < 35; i++) {
    const cs  = cases[i % cases.length];
    const cl  = clients.find((c) => c.id === cs.clientId)!;
    const usr = assignees[i % assignees.length];
    const wt  = workTypes[i % workTypes.length];
    await prisma.workLog.create({
      data: {
        userId:      usr.id,
        clientId:    cl.id,
        caseId:      cs.id,
        workTypeId:  wt.id,
        hours:       Math.round((0.5 + (i % 5) * 0.1) * 10) / 10,
        isBillable:  i % 4 !== 0,
        date:        new Date(baseDate + i * dayMs),
        notes:       "Seed work log",
        notesAr:     "سجل عمل تجريبي",
        isApproved:  i % 3 === 0,
        approvedById:i % 3 === 0 ? khalid.id : null,
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      { userId: omar.id,  title: "New task assigned", titleAr: "تم تعيين مهمة جديدة", message: "You have a new task", messageAr: "لديك مهمة جديدة", type: "TASK_ASSIGNED",    link: "/tasks" },
      { userId: noura.id, title: "Deadline reminder",  titleAr: "تذكير بالموعد",      message: "A task is due soon",  messageAr: "مهمة تستحق قريباً", type: "DEADLINE_REMINDER", link: "/tasks" },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: sara.id,     action: "CREATE", entityType: "Client", entityId: clients[0].id, details: JSON.stringify({ name: clients[0].name }), category: "matter" },
      { userId: abdullah.id, action: "UPDATE", entityType: "Case",   entityId: cases[0].id,   details: JSON.stringify({ status: "OPEN" }),        category: "matter" },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
