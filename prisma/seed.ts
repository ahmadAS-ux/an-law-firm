import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
      },
    }),
    prisma.user.create({
      data: {
        email: "nawaf@anlawfirm.com",
        name: "Dr. Nawaf Al-Sheikh",
        nameAr: "د.نواف آل الشيخ",
        role: "PARTNER",
      },
    }),
    prisma.user.create({
      data: {
        email: "sara@anlawfirm.com",
        name: "Sara Al-Rashid",
        nameAr: "سارة الراشد",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        email: "khalid@anlawfirm.com",
        name: "Khalid Al-Dosari",
        nameAr: "خالد الدوسري",
        role: "MANAGER",
      },
    }),
    prisma.user.create({
      data: {
        email: "fatimah@anlawfirm.com",
        name: "Fatimah Al-Harbi",
        nameAr: "فاطمة الحربي",
        role: "MANAGER",
      },
    }),
    prisma.user.create({
      data: {
        email: "omar@anlawfirm.com",
        name: "Omar Al-Zahrani",
        nameAr: "عمر الزهراني",
        role: "EMPLOYEE",
      },
    }),
    prisma.user.create({
      data: {
        email: "noura@anlawfirm.com",
        name: "Noura Al-Ghamdi",
        nameAr: "نورة الغامدي",
        role: "EMPLOYEE",
      },
    }),
    prisma.user.create({
      data: {
        email: "yousef@anlawfirm.com",
        name: "Yousef Al-Qahtani",
        nameAr: "يوسف القحطاني",
        role: "EMPLOYEE",
      },
    }),
    prisma.user.create({
      data: {
        email: "reem@anlawfirm.com",
        name: "Reem Al-Mutairi",
        nameAr: "ريم المطيري",
        role: "EMPLOYEE",
      },
    }),
  ]);

  const [abdullah, _nawaf, sara, khalid, fatimah, omar, noura, yousef, reem] =
    users;

  const teamCorp = await prisma.team.create({
    data: {
      name: "Corporate Law",
      nameAr: "القانون التجاري",
      managerId: khalid.id,
    },
  });
  const teamLit = await prisma.team.create({
    data: {
      name: "Litigation",
      nameAr: "التقاضي",
      managerId: fatimah.id,
    },
  });

  await prisma.user.update({
    where: { id: khalid.id },
    data: { teamId: teamCorp.id },
  });
  await prisma.user.update({
    where: { id: fatimah.id },
    data: { teamId: teamLit.id },
  });
  await prisma.user.update({
    where: { id: omar.id },
    data: { teamId: teamCorp.id },
  });
  await prisma.user.update({
    where: { id: yousef.id },
    data: { teamId: teamCorp.id },
  });
  await prisma.user.update({
    where: { id: noura.id },
    data: { teamId: teamLit.id },
  });
  await prisma.user.update({
    where: { id: reem.id },
    data: { teamId: teamLit.id },
  });

  const workTypes = await prisma.$transaction([
    prisma.workType.create({
      data: {
        name: "Contract Review",
        nameAr: "مراجعة العقود",
        description: "Contract review",
        descriptionAr: "مراجعة العقود",
      },
    }),
    prisma.workType.create({
      data: {
        name: "Litigation",
        nameAr: "التقاضي",
        description: "Litigation",
        descriptionAr: "التقاضي",
      },
    }),
    prisma.workType.create({
      data: {
        name: "Legal Consultation",
        nameAr: "الاستشارة القانونية",
        description: "Consultation",
        descriptionAr: "استشارة",
      },
    }),
    prisma.workType.create({
      data: {
        name: "Court Appearance",
        nameAr: "حضور المحكمة",
        description: "Court",
        descriptionAr: "محكمة",
      },
    }),
    prisma.workType.create({
      data: {
        name: "Administrative",
        nameAr: "إداري",
        description: "Admin",
        descriptionAr: "إداري",
      },
    }),
    prisma.workType.create({
      data: {
        name: "Internal Meeting",
        nameAr: "اجتماع داخلي",
        description: "Meeting",
        descriptionAr: "اجتماع",
      },
    }),
  ]);

  const clientData = [
    {
      name: "Saudi Construction Co.",
      nameAr: "شركة البناء السعودية",
      email: "info@saudiconstruction.sa",
      phone: "+966501234567",
    },
    {
      name: "Al-Faisal Trading Group",
      nameAr: "مجموعة الفيصل التجارية",
      email: "contact@alfaisal-trading.com",
      phone: "+966507654321",
    },
    {
      name: "Riyadh Medical Center",
      nameAr: "مركز الرياض الطبي",
      email: "legal@riyadhmed.sa",
      phone: "+966112223344",
    },
    {
      name: "National Logistics Corp",
      nameAr: "شركة الخدمات اللوجستية الوطنية",
      email: "ops@natlog.sa",
      phone: "+966554433221",
    },
    {
      name: "Gulf Investment Partners",
      nameAr: "شركاء الخليج للاستثمار",
      email: "office@gip.sa",
      phone: "+966501112233",
    },
    {
      name: "Ahmed bin Saleh Al-Otaibi",
      nameAr: "أحمد بن صالح العتيبي",
      email: "ahmed.otaibi@email.com",
      phone: "+966556677889",
    },
    {
      name: "Nora Al-Subaie",
      nameAr: "نورة السبيعي",
      email: "nora.subaie@email.com",
      phone: "+966558899001",
    },
    {
      name: "Tech Valley Solutions",
      nameAr: "شركة وادي التقنية",
      email: "legal@techvalley.sa",
      phone: "+966114445566",
    },
    {
      name: "Al-Jazeera Real Estate",
      nameAr: "الجزيرة العقارية",
      email: "info@aljazeera-re.sa",
      phone: "+966502223344",
    },
    {
      name: "Hassan Mohammed Al-Shehri",
      nameAr: "حسن محمد الشهري",
      email: "h.shehri@email.com",
      phone: "+966553344556",
    },
  ];

  const clients = [];
  for (const c of clientData) {
    clients.push(
      await prisma.client.create({
        data: {
          ...c,
          address: "Riyadh, Saudi Arabia",
          addressAr: "الرياض، المملكة العربية السعودية",
          notes: "Seed client",
          notesAr: "عميل تجريبي",
          createdById: sara.id,
        },
      }),
    );
  }

  const caseTitles = [
    ["Contract dispute — supply agreement", "نزاع تعاقدي — اتفاق توريد", "OPEN", "HIGH"],
    ["Consultation — employment policy", "استشارة — سياسة العمل", "ACTIVE", "MEDIUM"],
    ["Litigation — commercial claim", "تقاضي — دعوى تجارية", "ACTIVE", "URGENT"],
    ["Property lease dispute", "نزاع عقار إيجار", "OPEN", "MEDIUM"],
    ["Employment termination review", "مراجعة إنهاء عمل", "ACTIVE", "LOW"],
    ["M&A due diligence", "العناية الواجبة للاندماج", "CLOSED", "HIGH"],
    ["Arbitration — construction", "تحكيم — إنشاءات", "ACTIVE", "HIGH"],
    ["Trademark opposition", "معارضة علامة", "OPEN", "LOW"],
    ["Debt recovery", "استرداد ديون", "ACTIVE", "MEDIUM"],
    ["Regulatory compliance review", "مراجعة امتثال", "OPEN", "MEDIUM"],
    ["Shareholders dispute", "نزاع مساهمين", "ACTIVE", "URGENT"],
    ["Insurance claim defense", "دفاع مطالبة تأمين", "CLOSED", "MEDIUM"],
    ["Real estate transaction", "صفقة عقارية", "ACTIVE", "LOW"],
    ["Labor court representation", "تمثيل محكمة عمل", "OPEN", "HIGH"],
    ["Corporate restructuring advice", "استشارة إعادة هيكلة", "ACTIVE", "MEDIUM"],
  ];

  const assignees = [omar, noura, yousef, reem, khalid, fatimah];
  const cases = [];
  for (let i = 0; i < 15; i++) {
    const [t, tAr, status, pri] = caseTitles[i];
    const cn = `AN-2026-${String(i + 1).padStart(4, "0")}`;
    const cl = clients[i % clients.length];
    const asg = assignees[i % assignees.length];
    cases.push(
      await prisma.case.create({
        data: {
          caseNumber: cn,
          title: t,
          titleAr: tAr,
          description: "Seed case",
          descriptionAr: "قضية تجريبية",
          status,
          priority: pri,
          openDate: new Date(2026, 0, 1 + i),
          closeDate: status === "CLOSED" ? new Date(2026, 1, 1 + i) : null,
          clientId: cl.id,
          assignedToId: asg.id,
          createdById: abdullah.id,
        },
      }),
    );
  }

  const taskStatuses = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
  for (let i = 0; i < 22; i++) {
    const cs = cases[i % cases.length];
    const assignee = assignees[i % assignees.length];
    const due = new Date();
    due.setDate(due.getDate() - 7 + (i % 14));
    await prisma.task.create({
      data: {
        title: `Task ${i + 1} — follow up`,
        titleAr: `مهمة ${i + 1} — متابعة`,
        description: "Seed task",
        descriptionAr: "مهمة تجريبية",
        status: taskStatuses[i % 4],
        priority: priorities[i % 4],
        dueDate: due,
        caseId: cs.id,
        assignedToId: assignee.id,
        createdById: sara.id,
        completedAt: taskStatuses[i % 4] === "COMPLETED" ? new Date() : null,
      },
    });
  }

  const dayMs = 86400000;
  const baseDate = Date.now() - 28 * dayMs;
  for (let i = 0; i < 35; i++) {
    const cs = cases[i % cases.length];
    const cl = clients.find((c) => c.id === cs.clientId)!;
    const usr = assignees[i % assignees.length];
    const wt = workTypes[i % workTypes.length];
    const d = new Date(baseDate + i * dayMs);
    await prisma.workLog.create({
      data: {
        userId: usr.id,
        clientId: cl.id,
        caseId: cs.id,
        workTypeId: wt.id,
        hours: 0.5 + (i % 5) * 0.25,
        isBillable: i % 4 !== 0,
        date: d,
        notes: "Seed work log",
        notesAr: "سجل عمل تجريبي",
        isApproved: i % 3 === 0,
        approvedById: i % 3 === 0 ? khalid.id : null,
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: omar.id,
        title: "New task assigned",
        titleAr: "تم تعيين مهمة جديدة",
        message: "You have a new task",
        messageAr: "لديك مهمة جديدة",
        type: "TASK_ASSIGNED",
        link: "/tasks",
      },
      {
        userId: noura.id,
        title: "Deadline reminder",
        titleAr: "تذكير بالموعد",
        message: "A task is due soon",
        messageAr: "مهمة تستحق قريباً",
        type: "DEADLINE_REMINDER",
        link: "/tasks",
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: sara.id,
        action: "CREATE",
        entityType: "Client",
        entityId: clients[0].id,
        details: JSON.stringify({ name: clients[0].name }),
      },
      {
        userId: abdullah.id,
        action: "UPDATE",
        entityType: "Case",
        entityId: cases[0].id,
        details: JSON.stringify({ status: "OPEN" }),
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
