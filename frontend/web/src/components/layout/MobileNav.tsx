'use client';

import Link from 'next/link';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <nav className="fixed left-0 top-0 h-full w-64 bg-white p-6 shadow-xl">
        <div className="mb-8 text-lg font-bold text-blue-600">WebĐọcTruyện</div>
        <div className="flex flex-col gap-4">
          <Link href="/truyen" className="text-gray-700 hover:text-blue-600" onClick={onClose}>
            Truyện
          </Link>
          <Link href="/the-loai" className="text-gray-700 hover:text-blue-600" onClick={onClose}>
            Thể loại
          </Link>
          <Link href="/xep-hang" className="text-gray-700 hover:text-blue-600" onClick={onClose}>
            Xếp hạng
          </Link>
        </div>
      </nav>
    </div>
  );
}
