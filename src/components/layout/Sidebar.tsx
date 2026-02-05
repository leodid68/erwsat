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
  Zap,
  History,
  Dumbbell,
  Brain,
  Trophy,
  Database,
  FileCheck,
  PieChart,
  Settings,
} from 'lucide-react';
import { AuthButton } from '@/components/auth';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
}

const navigation: NavItem[] = [
  {
    name: 'Accueil',
    href: '/',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    name: 'Importer',
    href: '/upload',
    icon: Upload,
    gradient: 'from-blue-500 to-slate-400',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    name: 'Bibliothèque',
    href: '/library',
    icon: Database,
    gradient: 'from-emerald-500 to-green-400',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    name: 'Générer',
    href: '/generate',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  {
    name: 'Quiz',
    href: '/quiz',
    icon: ClipboardList,
    gradient: 'from-purple-500 to-pink-400',
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    name: 'Mode SAT',
    href: '/sat-mode',
    icon: GraduationCap,
    gradient: 'from-indigo-500 to-purple-400',
    glowColor: 'rgba(99, 102, 241, 0.5)',
  },
  {
    name: 'Test Placement',
    href: '/placement',
    icon: FileCheck,
    gradient: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(6, 182, 212, 0.5)',
  },
  {
    name: 'Progrès',
    href: '/progress',
    icon: BarChart3,
    gradient: 'from-emerald-500 to-green-400',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    name: 'Analyse',
    href: '/analytics',
    icon: PieChart,
    gradient: 'from-violet-500 to-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    name: 'Entraînement',
    href: '/practice',
    icon: Dumbbell,
    gradient: 'from-red-500 to-orange-400',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    name: 'Révision',
    href: '/review',
    icon: Brain,
    gradient: 'from-pink-500 to-rose-400',
    glowColor: 'rgba(236, 72, 153, 0.5)',
  },
  {
    name: 'Succès',
    href: '/achievements',
    icon: Trophy,
    gradient: 'from-amber-500 to-yellow-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  {
    name: 'Historique',
    href: '/history',
    icon: History,
    gradient: 'from-slate-500 to-zinc-400',
    glowColor: 'rgba(100, 116, 139, 0.5)',
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-400',
    glowColor: 'rgba(100, 116, 139, 0.5)',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col">
      {/* Logo and Auth */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl text-gradient">SAT ERW</span>
            <p className="text-xs text-muted-foreground">Lecture & Écriture</p>
          </div>
        </Link>
        <AuthButton />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted hover:translate-x-1'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
                  isActive
                    ? `bg-gradient-to-br ${item.gradient}`
                    : 'bg-muted border border-border group-hover:border-primary/20'
                )}
                style={isActive ? { boxShadow: `0 0 15px ${item.glowColor}` } : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-all duration-300',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.name}
              </span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Pro Tip Card */}
      <div className="p-4">
        <div className="glass-cosmic p-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-semibold text-primary">Astuce</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pratiquez chaque jour pour maintenir votre série et progresser !
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
