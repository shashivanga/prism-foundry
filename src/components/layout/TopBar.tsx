import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function TopBar() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-sidebar-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="transition-smooth" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gradient-border">
              v1.0.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`
                ${currentUser.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : ''}
                ${currentUser.role === 'pm' ? 'bg-secondary/10 text-secondary border-secondary/20' : ''}
                ${currentUser.role === 'client' ? 'bg-primary/10 text-primary border-primary/20' : ''}
              `}>
                {currentUser.role.toUpperCase()}
              </Badge>
               <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {currentUser.full_name?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentUser.full_name || currentUser.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="transition-smooth"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/client/auth/login')}
                className="transition-smooth"
              >
                Client Login
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/internal/auth/login')}
                className="transition-smooth"
              >
                Team Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}