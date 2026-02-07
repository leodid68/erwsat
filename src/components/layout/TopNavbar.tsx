'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  Upload,
  Sparkles,
  ClipboardList,
  GraduationCap,
  LucideIcon,
  BarChart3,
  History,
  Dumbbell,
  Brain,
  Trophy,
  Database,
  FileCheck,
  PieChart,
  Settings,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { AuthButton } from '@/components/auth';

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Apprendre',
    links: [
      { name: 'Accueil', href: '/', icon: Home },
      { name: 'Importer', href: '/upload', icon: Upload },
      { name: 'Bibliothèque', href: '/library', icon: Database },
      { name: 'Générer', href: '/generate', icon: Sparkles },
    ],
  },
  {
    label: 'Pratiquer',
    links: [
      { name: 'Quiz', href: '/quiz', icon: ClipboardList },
      { name: 'Mode SAT', href: '/sat-mode', icon: GraduationCap },
      { name: 'Test Placement', href: '/placement', icon: FileCheck },
      { name: 'Entraînement', href: '/practice', icon: Dumbbell },
    ],
  },
  {
    label: 'Analyser',
    links: [
      { name: 'Progrès', href: '/progress', icon: BarChart3 },
      { name: 'Analyse', href: '/analytics', icon: PieChart },
      { name: 'Historique', href: '/history', icon: History },
    ],
  },
  {
    label: 'Réviser',
    links: [
      { name: 'Révision', href: '/review', icon: Brain },
      { name: 'Succès', href: '/achievements', icon: Trophy },
    ],
  },
];

function DropdownGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasActiveLink = group.links.some((link) =>
    link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
  );

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          'relative flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          hasActiveLink
            ? 'text-white bg-white/8'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        )}
        onClick={() => setOpen(!open)}
      >
        {group.label}
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
        {hasActiveLink && (
          <span className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-violet-400" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[200px] py-2 rounded-xl z-50 animate-in animate-delay-0 bg-[#1a1625]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
          {group.links.map((link) => {
            const isActive =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150',
                  isActive
                    ? 'text-white bg-violet-500/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-navbar">
        <div className="h-full max-w-[1400px] mx-auto px-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg text-gradient hidden sm:block">SAT ERW</span>
          </Link>

          {/* Center: Nav groups (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group) => (
              <DropdownGroup key={group.label} group={group} pathname={pathname} />
            ))}
          </nav>

          {/* Right: Auth + Settings */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className={cn(
                'p-2 rounded-lg transition-colors duration-200',
                pathname === '/settings'
                  ? 'text-white bg-white/8'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Settings className="w-5 h-5" />
            </Link>
            <AuthButton />

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#1a1625]/95 backdrop-blur-xl border-t border-white/8 p-4 space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.links.map((link) => {
                    const isActive =
                      link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'text-white bg-violet-500/15'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
