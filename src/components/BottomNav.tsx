'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/log', icon: PlusCircle, label: 'Log Repas' },
  { href: '/shop', icon: ShoppingCart, label: 'Courses' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around safe-area-bottom">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-3 px-4 min-w-[60px] transition-colors',
              active ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
