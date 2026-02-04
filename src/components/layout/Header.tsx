'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Upload,
  Sparkles,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: BookOpen },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Generate', href: '/generate', icon: Sparkles },
  { name: 'Quizzes', href: '/quiz', icon: ClipboardList },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-primary/5 via-background to-accent/5 backdrop-blur-lg">
      <div className="container mx-auto px-4 flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-8 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SAT ERW Prep
          </span>
        </Link>

        <nav className="flex items-center space-x-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
