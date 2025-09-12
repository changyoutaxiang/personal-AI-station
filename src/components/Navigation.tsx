'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, CheckSquare, BarChart3 } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { 
      name: '记录', 
      href: '/', 
      icon: <FileText className="h-full w-full" />,
      id: 'records'
    },
    { 
      name: '待办', 
      href: '/todos', 
      icon: <CheckSquare className="h-full w-full" />,
      id: 'todos' 
    },
    { 
      name: '分析', 
      href: '/analysis', 
      icon: <BarChart3 className="h-full w-full" />,
      id: 'analysis' 
    },
    // TODO(human): 在这里添加更多导航项目
    // 例如：设置页面、用户资料页面等
    // 格式: { name: '设置', href: '/settings', icon: <Settings className="h-full w-full" />, id: 'settings' }
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Dock 
        className="items-end pb-3"
        style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--card-border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <DockItem
                className="aspect-square rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--flow-primary)' : 'var(--card-glass)',
                  borderColor: 'var(--card-border)',
                  border: '1px solid',
                }}
              >
                <DockLabel>{item.name}</DockLabel>
                <DockIcon>
                  <div 
                    className="transition-colors duration-200"
                    style={{
                      color: isActive ? 'var(--text-on-primary)' : 'var(--text-primary)',
                    }}
                  >
                    {item.icon}
                  </div>
                </DockIcon>
              </DockItem>
            </Link>
          );
        })}
      </Dock>
    </div>
  );
}