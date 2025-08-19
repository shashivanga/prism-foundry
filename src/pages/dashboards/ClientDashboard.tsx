import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { FolderOpen, MessageSquare, TrendingUp, Clock } from 'lucide-react';

export default function ClientDashboard() {
  const { currentUser, logout } = useAuth({ requiredRole: 'client' });
  const { projects, feedback } = useAppStore();

  const userProjects = projects.filter(p => p.ownerId === currentUser?.id);
  const userFeedback = feedback.filter(f => f.clientId === currentUser?.id);

  const stats = [
    {
      title: 'My Projects',
      value: userProjects.length,
      icon: FolderOpen,
      color: 'gradient-primary',
    },
    {
      title: 'Feedback Given',
      value: userFeedback.length,
      icon: MessageSquare,
      color: 'gradient-secondary',
    },
    {
      title: 'Active Builds',
      value: userProjects.filter(p => p.status === 'active').length,
      icon: TrendingUp,
      color: 'gradient-accent',
    },
    {
      title: 'Recent Activity',
      value: '24h',
      icon: Clock,
      color: 'gradient-primary',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold gradient-text text-balance">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Manage your projects and track development progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 badge-high-contrast">
              Client Portal
            </Badge>
            <Button 
              variant="outline" 
              onClick={logout}
              className="transition-smooth hover-scale focus-ring"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className="glass-card shadow-elevated transition-spring hover:shadow-glow hover-scale group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.color} shadow-primary transition-bounce group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="h-1 bg-gradient-primary rounded-full mt-2 opacity-50"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card shadow-elevated hover-scale transition-spring">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold gradient-text">Recent Projects</CardTitle>
                  <CardDescription className="text-balance">
                    Your latest development projects
                  </CardDescription>
                </div>
                <FolderOpen className="h-8 w-8 text-primary/50" />
              </div>
            </CardHeader>
            <CardContent>
              {userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.slice(0, 3).map((project, index) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-smooth hover-scale cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{project.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{project.description}</div>
                      </div>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className="ml-4 badge-high-contrast"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-primary hover:bg-primary/10 transition-smooth"
                  >
                    View All Projects
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-balance mb-6">
                    Start your first project to begin tracking development progress
                  </p>
                  <Button className="bg-gradient-primary hover:bg-gradient-primary/90 border-0 shadow-primary transition-spring hover:scale-105">
                    Request New Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card shadow-elevated hover-scale transition-spring">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold gradient-text">Recent Feedback</CardTitle>
                  <CardDescription className="text-balance">
                    Your latest project feedback
                  </CardDescription>
                </div>
                <MessageSquare className="h-8 w-8 text-secondary/50" />
              </div>
            </CardHeader>
            <CardContent>
              {userFeedback.length > 0 ? (
                <div className="space-y-4">
                  {userFeedback.slice(0, 3).map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-xl bg-gradient-card border border-border/50 hover:border-secondary/30 transition-smooth hover-scale"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-secondary/20 text-secondary border-secondary/30 badge-high-contrast"
                        >
                          {item.category}
                        </Badge>
                        <Badge 
                          variant={item.status === 'resolved' ? 'default' : 'secondary'} 
                          className="text-xs badge-high-contrast"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{item.message}</div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-secondary hover:bg-secondary/10 transition-smooth"
                  >
                    View All Feedback
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-secondary/10 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-secondary/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No feedback given yet</h3>
                  <p className="text-muted-foreground text-balance mb-6">
                    Share your thoughts to help improve your projects
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-secondary/30 text-secondary hover:bg-secondary/10 transition-smooth hover-scale focus-ring"
                  >
                    Provide Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}