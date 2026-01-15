/**
 * DashboardHeader - Reusable header component for dashboards
 * Professional design with consistent styling
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  /** Icon to display in the header */
  icon: ReactNode;
  /** Main title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** User's name to display */
  userName?: string;
  /** User's role label */
  roleLabel?: string;
  /** Additional badges or status indicators */
  badges?: ReactNode;
  /** Show settings button */
  showSettings?: boolean;
  /** Settings path */
  settingsPath?: string;
  /** Show logout button */
  showLogout?: boolean;
  /** Logout handler */
  onLogout?: () => void;
  /** Additional actions */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

export function DashboardHeader({
  icon,
  title,
  subtitle,
  userName,
  roleLabel,
  badges,
  showSettings = true,
  settingsPath = '/settings',
  showLogout = true,
  onLogout,
  actions,
  className,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn("border-b bg-card/95 backdrop-blur-sm sticky top-0 z-40", className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Branding & Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
                {badges}
              </div>
              {(subtitle || userName) && (
                <p className="text-sm text-muted-foreground truncate">
                  {userName ? (
                    <>
                      Welcome, <span className="font-medium text-foreground">{userName}</span>
                      {roleLabel && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {roleLabel}
                        </Badge>
                      )}
                    </>
                  ) : subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            
            {showSettings && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(settingsPath)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            
            {showLogout && onLogout && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
