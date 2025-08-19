import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { FolderOpen, FileText, Rocket, Activity } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { projects, prdVersions, mvpSpecs, builds } = useAppStore();

  const stats = [
    {
      title: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'gradient-primary',
    },
    {
      title: 'PRD Versions',
      value: prdVersions.length,
      icon: FileText,
      color: 'gradient-secondary',
    },
    {
      title: 'MVP Specs',
      value: mvpSpecs.length,
      icon: Rocket,
      color: 'gradient-accent',
    },
    {
      title: 'Builds',
      value: builds.length,
      icon: Activity,
      color: 'gradient-primary',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="inline-block gradient-border p-[1px] rounded-lg mb-4">
            <Badge className="bg-card border-0 px-4 py-2">
              ✨ BuildFlow Dashboard
            </Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Project Management Made Simple
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your development workflow from PRD to MVP with our integrated build and feedback system.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            {isAuthenticated ? (
              <Button 
                className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                onClick={() => {
                  switch (currentUser?.role) {
                    case 'client':
                      window.location.href = '/client/projects';
                      break;
                    case 'pm':
                      window.location.href = '/pm/dashboard';
                      break;
                    case 'admin':
                      window.location.href = '/admin/dashboard';
                      break;
                    default:
                      window.location.href = '/client/auth/login';
                  }
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                  onClick={() => window.location.href = '/client/auth/signup'}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  className="transition-smooth"
                  onClick={() => window.location.href = '/internal/auth/login'}
                >
                  Team Access
                </Button>
              </>
            )}
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
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your next project in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 transition-smooth hover:shadow-card">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">New Project</div>
                <div className="text-sm text-muted-foreground">Start fresh with a new project</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 transition-smooth hover:shadow-card">
              <FileText className="h-8 w-8 text-secondary" />
              <div className="text-center">
                <div className="font-semibold">Create PRD</div>
                <div className="text-sm text-muted-foreground">Document your requirements</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 transition-smooth hover:shadow-card">
              <Rocket className="h-8 w-8 text-accent" />
              <div className="text-center">
                <div className="font-semibold">Build MVP</div>
                <div className="text-sm text-muted-foreground">Deploy your minimum viable product</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Status Indicator */}
        <div className="text-center text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            ● System Online - All services operational
          </Badge>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
