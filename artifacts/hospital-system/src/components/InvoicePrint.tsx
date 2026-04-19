import { formatCurrency, formatDateTime } from "@/lib/i18n";

/**
 * پێکهاتەی پرنتکردنی پسوولە (Official Receipt)
 * ئەم بەشە دیزاین کراوە بۆ ئەوەی لە کاتی پرنتکردندا وەک پسوولەیەکی فەرمی دەربکەوێت
 */
export function InvoicePrint({ invoice }: { invoice: any }) {
  return (
    <div className="p-12 max-w-4xl mx-auto bg-white text-black print:p-8" id="invoice-print">
      {/* سەرپەڕەی پسوولە - براندینگ */}
      <div className="flex justify-between items-center border-b-4 border-primary pb-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            H+
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">نەخۆشخانەی کوردی پڕۆ</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">پسوولەی دارایی فەرمی (Official Financial Receipt)</p>
          </div>
        </div>
        <div className="text-left">
          <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block">
            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-700">INVOICE</h2>
            <p className="text-sm font-mono mt-1 font-bold text-primary">#{invoice.id.toString().padStart(6, '0')}</p>
          </div>
        </div>
      </div>

      {/* زانیارییە سەرەکییەکان */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs uppercase font-black text-gray-400 mb-2 border-b pb-1">زانیاری نەخۆش</h3>
            <p className="text-xl font-bold text-gray-800">{invoice.patientName}</p>
            <p className="text-sm text-gray-500 mt-1">بەرواری دەرچوون: {formatDateTime(invoice.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase font-black text-gray-400 mb-2 border-b pb-1">ناونیشانی نەخۆشخانە</h3>
            <p className="text-sm text-gray-600">هەرێمی کوردستان، سلێمانی</p>
            <p className="text-sm text-gray-600">شەقامی شەست مەتری، تەنیشت پارکی ئازادی</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="text-left">
            <h3 className="text-xs uppercase font-black text-gray-400 mb-2">دۆخی پارەدان</h3>
            <div className={`text-2xl font-black uppercase inline-block px-4 py-1 rounded-full ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {invoice.status === 'paid' ? 'تەواو دراوە' : 'قەرز ماوە'}
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
             <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                {/* سیمبولی QR Code */}
                <div className="grid grid-cols-3 gap-1">
                   {[...Array(9)].map((_, i) => <div key={i} className="w-2 h-2 bg-gray-300"></div>)}
                </div>
             </div>
             <p className="text-[10px] text-gray-400 text-left max-w-[120px]">ئەم پسوولەیە بە شێوەی دیجیتاڵی دروستکراوە و فەرمییە.</p>
          </div>
        </div>
      </div>

      {/* خشتەی خزمەتگوزارییەکان */}
      <div className="mb-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white text-right">
              <th className="py-3 px-4 rounded-right-lg">خزمەتگوزاری و چارەسەر</th>
              <th className="py-3 px-4 text-left rounded-left-lg">نرخی یەکە (دینار)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-2 border-gray-100">
              <td className="py-6 px-4">
                <p className="font-bold text-lg text-gray-800">{invoice.items}</p>
                <p className="text-xs text-gray-400 mt-1">تێبینی: ئەم نرخە هەموو باج و خزمەتگوزارییەکان دەگرێتەوە.</p>
              </td>
              <td className="py-6 px-4 text-left">
                <span className="text-xl font-black text-gray-900">{formatCurrency(invoice.amount)}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* کۆی گشتی و واژۆ */}
      <div className="flex justify-between items-start gap-12">
        {/* بەشی واژۆ و مۆر */}
        <div className="flex-1 grid grid-cols-2 gap-8 pt-8">
           <div className="text-center pt-8 border-t-2 border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase mb-8">واژۆی ژمێریار</p>
              <div className="h-0.5 bg-gray-100 w-3/4 mx-auto"></div>
           </div>
           <div className="text-center pt-8 border-t-2 border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase mb-8">مۆری نەخۆشخانە</p>
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full mx-auto opacity-20 flex items-center justify-center">
                 <span className="text-primary font-black text-xs">OFFICIAL</span>
              </div>
           </div>
        </div>

        {/* کۆی کۆتایی */}
        <div className="w-80 bg-primary/5 p-8 rounded-3xl space-y-4">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-sm">کۆی گشتی:</span>
            <span className="font-bold">{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-sm font-bold">بڕی دراو:</span>
            <span className="text-xl font-black">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20 text-rose-600">
            <span className="text-sm font-black uppercase">ماوە (قەرز):</span>
            <span className="text-2xl font-black">{formatCurrency(invoice.amount - invoice.paidAmount)}</span>
          </div>
        </div>
      </div>

      {/* پێیی پسوولە */}
      <div className="mt-20 pt-8 border-t text-center space-y-2">
        <p className="text-sm font-bold text-gray-700 italic">سوپاس بۆ متمانەکەت بە پسپۆڕی و خزمەتگوزارییەکانمان.</p>
        <p className="text-xs text-gray-400">نەخۆشخانەی کوردی پڕۆ - هەمیشە لە خزمەت تەندروستی ئێوەدایە.</p>
      </div>
    </div>
  );
}
