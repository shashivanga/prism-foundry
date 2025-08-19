import { 
  FolderOpen, 
  FileText, 
  Rocket, 
  Share2, 
  MessageSquare,
  Settings,
  Home
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

import { useAuth } from '@/hooks/useAuth';

const getNavigationItems = (userRole?: string) => {
  const baseItems = [
    { title: 'Dashboard', url: '/', icon: Home },
  ];

  if (userRole === 'client') {
    return [
      ...baseItems,
      { title: 'My Projects', url: '/client/projects', icon: FolderOpen },
      { title: 'Feedback', url: '/feedback', icon: MessageSquare },
    ];
  }

  if (userRole === 'pm' || userRole === 'admin') {
    return [
      ...baseItems,
      { title: 'All Projects', url: '/internal/projects', icon: FolderOpen },
      { title: 'PRD Versions', url: '/prd-versions', icon: FileText },
      { title: 'MVP Specs', url: '/mvp-specs', icon: Rocket },
      { title: 'Builds', url: '/builds', icon: Settings },
      { title: 'Share Links', url: '/share-links', icon: Share2 },
      { title: 'Feedback', url: '/feedback', icon: MessageSquare },
    ];
  }

  return baseItems;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  
  const navigationItems = getNavigationItems(currentUser?.role);

  const isActive = (path: string) => currentPath === path;
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
      : 'hover:bg-sidebar-accent transition-smooth';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="p-4">
        {!isCollapsed && (
          <div className="gradient-primary bg-clip-text text-transparent">
            <h2 className="text-xl font-bold">BuildFlow</h2>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={getNavClassName}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}