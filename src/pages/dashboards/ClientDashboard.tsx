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
  const userFeedback = feedback.filter(f => f.authorEmail === currentUser?.email);

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your projects and track development progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Client Portal
            </Badge>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card transition-smooth hover:shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProjects.length > 0 ? (
                <div className="space-y-3">
                  {userProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.description}</div>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet</p>
                  <Button className="mt-4 bg-gradient-primary border-0">
                    Request New Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Your latest project feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userFeedback.length > 0 ? (
                <div className="space-y-3">
                  {userFeedback.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm">{item.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback given yet</p>
                  <Button variant="outline" className="mt-4">
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