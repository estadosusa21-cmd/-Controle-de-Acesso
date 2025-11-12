
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Plus, History, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  
  const links = [
    {
      href: '/',
      label: 'Painel',
      icon: BarChart3,
      active: pathname === '/'
    },
    {
      href: '/novo-registro',
      label: 'Novo Registro',
      icon: Plus,
      active: pathname === '/novo-registro'
    },
    {
      href: '/historico',
      label: 'Histórico',
      icon: History,
      active: pathname === '/historico'
    }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-blue-900/95 backdrop-blur supports-[backdrop-filter]:bg-blue-900/60">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-white" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">SIGMA 10000</span>
              <span className="text-xs text-blue-200">AURA</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    link.active 
                      ? "bg-blue-800 text-white" 
                      : "text-blue-100 hover:bg-blue-800/70 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
