import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  CreditCard, 
  Home, 
  Settings,
  Building2
} from 'lucide-react';

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Müşteriler', href: '/customers', icon: Users },
  { name: 'Ödemeler', href: '/payments', icon: CreditCard },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-gradient-card border-r shadow-card overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 pb-6">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="ml-3 text-xl font-bold text-foreground">
            SarpBank
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Müşteri ve Ödeme Yönetimi
          </div>
        </div>
      </div>
    </div>
  );
}