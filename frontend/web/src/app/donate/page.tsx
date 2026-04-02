'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useActiveGoals,
  useRecentDonations,
  useTopDonors,
  useCreateDonation,
} from '@/hooks/useDonate';
import Link from 'next/link';

const QUICK_AMOUNTS = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000];
const METHODS = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  { value: 'momo', label: 'MoMo' },
  { value: 'vnpay', label: 'VNPay' },
  { value: 'zalopay', label: 'ZaloPay' },
];

const BADGE_STYLES: Record<string, { label: string; color: string }> = {
  diamond: { label: 'Diamond', color: 'text-cyan-500' },
  gold: { label: 'Gold', color: 'text-yellow-500' },
  silver: { label: 'Silver', color: 'text-gray-400' },
  bronze: { label: 'Bronze', color: 'text-orange-600' },
};

function formatMoney(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function DonatePage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: goals } = useActiveGoals();
  const { data: recentDonations } = useRecentDonations();
  const { data: topDonors } = useTopDonors();
  const createDonation = useCreateDonation();

  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = amount || Number(customAmount) || 0;

  const handleDonate = async () => {
    setError('');
    if (finalAmount < 10000) {
      setError('Tối thiểu 10,000đ');
      return;
    }

    try {
      await createDonation.mutateAsync({
        amount: finalAmount,
        method,
        message,
        displayName: displayName || user?.name || '',
        isAnonymous,
      });
      setSuccess(true);
      setAmount(0);
      setCustomAmount('');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold">Ủng hộ WebĐọcTruyện</h1>
      <p className="mb-8 text-gray-500">Hỗ trợ chi phí server và phát triển trang web</p>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left: Donation Form */}
        <div className="md:col-span-2">
          {/* Active Goals */}
          {goals && goals.length > 0 && (
            <div className="mb-6">
              {goals.map((goal: any) => {
                const pct = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100),
                );
                return (
                  <div key={goal._id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="font-semibold">{goal.title}</h3>
                    {goal.description && (
                      <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                    )}
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-green-600">
                          {formatMoney(goal.currentAmount)}
                        </span>
                        <span className="text-gray-400">{formatMoney(goal.targetAmount)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className="h-3 rounded-full bg-green-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{pct}% hoàn thành</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Donate Form */}
          {!isAuthenticated ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="mb-3 text-gray-500">Vui lòng đăng nhập để ủng hộ</p>
              <Link
                href="/dang-nhap"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Đăng nhập
              </Link>
            </div>
          ) : success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <p className="text-lg font-semibold text-green-700">Cảm ơn bạn đã ủng hộ!</p>
              <p className="mt-2 text-sm text-green-600">
                {method === 'bank_transfer'
                  ? 'Vui lòng chuyển khoản theo thông tin bên dưới. Admin sẽ xác nhận trong thời gian sớm nhất.'
                  : 'Giao dịch đang được xử lý.'}
              </p>
              {method === 'bank_transfer' && (
                <div className="mx-auto mt-4 max-w-sm rounded-lg border border-green-200 bg-white p-4 text-left text-sm">
                  <p>
                    <strong>Ngân hàng:</strong> Vietcombank
                  </p>
                  <p>
                    <strong>STK:</strong> 1234567890
                  </p>
                  <p>
                    <strong>Chủ TK:</strong> NGUYEN VAN A
                  </p>
                  <p>
                    <strong>Nội dung CK:</strong> DONATE_{user?._id?.slice(-6)}
                  </p>
                  <p>
                    <strong>Số tiền:</strong> {formatMoney(finalAmount)}
                  </p>
                </div>
              )}
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Ủng hộ thêm
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Chọn số tiền</h2>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mb-4 grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAmount(a);
                      setCustomAmount('');
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      amount === a
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {formatMoney(a)}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Hoặc nhập số tiền khác (VND)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <h2 className="mb-3 text-lg font-semibold">Phương thức thanh toán</h2>
              <div className="mb-4 space-y-2">
                {METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 ${
                      method === m.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m.value}
                      checked={method === m.value}
                      onChange={(e) => setMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4 space-y-3">
                <input
                  placeholder="Tên hiển thị (tùy chọn)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  placeholder="Lời nhắn (tùy chọn)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="accent-blue-600"
                  />
                  Ủng hộ ẩn danh
                </label>
              </div>

              <button
                onClick={handleDonate}
                disabled={finalAmount < 10000 || createDonation.isPending}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createDonation.isPending
                  ? 'Đang xử lý...'
                  : finalAmount >= 10000
                    ? `Ủng hộ ${formatMoney(finalAmount)}`
                    : 'Chọn số tiền (tối thiểu 10,000đ)'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Recent + Top */}
        <div className="space-y-6">
          {/* Recent Donations */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Ủng hộ gần đây</h3>
            {recentDonations && recentDonations.length > 0 ? (
              <div className="space-y-2">
                {recentDonations.map((d: any) => (
                  <div key={d._id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {d.isAnonymous ? 'Ẩn danh' : d.displayName || d.userId?.name || 'User'}
                      </span>
                      {d.userId?.donorBadge && d.userId.donorBadge !== 'none' && (
                        <span
                          className={`ml-1 text-xs font-medium ${BADGE_STYLES[d.userId.donorBadge]?.color || ''}`}
                        >
                          [{BADGE_STYLES[d.userId.donorBadge]?.label}]
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatMoney(d.amount)}</p>
                      <p className="text-[10px] text-gray-400">
                        {timeAgo(d.completedAt || d.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Chưa có donation nào</p>
            )}
          </div>

          {/* Top Donors */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Top Donors</h3>
            {topDonors && topDonors.length > 0 ? (
              <div className="space-y-2">
                {topDonors.map((d: any, i: number) => (
                  <div key={d._id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center text-xs font-bold text-gray-400">
                      #{i + 1}
                    </span>
                    <span className="flex-1 font-medium truncate">{d.name}</span>
                    {d.donorBadge && d.donorBadge !== 'none' && (
                      <span
                        className={`text-xs font-medium ${BADGE_STYLES[d.donorBadge]?.color || ''}`}
                      >
                        {BADGE_STYLES[d.donorBadge]?.label}
                      </span>
                    )}
                    <span className="text-xs text-green-600">{formatMoney(d.totalDonated)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Chưa có ai donate</p>
            )}
          </div>

          {/* Badge Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Huy hiệu Donor</h3>
            <div className="space-y-1.5 text-xs">
              <p>
                <span className="text-cyan-500 font-medium">Diamond</span> — từ 2,000,000đ
              </p>
              <p>
                <span className="text-yellow-500 font-medium">Gold</span> — từ 1,000,000đ
              </p>
              <p>
                <span className="text-gray-400 font-medium">Silver</span> — từ 500,000đ
              </p>
              <p>
                <span className="text-orange-600 font-medium">Bronze</span> — từ 100,000đ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
