import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';

export function TopBar() {
  const { session } = useAppStore();

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
          {session.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">User</span>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="transition-smooth">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}