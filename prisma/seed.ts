import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Cairo University database...");

  // 1. Clear existing database data to avoid unique constraint key violations
  await prisma.navigationEdge.deleteMany();
  await prisma.navigationNode.deleteMany();
  await prisma.place.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.admin.deleteMany();

  // 2. Seed Administrator credentials (login username: admin, password: admin123)
  await prisma.admin.create({
    data: {
      username: "admin",
      passwordHash: "$2a$10$XmFhL56m1234567890abcdef.abcdefghijklmnopqrstuvwxyza", // bcrypt mock hash representation
    },
  });

  console.log("Admin account seeded.");

  // 3. Seed the 11 official Cairo University buildings
  const placesData = [
    {
      id: "main-hall",
      nameEn: "Main Hall",
      nameAr: "القاعة الرئيسية",
      displayNameAr: "القاعة الرئيسية",
      type: "LANDMARK",
      latitude: 30.027340,
      longitude: 31.208647,
      descriptionEn: "Cairo University grand historical main assembly dome hall.",
      descriptionAr: "القاعة الكبرى التاريخية للاحتفالات بجامعة القاهرة تحت القبة.",
      aliases: "القاعة الرئيسية,القاعة,Main Hall,Main Auditorium,قاعة رئيسية"
    },
    {
      id: "supreme-council",
      nameEn: "Supreme Council of Universities",
      nameAr: "المجلس الأعلى للجامعات",
      displayNameAr: "المجلس الأعلى للجامعات",
      type: "OFFICE",
      latitude: 30.026785,
      longitude: 31.208653,
      descriptionEn: "Administration headquarters of the Egyptian Supreme Council of Universities.",
      descriptionAr: "المقر الإداري للمجلس الأعلى للجامعات المصرية.",
      aliases: "المجلس الأعلى للجامعات,المجلس,Supreme Council,SCU,Council"
    },
    {
      id: "faculty-law",
      nameEn: "Faculty of Law",
      nameAr: "كلية الحقوق",
      displayNameAr: "كلية الحقوق",
      type: "FACULTY_BUILDING",
      latitude: 30.026817,
      longitude: 31.209852,
      descriptionEn: "The historical faculty where many Egyptian statesmen and leaders graduated.",
      descriptionAr: "كلية الحقوق التاريخية بجامعة القاهرة العريقة.",
      aliases: "كلية الحقوق,حقوق,Faculty of Law,Law,Law Faculty"
    },
    {
      id: "faculty-feps",
      nameEn: "Faculty of Economics and Political Science",
      nameAr: "كلية الاقتصاد والعلوم السياسية",
      displayNameAr: "اقتصاد وعلوم سياسية",
      type: "FACULTY_BUILDING",
      latitude: 30.028552,
      longitude: 31.207285,
      descriptionEn: "Cairo University Faculty of Economics and Political Science (FEPS).",
      descriptionAr: "كلية الاقتصاد والعلوم السياسية بجامعة القاهرة (اقتصاد وعلوم سياسية).",
      aliases: "كلية الاقتصاد والعلوم السياسية,اقتصاد,سياسة واقتصاد,اقتصاد وعلوم سياسية,Faculty of Economics,Political Science,Economics,FEPS"
    },
    {
      id: "faculty-science-physics",
      nameEn: "Faculty of Science - Physics Departments",
      nameAr: "كلية العلوم - أقسام الفيزياء والجيوفيزياء والبيوفيزياء",
      displayNameAr: "كلية العلوم (الفيزياء)",
      type: "FACULTY_BUILDING",
      latitude: 30.026016,
      longitude: 31.207639,
      descriptionEn: "Science departments of Physics, Geophysics, and Biophysics.",
      descriptionAr: "أقسام الفيزياء والجيوفيزياء والبيوفيزياء بكلية العلوم.",
      aliases: "كلية العلوم,علوم,الفيزياء,جيوفيزياء,بيوفيزياء,Science,Faculty of Science,Physics,Geophysics,Biophysics"
    },
    {
      id: "faculty-science-geology",
      nameEn: "Faculty of Science - Geology Department",
      nameAr: "كلية العلوم - قسم الجيولوجيا",
      displayNameAr: "جيولوجيا",
      type: "FACULTY_BUILDING",
      latitude: 30.025842,
      longitude: 31.206810,
      descriptionEn: "Science department of Geology and Earth studies.",
      descriptionAr: "قسم الجيولوجيا وعلوم الأرض بكلية العلوم.",
      aliases: "جيولوجيا,قسم الجيولوجيا,كلية العلوم,Geology,Science,Faculty of Science"
    },
    {
      id: "printing-house",
      nameEn: "Cairo University Printing House",
      nameAr: "مطبعة جامعة القاهرة",
      displayNameAr: "مطبعة الجامعة",
      type: "SERVICE",
      latitude: 30.025965,
      longitude: 31.206072,
      descriptionEn: "Official printing and publishing press of Cairo University.",
      descriptionAr: "المطبعة الرسمية ودار النشر الخاصة بجامعة القاهرة.",
      aliases: "مطبعة,مطبعة الجامعة,مطبعة جامعة القاهرة,Printing House,Printing"
    },
    {
      id: "university-mosque",
      nameEn: "Cairo University Mosque",
      nameAr: "مسجد جامعة القاهرة",
      displayNameAr: "مسجد الجامعة",
      type: "LANDMARK",
      latitude: 30.026720,
      longitude: 31.205093,
      descriptionEn: "Grand campus congregational mosque for student prayers.",
      descriptionAr: "مسجد جامعة القاهرة الكبير لإقامة الصلوات والجمعة.",
      aliases: "مسجد,مسجد الجامعة,مسجد جامعة القاهرة,Mosque,University Mosque"
    },
    {
      id: "faculty-dar-al-uloom",
      nameEn: "Faculty of Dar Al-Uloom",
      nameAr: "كلية دار العلوم",
      displayNameAr: "دار العلوم",
      type: "FACULTY_BUILDING",
      latitude: 30.025784,
      longitude: 31.202910,
      descriptionEn: "Cairo University Faculty of Dar Al-Uloom specializing in Arabic literature and Islamic studies.",
      descriptionAr: "كلية دار العلوم المتخصصة في اللغة العربية والعلوم الإسلامية.",
      aliases: "دار العلوم,كلية دار العلوم,Dar Al-Uloom,Dar Al Uloom"
    },
    {
      id: "faculty-mass-comm",
      nameEn: "Faculty of Mass Communication",
      nameAr: "كلية الإعلام",
      displayNameAr: "الإعلام",
      type: "FACULTY_BUILDING",
      latitude: 30.026186,
      longitude: 31.202078,
      descriptionEn: "Faculty of Mass Communication training journalists and media professionals.",
      descriptionAr: "كلية الإعلام لإعداد وتدريب الإعلاميين والصحفيين.",
      aliases: "كلية الإعلام,الإعلام,اعلام,Media,Mass Communication,Faculty of Media"
    },
    {
      id: "faculty-urban-planning",
      nameEn: "Faculty of Urban and Regional Planning",
      nameAr: "كلية التخطيط العمراني والإقليمي",
      displayNameAr: "التخطيط العمراني",
      type: "FACULTY_BUILDING",
      latitude: 30.026743,
      longitude: 31.203009,
      descriptionEn: "Cairo University Faculty of Urban and Regional Planning.",
      descriptionAr: "كلية التخطيط العمراني والإقليمي بجامعة القاهرة.",
      aliases: "كلية التخطيط العمراني والإقليمي,تخطيط,تخطيط عمراني,Urban Planning,Regional Planning,Planning"
    }
  ];

  for (const place of placesData) {
    await prisma.place.create({
      data: place
    });
  }

  console.log("11 Initial Giza campus buildings seeded successfully.");

  // 4. Seed dynamic navigation graph nodes (Close to Giza gates and Clock Tower coordinates)
  await prisma.navigationNode.createMany({
    data: [
      { id: "node-gate-1", name: "Main Gate (Gate 1) Intersection", latitude: 30.0277, longitude: 31.2098 },
      { id: "node-clock-tower", name: "Giza Campus Clock Tower Hub", latitude: 30.0275, longitude: 31.2085 },
      { id: "node-main-hall", name: "Main Dome Hall Entry", latitude: 30.027340, longitude: 31.208647 },
      { id: "node-scu", name: "Supreme Council Entry Pathway", latitude: 30.026785, longitude: 31.208653 },
      { id: "node-law", name: "Law Faculty Gateway", latitude: 30.026817, longitude: 31.209852 },
      { id: "node-feps", name: "FEPS Faculty Pathway", latitude: 30.028552, longitude: 31.207285 },
      { id: "node-science-physics", name: "Physics Science Pathway", latitude: 30.026337, longitude: 31.207730 },
      { id: "node-science-geology", name: "Geology Science Pathway", latitude: 30.025842, longitude: 31.206810 },
      { id: "node-printing", name: "Printing House Access Road", latitude: 30.025965, longitude: 31.206072 },
      { id: "node-mosque", name: "University Mosque Square", latitude: 30.026720, longitude: 31.205093 },
      { id: "node-dar-al-uloom", name: "Dar Al-Uloom Intersection", latitude: 30.025784, longitude: 31.202910 },
      { id: "node-media", name: "Mass Communication Gateway", latitude: 30.026186, longitude: 31.202078 },
      { id: "node-urban", name: "Urban Planning Intersection", latitude: 30.026743, longitude: 31.203009 },
    ],
  });

  // 5. Seed navigation edges linking the nodes
  await prisma.navigationEdge.createMany({
    data: [
      { id: "e1", sourceId: "node-gate-1", targetId: "node-clock-tower", distance: 130 },
      { id: "e1-rev", sourceId: "node-clock-tower", targetId: "node-gate-1", distance: 130 },

      { id: "e2", sourceId: "node-gate-1", targetId: "node-law", distance: 100 },
      { id: "e2-rev", sourceId: "node-law", targetId: "node-gate-1", distance: 100 },

      { id: "e3", sourceId: "node-clock-tower", targetId: "node-main-hall", distance: 30 },
      { id: "e3-rev", sourceId: "node-main-hall", targetId: "node-clock-tower", distance: 30 },

      { id: "e4", sourceId: "node-main-hall", targetId: "node-scu", distance: 65 },
      { id: "e4-rev", sourceId: "node-scu", targetId: "node-main-hall", distance: 65 },

      { id: "e5", sourceId: "node-clock-tower", targetId: "node-feps", distance: 170 },
      { id: "e5-rev", sourceId: "node-feps", targetId: "node-clock-tower", distance: 170 },

      { id: "e6", sourceId: "node-scu", targetId: "node-science-physics", distance: 90 },
      { id: "e6-rev", sourceId: "node-science-physics", targetId: "node-scu", distance: 90 },

      { id: "e7", sourceId: "node-science-physics", targetId: "node-science-geology", distance: 100 },
      { id: "e7-rev", sourceId: "node-science-geology", targetId: "node-science-physics", distance: 100 },

      { id: "e8", sourceId: "node-science-geology", targetId: "node-printing", distance: 75 },
      { id: "e8-rev", sourceId: "node-printing", targetId: "node-science-geology", distance: 75 },

      { id: "e9", sourceId: "node-printing", targetId: "node-mosque", distance: 130 },
      { id: "e9-rev", sourceId: "node-mosque", targetId: "node-printing", distance: 130 },

      { id: "e10", sourceId: "node-mosque", targetId: "node-urban", distance: 190 },
      { id: "e10-rev", sourceId: "node-urban", targetId: "node-mosque", distance: 190 },

      { id: "e11", sourceId: "node-urban", targetId: "node-dar-al-uloom", distance: 110 },
      { id: "e11-rev", sourceId: "node-dar-al-uloom", targetId: "node-urban", distance: 110 },

      { id: "e12", sourceId: "node-dar-al-uloom", targetId: "node-media", distance: 95 },
      { id: "e12-rev", sourceId: "node-media", targetId: "node-dar-al-uloom", distance: 95 },
    ],
  });

  console.log("Shortest path navigation segments seeded.");
  console.log("Database seed complete successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
