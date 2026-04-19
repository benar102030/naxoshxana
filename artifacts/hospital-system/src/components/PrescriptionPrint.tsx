import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/i18n";

/**
 * کامپۆنێنتی چاپکردنی ڕەچەتەی پزیشکی (Prescription Print)
 * ئەمەیە یەکێک لە گرنگترین دۆکیومێنتەکانی نەخۆشخانە کە ئیمضا و مۆرکردنی پزیشک پێویستە
 * و دروست دەکرێت بۆ دانی نەخۆشی و چوونەناو دەرمانخانەوە
 */
interface PrescriptionPrintProps {
  prescription: {
    id: number;
    patientName: string;
    doctorName: string;
    medicationName: string;
    dosage: string;
    duration: string;
    notes?: string;
    createdAt: string;
  };
  hospitalName?: string;
}

export function PrescriptionPrint({ prescription, hospitalName = "BMESHY" }: PrescriptionPrintProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ckb">
      <head>
        <meta charset="UTF-8" />
        <title>ڕەچەتەی پزیشکی - ${prescription.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            direction: rtl;
            padding: 40px;
            color: #1a1a2e;
            font-size: 14px;
            line-height: 1.8;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #1a5276;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .hospital-name { font-size: 28px; font-weight: 900; color: #1a5276; letter-spacing: 2px; }
          .hospital-sub { font-size: 11px; color: #888; margin-top: 4px; }
          .rx-badge {
            font-size: 48px; font-weight: 900;
            color: #1a5276; opacity: 0.15;
            font-family: serif;
          }
          .patient-box {
            background: #eaf4fb;
            border-right: 4px solid #1a5276;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .patient-box .label { font-size: 11px; color: #666; }
          .patient-box .value { font-size: 14px; font-weight: 700; color: #1a1a2e; }
          .med-section {
            border: 2px solid #1a5276;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .med-title { font-size: 16px; font-weight: 700; color: #1a5276; margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
          .med-name { font-size: 22px; font-weight: 900; color: #1a1a2e; margin-bottom: 12px; }
          .med-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .med-item .label { font-size: 11px; color: #666; }
          .med-item .value { font-size: 15px; font-weight: 700; }
          .notes-box {
            background: #fef9e7;
            border: 1px dashed #f0b429;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 25px;
          }
          .notes-title { font-size: 12px; color: #e6a817; font-weight: 700; margin-bottom: 6px; }
          .footer {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          .sig-box { text-align: center; }
          .sig-line { border-bottom: 1px solid #333; margin-bottom: 8px; height: 60px; }
          .sig-label { font-size: 12px; color: #666; }
          .validity { text-align: center; font-size: 11px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="hospital-name">${hospitalName}</div>
            <div class="hospital-sub">سیستەمی بەڕێوەبردنی نەخۆشخانە | Hospital Management System</div>
            <div class="hospital-sub">بەروار: ${formatDateTime(prescription.createdAt)}</div>
          </div>
          <div class="rx-badge">℞</div>
        </div>

        <div class="patient-box">
          <div>
            <div class="label">ناوی نەخۆش</div>
            <div class="value">${prescription.patientName}</div>
          </div>
          <div>
            <div class="label">پزیشکی تایبەت</div>
            <div class="value">د. ${prescription.doctorName}</div>
          </div>
          <div>
            <div class="label">ژمارەی ڕەچەتە</div>
            <div class="value">RX-${prescription.id.toString().padStart(6, '0')}</div>
          </div>
          <div>
            <div class="label">بەروار</div>
            <div class="value">${new Date(prescription.createdAt).toLocaleDateString('ar-IQ')}</div>
          </div>
        </div>

        <div class="med-section">
          <div class="med-title">🔬 دەرمانی دەرکراو</div>
          <div class="med-name">${prescription.medicationName}</div>
          <div class="med-grid">
            <div class="med-item">
              <div class="label">دۆز (Dosage)</div>
              <div class="value">${prescription.dosage}</div>
            </div>
            <div class="med-item">
              <div class="label">ماوەی بەکارهێنان</div>
              <div class="value">${prescription.duration}</div>
            </div>
          </div>
        </div>

        ${prescription.notes ? `
        <div class="notes-box">
          <div class="notes-title">⚠️ تێبینی تایبەتی پزیشک</div>
          <div>${prescription.notes}</div>
        </div>` : ""}

        <div class="footer">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-label">واژۆی پزیشک — د. ${prescription.doctorName}</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-label">مۆری نەخۆشخانە</div>
          </div>
        </div>
        <div class="validity">ئەم ڕەچەتەیە تەنها ٧ ڕۆژ کارایییەتی هەیە لە بەرواری دەرکردنەوه</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      <Printer className="w-4 h-4" />
      چاپکردنی ڕەچەتە
    </Button>
  );
}
