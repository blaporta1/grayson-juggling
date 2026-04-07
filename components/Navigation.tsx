'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History } from 'lucide-react';

const tabs = [
  { href: '/',        label: 'Home',    Icon: LayoutDashboard },
  { href: '/workout', label: 'Log',     Icon: PlusCircle },
  { href: '/history', label: 'History', Icon: History },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-2 py-2 flex items-center justify-around">
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-pitch-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]' : ''}
                />
                <span className={`text-xs font-medium ${active ? 'text-pitch-500' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
