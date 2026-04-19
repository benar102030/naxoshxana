import { db, vitalsTable, notificationsTable, patientsTable, staffTable } from "../lib/db/src/index";

async function seed() {
  console.log("Seeding advanced features...");

  // وەرگرتنی یەکەم نەخۆش و یەکەم کارمەند
  const patients = await db.select().from(patientsTable).limit(1);
  const staff = await db.select().from(staffTable).limit(1);

  if (patients.length > 0 && staff.length > 0) {
    const patientId = patients[0].id;
    const staffId = staff[0].id;

    // زیادکردنی مێژووی نیشانە سەرەکییەکان (٥ ڕۆژی کۆتایی)
    const vitalsData = [
      { patientId, heartRate: 72, bloodPressure: "120/80", temperature: 36.6, spO2: 98, respiratoryRate: 16, recordedBy: staffId, recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { patientId, heartRate: 75, bloodPressure: "125/82", temperature: 36.8, spO2: 97, respiratoryRate: 17, recordedBy: staffId, recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { patientId, heartRate: 85, bloodPressure: "135/90", temperature: 38.2, spO2: 95, respiratoryRate: 20, recordedBy: staffId, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { patientId, heartRate: 80, bloodPressure: "130/85", temperature: 37.5, spO2: 96, respiratoryRate: 18, recordedBy: staffId, recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { patientId, heartRate: 72, bloodPressure: "120/80", temperature: 36.6, spO2: 99, respiratoryRate: 16, recordedBy: staffId, recordedAt: new Date() },
    ];

    await db.insert(vitalsTable).values(vitalsData);

    // زیادکردنی ئاگادارکردنەوەکان
    await db.insert(notificationsTable).values([
      { staffId, title: "ئەنجامی تاقیگە", message: "ئەنجامی پشکنینی خوێنی نەخۆش ئامادەیە.", type: "info" },
      { title: "کەمی دەرمان", message: "دەرمانی Paracetamol لە کۆگا بەرەو تەواوبوون دەچێت.", type: "warning" },
      { staffId, title: "باری نائاسایی", message: "نەخۆشێک پشکنینی پزیشکی بە خێرایی دەوێت لە بەشی فریاگوزاری.", type: "critical" },
    ]);

    console.log("Seed successful!");
  } else {
    console.log("No patients or staff found to seed vitals/notifications.");
  }
}

seed().catch(console.error);
