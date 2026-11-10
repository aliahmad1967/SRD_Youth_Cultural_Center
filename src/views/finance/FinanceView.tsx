import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseRequest, PaymentReceipt, MemberCharge } from '../../types';
import { db } from '../../services/storage';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import {
  Wallet,
  CreditCard,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Printer,
  Plus,
  ShieldCheck,
  Search,
  DollarSign,
  ArrowRightLeft,
  X,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { dbState, currentUser, activeRole, showToast, formatMoney } = useApp();
  const [activeTab, setActiveTab] = useState<'collection' | 'expenses' | 'accounts' | 'donations' | 'budgets'>('collection');

  // Fee collection state
  const [selectedCharge, setSelectedCharge] = useState<MemberCharge | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'e_wallet'>('cash');
  const [selectedCashAccount, setSelectedCashAccount] = useState<string>(dbState.cashAccounts[0]?.id || '');
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);

  // New Expense Request state (Coordinator step 1)
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(850);
  const [expCategory, setExpCategory] = useState(dbState.finCategories.find((c) => c.type === 'expense')?.id || '');
  const [expBeneficiary, setExpBeneficiary] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expActivityId, setExpActivityId] = useState<string>('off-1');

  // Total liquidity
  const totalCash = dbState.cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalReceipts = dbState.transactions.filter((t) => t.type === 'receipt').reduce((sum, t) => sum + t.amount, 0);
  const totalDisbursements = dbState.transactions.filter((t) => t.type === 'disbursement').reduce((sum, t) => sum + t.amount, 0);

  // Fee Collection Handler (UAT-12)
  const handleCollectPayment = () => {
    if (!selectedCharge) return;

    try {
      const receipt = db.collectPayment(
        selectedCharge.memberName,
        paymentAmount,
        paymentMethod,
        selectedCashAccount,
        [{ title: selectedCharge.title, amount: paymentAmount }],
        selectedCharge.memberId,
        selectedCharge.id,
        currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
      );

      setGeneratedReceipt(receipt);
      showToast(`تم تحصيل ${paymentAmount} ج.م وإصدار سند القبض رقم ${receipt.receiptNo} بنجاح (UAT-12)`, 'success');
      setSelectedCharge(null);
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء التحصيل', 'error');
    }
  };

  // Submit Expense Request (Step 1)
  const handleCreateExpenseRequest = () => {
    if (!expTitle || !expBeneficiary || expAmount <= 0) {
      showToast('يرجى استكمال جميع بيانات طلب المصروف.', 'warning');
      return;
    }

    try {
      const category = dbState.finCategories.find((c) => c.id === expCategory);
      const offering = dbState.offerings.find((o) => o.id === expActivityId);
      const event = dbState.events.find((e) => e.id === expActivityId);
      const activityName = offering ? offering.name : event ? event.title : 'نشاط عام';

      db.requestExpense(
        {
          title: expTitle,
          categoryId: expCategory,
          categoryName: category?.name || 'مصروف عام',
          activityOrEventId: expActivityId,
          activityName,
          amount: expAmount,
          beneficiary: expBeneficiary,
          description: expDesc,
          invoiceFileName: 'فاتورة_مرفقة.pdf',
          invoiceUrl: '/invoices/sample_invoice.pdf',
          requestedBy: currentUser?.id || 'u-coord',
          requestedByName: currentUser?.name || 'سارة الخطيب (المنسق)',
        },
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' }
      );

      showToast('تم رفع طلب المصروف بنجاح وأُرسل تنبيه للمدير للاعتماد (UAT-13).', 'success');
      setShowNewExpenseModal(false);
      setExpTitle('');
      setExpBeneficiary('');
      setExpDesc('');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ', 'error');
    }
  };

  // Approve Expense (Director - Step 2)
  const handleApproveExpense = (expId: string) => {
    try {
      db.approveExpense(
        expId,
        currentUser
          ? { id: currentUser.id, name: currentUser.name, roles: currentUser.roles }
          : { id: 'u-dir', name: 'أحمد المنصور', roles: ['director'] }
      );
      showToast('تم اعتماد المصروف من الإدارة وأصبح جاهزاً للصرف من المسؤول المالي (UAT-13).', 'success');
    } catch (e: any) {
      showToast(e.message || 'تعذر الاعتماد', 'error');
    }
  };

  // Disburse Expense (Financial Officer - Step 3)
  const handleDisburseExpense = (expId: string) => {
    try {
      db.disburseExpense(
        expId,
        selectedCashAccount,
        currentUser
          ? { id: currentUser.id, name: currentUser.name, roles: currentUser.roles }
          : { id: 'u-fin', name: 'طارق السيد', roles: ['finance'] }
      );
      showToast('تم صرف النقد بنجاح وإقفال طلب المصروف وتحديث رصيد الخزينة (UAT-13).', 'success');
    } catch (e: any) {
      showToast(e.message || 'تعذر الصرف', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الحسابات والمالية ورقابة الصرف</h1>
          <p className="text-xs text-slate-500 mt-1">
            التحصيل وسندات القبض الإلكترونية، دورة اعتماد المصروفات وفصل المهام (BR-14)، والتبرعات المقيدة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>طلب مصروف جديد (بفاتورة)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">الرصيد النقدي المتاح:</span>
            <div className="text-2xl font-black text-[#1E4E8C] dark:text-blue-400 tabular-nums">
              {formatMoney(totalCash)}
            </div>
            <span className="text-[10px] text-slate-400">مجموع أرصدة الخزينة والحسابات</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-300 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">إجمالي المقبوضات:</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              +{formatMoney(totalReceipts)}
            </div>
            <span className="text-[10px] text-slate-400">سندات قبض ورعايات وتبرعات</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">إجمالي المنصرف المعتمد:</span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 tabular-nums">
              -{formatMoney(totalDisbursements)}
            </div>
            <span className="text-[10px] text-slate-400">أتعاب ومطبوعات ومواد</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 ${
            activeTab === 'collection' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          التحصيل وسندات القبض ({dbState.paymentReceipts.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 ${
            activeTab === 'expenses' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          دورة اعتماد المصروفات ({dbState.expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 ${
            activeTab === 'accounts' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          حسابات النقد والعهد ({dbState.cashAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 ${
            activeTab === 'donations' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          التبرعات المقيدة والمشاريع ({dbState.donations.length})
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 ${
            activeTab === 'budgets' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الموازنات التقديرية ({dbState.budgets.length})
        </button>
      </div>

      {/* TAB 1: FEE COLLECTION & ELECTRONIC RECEIPTS (UAT-12) */}
      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Dues Table (Left 2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">مستحقات المنتسبين والرسوم</h3>
                <span className="text-[11px] text-slate-500">اختر مستحقاً لتحصيل دفعة جزئية أو كاملة</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">المنتسب</th>
                    <th className="p-3.5">البيان</th>
                    <th className="p-3.5">المستحق</th>
                    <th className="p-3.5">المدفوع</th>
                    <th className="p-3.5">المتبقي</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">تحصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbState.memberCharges.map((chg) => {
                    const remaining = Math.max(0, chg.amount - chg.discount - chg.paidAmount);
                    const isSelected = selectedCharge?.id === chg.id;

                    return (
                      <tr
                        key={chg.id}
                        onClick={() => {
                          setSelectedCharge(chg);
                          setPaymentAmount(remaining);
                        }}
                        className={`hover:bg-slate-50 cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <td className="p-3.5 font-bold text-slate-900">{chg.memberName}</td>
                        <td className="p-3.5 text-slate-700">{chg.title}</td>
                        <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                          {chg.amount} ج.م
                        </td>
                        <td className="p-3.5 text-emerald-700 font-bold tabular-nums">
                          {chg.paidAmount} ج.م
                        </td>
                        <td className="p-3.5 font-bold text-rose-700 tabular-nums">
                          {remaining} ج.م
                        </td>
                        <td className="p-3.5">
                          {chg.status === 'paid' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              مدفوع بالكامل ✓
                            </span>
                          ) : chg.status === 'partial' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                              دفع جزئي (متبقي)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                              غير مسدد
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {remaining > 0 ? (
                            <button className="px-3 py-1 rounded-lg bg-[#1E4E8C] text-white text-[11px] font-bold hover:bg-[#163a69]">
                              تحصيل
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">✓ خالص</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collection Form (Right col) */}
          <div>
            {selectedCharge ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4 sticky top-24">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">تسجيل سند قبض جديد:</span>
                  <h3 className="text-sm font-bold text-slate-900">{selectedCharge.memberName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCharge.title}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      المبلغ المدفوع الآن (ج.م):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedCharge.amount - selectedCharge.discount - selectedCharge.paidAmount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      المتبقي بعد هذه الدفعة: {(selectedCharge.amount - selectedCharge.discount - selectedCharge.paidAmount - paymentAmount)} ج.م
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">طريقة السداد:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white"
                    >
                      <option value="cash">نقداً بالخزينة الرئيسية</option>
                      <option value="e_wallet">محفظة إلكترونية (فودافون كاش)</option>
                      <option value="bank_transfer">تحويل بنكي (بنك مصر)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">الحساب المستلم:</label>
                    <select
                      value={selectedCashAccount}
                      onChange={(e) => setSelectedCashAccount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white"
                    >
                      {dbState.cashAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (الرصيد: {acc.currentBalance.toLocaleString('ar-EG')} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCollectPayment}
                  className="w-full py-3 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>تأكيد التحصيل وإصدار السند (UAT-12)</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-400 text-xs">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>اختر مستحقاً من الجدول لتسجيل دفعة وطباعة السند</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE LIFECYCLE & SEGREGATION OF DUTIES (BR-14, BR-15, UAT-13, UAT-14) */}
      {activeTab === 'expenses' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">طلبات الصرف ودورة الاعتماد المقيدة</h3>
              <p className="text-[11px] text-slate-500">
                قاعدة BR-14: من يطلب المصروف لا يعتمده، ومن يعتمده لا يصرفه. الصرف يتطلب فاتورة إلزامية.
              </p>
            </div>
            <button
              onClick={() => setShowNewExpenseModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69]"
            >
              + إضافة طلب مصروف
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">البيان والمستفيد</th>
                  <th className="p-3.5">الفئة / النشاط</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">طالب الصرف</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المعتِمد / الصارف</th>
                  <th className="p-3.5 text-center">الإجراء الحوكمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbState.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500">المستفيد: {exp.beneficiary}</div>
                      {exp.isBudgetOverrun && (
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.2 rounded-md font-bold mt-1 inline-block">
                          ⚠ يتجاوز الموازنة (UAT-14)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{exp.categoryName}</div>
                      <div className="text-[10px] text-slate-400">{exp.activityName}</div>
                    </td>
                    <td className="p-3.5 font-bold text-rose-700 tabular-nums">
                      {exp.amount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-3.5 text-slate-700">{exp.requestedByName}</td>
                    <td className="p-3.5">
                      {exp.status === 'disbursed' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          تم الصرف بالسند ✓
                        </span>
                      ) : exp.status === 'approved' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          معتمد (بانتظار الصرف)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          بانتظار الاعتماد
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600">
                      {exp.approvedByName && <div>اعتماد: {exp.approvedByName}</div>}
                      {exp.disbursedByName && <div>صرف: {exp.disbursedByName}</div>}
                    </td>
                    <td className="p-3.5 text-center">
                      {/* Step 2: Director Approves */}
                      {exp.status === 'pending_approval' && (
                        <button
                          onClick={() => handleApproveExpense(exp.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-2xs"
                          title="اعتماد المدير (لا يمكن لمن طلب المصروف اعتماده)"
                        >
                          اعتماد المدير ✓
                        </button>
                      )}

                      {/* Step 3: Finance Disburses */}
                      {exp.status === 'approved' && (
                        <button
                          onClick={() => handleDisburseExpense(exp.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E9E5B] text-white font-bold text-xs hover:bg-[#25824b] shadow-2xs"
                          title="صرف النقد بواسطة المسؤول المالي"
                        >
                          صرف النقد 💵
                        </button>
                      )}

                      {exp.status === 'disbursed' && (
                        <span className="text-slate-400 text-xs font-mono">VCH-{exp.id.substring(4)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CASH ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dbState.cashAccounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {acc.type === 'cash_safe' ? 'خزينة نقدية' : acc.type === 'bank' ? 'حساب بنكي' : acc.type === 'e_wallet' ? 'محفظة إلكترونية' : 'عهدة أنشطة'}
                </span>
              </div>
              <div className="text-2xl font-black text-[#1E4E8C] tabular-nums">
                {acc.currentBalance.toLocaleString('ar-EG')}{' '}
                <span className="text-xs font-normal text-slate-500">ج.م</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>الرصيد الافتتاحي:</span>
                <span className="font-mono">{acc.openingBalance.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: RESTRICTED DONATIONS (FIN-07) */}
      {activeTab === 'donations' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">سجل التبرعات والرعايات والمشاريع المقيدة</h3>
            <p className="text-[11px] text-slate-500">
              قاعدة FIN-07: التبرع المقيد لا يجوز صرفه خارج مشروعه المحدد (تحذير مانع في النظام).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbState.donations.map((don) => (
              <div key={don.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{don.donorName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${don.isRestricted ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
                    {don.isRestricted ? 'تبرع مقيد بمشروع' : 'تبرع عام'}
                  </span>
                </div>
                <div className="text-lg font-black text-emerald-700 tabular-nums">
                  {don.amount.toLocaleString('ar-EG')} ج.م
                </div>
                {don.restrictedProject && (
                  <p className="text-[11px] text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    المشروع المقيد: <strong>{don.restrictedProject}</strong>
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block pt-1">{don.notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BUDGETS (FIN-11) */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dbState.budgets.map((b) => {
            const percent = Math.round((b.spentAmount / b.allocatedAmount) * 100);
            return (
              <div key={b.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{b.targetTitle}</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">المنصرف الفعلي:</span>
                    <span className="font-bold text-slate-900">{b.spentAmount.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">الموازنة المقدرة:</span>
                    <span className="font-bold text-[#1E4E8C]">{b.allocatedAmount.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-600' : percent >= 80 ? 'bg-amber-500' : 'bg-[#1E4E8C]'}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">{percent}% من إجمالي الموازنة</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Electronic Payment Receipt Printable Modal (Section 9.3 & UAT-12) */}
      {generatedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative text-right border-4 border-[#1E4E8C]">
            <button
              onClick={() => setGeneratedReceipt(null)}
              className="no-print absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Receipt Format matching Section 9.3 */}
            <div className="space-y-5 print-break-inside-avoid">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-slate-200 space-y-1">
                <h3 className="text-base font-black text-[#1E4E8C]">مركز الرواد الشبابي الثقافي والتوعوي</h3>
                <h2 className="text-lg font-black text-slate-900">ســــنــــد قـــبــــض إلكتروني</h2>
                <div className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                  رقم السند: {generatedReceipt.receiptNo}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">اسم الدافع:</span>
                  <span className="font-bold text-slate-900">{generatedReceipt.payerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">المبلغ المدفوع:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {generatedReceipt.amount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">المتبقي في الذمة:</span>
                  <span className="font-bold text-rose-700">
                    {generatedReceipt.remainingAmount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">طريقة الدفع والحساب:</span>
                  <span className="text-slate-800">{generatedReceipt.cashAccountName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">التاريخ والمحِّصل:</span>
                  <span className="text-slate-800">{generatedReceipt.issuedAt} ({generatedReceipt.issuedBy})</span>
                </div>
              </div>

              {/* QR verification for receipt */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                <QRCodeDisplay value={generatedReceipt.qrCodeToken} size={110} showText />
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                  سند قبض مالي معتمد وغير قابل للتعديل
                </span>
              </div>
            </div>

            {/* Print action */}
            <div className="no-print mt-5 flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] shadow-xs"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>طباعة السند / PDF</span>
              </button>
              <button
                onClick={() => setGeneratedReceipt(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Expense Request Modal (Step 1) */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">رفع طلب مصروف جديد (بفاتورة)</h3>
              <button onClick={() => setShowNewExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">بيان المصروف:</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: شراء ضيافة ورشة عمل، طباعة حقائب..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">المبلغ المطلوب (ج.م):</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">الجهة المستفيدة:</label>
                <input
                  type="text"
                  value={expBeneficiary}
                  onChange={(e) => setExpBeneficiary(e.target.value)}
                  placeholder="اسم المحل أو المطبعة أو المدرب..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">النشاط المرتبط:</label>
                <select
                  value={expActivityId}
                  onChange={(e) => setExpActivityId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white"
                >
                  {dbState.offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      دورة: {o.name}
                    </option>
                  ))}
                  {dbState.events.map((e) => (
                    <option key={e.id} value={e.id}>
                      فعالية: {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">مرفق الفاتورة (إلزامي):</label>
                <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-[11px] text-slate-500">
                  📄 تم إرفاق فاتورة الشراء الرسمية (فاتورة_مطبوعات_مختومة.pdf)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNewExpenseModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateExpenseRequest}
                className="px-4 py-2 rounded-lg bg-[#1E4E8C] text-xs font-bold text-white hover:bg-[#163a69]"
              >
                إرسال الطلب للاعتماد (UAT-13)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
