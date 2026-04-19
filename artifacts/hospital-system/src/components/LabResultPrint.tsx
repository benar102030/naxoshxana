import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/i18n";

/**
 * چاپکردنی ئەنجامی تاقیگە (Lab Result Print)
 * ئەمەیە دۆکیومێنتی فەرمی نەخۆشخانە کە ئەنجامی پشکنینی خوێن یان تر تێدایە
 */
interface LabPrintProps {
  test: {
    id: number;
    patientName: string;
    testName: string;
    category: string;
    result?: string | null;
    referenceRange?: string | null;
    status: string;
    requestedAt: string;
    doctorName?: string;
  };
  hospitalName?: string;
}

export function LabResultPrint({ test, hospitalName = "BMESHY" }: LabPrintProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=850,height=700");
    if (!printWindow) return;

    const statusText: Record<string, string> = {
      pending: "چاوەڕوانی ئەنجام",
      completed: "تەواوبووە",
      cancelled: "هەڵوەشایەوە",
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ckb">
      <head>
        <meta charset="UTF-8" />
        <title>ئەنجامی تاقیگە - ${test.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            direction: rtl;
            padding: 40px;
            color: #1a1a2e;
            font-size: 13px;
            line-height: 1.9;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 18px;
            border-bottom: 3px double #1a5276;
            margin-bottom: 24px;
          }
          .logo { font-size: 30px; font-weight: 900; color: #1a5276; letter-spacing: 3px; }
          .meta { text-align: left; font-size: 11px; color: #888; line-height: 1.6; }
          .badge {
            display: inline-block;
            background: #1a5276;
            color: white;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
          }
          .section {
            background: #f0f6fc;
            border-right: 4px solid #1a5276;
            padding: 14px 18px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .field-label { font-size: 10px; color: #888; margin-bottom: 2px; }
          .field-value { font-size: 14px; font-weight: 700; }
          .result-box {
            border: 2px solid #1a5276;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          .result-header {
            background: #1a5276;
            color: white;
            padding: 10px 18px;
            font-weight: 700;
            font-size: 14px;
          }
          .result-body { padding: 18px; }
          .result-value { font-size: 24px; font-weight: 900; color: #1a5276; margin-bottom: 8px; }
          .ref-range { font-size: 11px; color: #888; background: #f5f5f5; padding: 6px 10px; border-radius: 4px; }
          .footer-sig {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            text-align: center;
          }
          .sig-line { border-bottom: 1px solid #555; height: 50px; margin-bottom: 6px; }
          .sig-label { font-size: 11px; color: #666; }
          .watermark { text-align: center; color: #ccc; font-size: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🔬 ${hospitalName}</div>
            <div style="font-size:11px; color:#666; margin-top:4px">
              بەشی تاقیگەی نەخۆشخانە | Laboratory Department
            </div>
          </div>
          <div class="meta">
            <div>ژمارەی پشکنین: <strong>LAB-${test.id.toString().padStart(6, '0')}</strong></div>
            <div>بەروار: ${new Date(test.requestedAt).toLocaleDateString('ar-IQ')}</div>
            <div>کات: ${new Date(test.requestedAt).toLocaleTimeString('ar-IQ')}</div>
            <div style="margin-top:5px"><span class="badge">${statusText[test.status] ?? test.status}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="grid-2">
            <div>
              <div class="field-label">ناوی نەخۆش</div>
              <div class="field-value">${test.patientName}</div>
            </div>
            <div>
              <div class="field-label">داواکاری پزیشک</div>
              <div class="field-value">${test.doctorName ? 'د. ' + test.doctorName : '—'}</div>
            </div>
            <div>
              <div class="field-label">جۆری پشکنین</div>
              <div class="field-value">${test.testName}</div>
            </div>
            <div>
              <div class="field-label">بەش</div>
              <div class="field-value">${test.category}</div>
            </div>
          </div>
        </div>

        <div class="result-box">
          <div class="result-header">📊 ئەنجامی پشکنین</div>
          <div class="result-body">
            ${test.result ? `
              <div class="result-value">${test.result}</div>
              ${test.referenceRange ? `
                <div class="ref-range">
                  ⚖️ ئاستی نەرمال (Reference Range): ${test.referenceRange}
                </div>` : ''}
            ` : `
              <div style="color:#aaa; font-style:italic; padding: 10px 0;">
                ئەنجامی پشکنین هێشتا تۆمارنەکراوە
              </div>
            `}
          </div>
        </div>

        <div class="footer-sig">
          <div>
            <div class="sig-line"></div>
            <div class="sig-label">ئیمزای تەکنیسیەن</div>
          </div>
          <div>
            <div class="sig-line"></div>
            <div class="sig-label">مۆری بەشی تاقیگە</div>
          </div>
        </div>
        <div class="watermark">
          ${hospitalName} Hospital Management System — ئەم دۆکیومێنتە دارایی و یاساییە
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (test.status !== "completed") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs"
    >
      <Printer className="w-3.5 h-3.5" />
      چاپ
    </Button>
  );
}
