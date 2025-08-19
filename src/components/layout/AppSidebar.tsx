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

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Projects', url: '/client/projects', icon: FolderOpen },
  { title: 'PRD Versions', url: '/prd-versions', icon: FileText },
  { title: 'MVP Specs', url: '/mvp-specs', icon: Rocket },
  { title: 'Builds', url: '/builds', icon: Settings },
  { title: 'Share Links', url: '/share-links', icon: Share2 },
  { title: 'Feedback', url: '/feedback', icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

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