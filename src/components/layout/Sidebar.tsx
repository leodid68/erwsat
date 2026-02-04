'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Upload,
  Sparkles,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  activeClass: string;
  hoverClass: string;
}

const navigation: NavItem[] = [
  {
    name: 'Accueil',
    href: '/',
    icon: Home,
    activeClass: 'bg-gradient-to-br from-indigo-400 to-blue-500 shadow-lg shadow-indigo-500/25',
    hoverClass: 'group-hover:from-indigo-400 group-hover:to-blue-500 group-hover:shadow-indigo-500/25',
  },
  {
    name: 'Importer',
    href: '/upload',
    icon: Upload,
    activeClass: 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25',
    hoverClass: 'group-hover:from-cyan-400 group-hover:to-blue-500 group-hover:shadow-cyan-500/25',
  },
  {
    name: 'Générer',
    href: '/generate',
    icon: Sparkles,
    activeClass: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/25',
    hoverClass: 'group-hover:from-orange-400 group-hover:to-amber-500 group-hover:shadow-orange-500/25',
  },
  {
    name: 'Quiz',
    href: '/quiz',
    icon: ClipboardList,
    activeClass: 'bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/25',
    hoverClass: 'group-hover:from-violet-400 group-hover:to-purple-500 group-hover:shadow-violet-500/25',
  },
  {
    name: 'Progrès',
    href: '/progress',
    icon: BarChart3,
    activeClass: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25',
    hoverClass: 'group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:shadow-emerald-500/25',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 w-72 bg-white/40 border-r border-white/50 flex flex-col"
      style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-black/5">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl text-gradient">SAT ERW</span>
            <p className="text-xs text-muted-foreground">Lecture & Écriture</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-white/70 shadow-sm'
                  : 'hover:bg-white/50 hover:translate-x-1'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive
                    ? item.activeClass
                    : `bg-black/5 group-hover:bg-gradient-to-br ${item.hoverClass} group-hover:shadow-lg`
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
              </div>
              <span
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                )}
              >
                {item.name}
              </span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Pro Tip Card */}
      <div className="p-4">
        <div className="liquid-glass p-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-semibold text-violet-600">Astuce</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pratiquez chaque jour pour maintenir votre série et progresser !
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
