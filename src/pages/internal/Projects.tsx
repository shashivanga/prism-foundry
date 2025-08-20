import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { usePRDVersions } from '@/hooks/usePRDVersions';
import { 
  FolderOpen, 
  Search, 
  Clock, 
  CheckCircle, 
  Pause, 
  Users,
  FileText,
  Rocket,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  active: { label: 'Active', color: 'bg-gradient-primary text-primary-foreground', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-secondary text-secondary-foreground', icon: Pause },
  completed: { label: 'Completed', color: 'bg-gradient-accent text-accent-foreground', icon: CheckCircle },
};

const prdStatusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  review: { label: 'Under Review', color: 'bg-gradient-secondary text-secondary-foreground' },
  approved: { label: 'Approved', color: 'bg-gradient-primary text-primary-foreground' },
  archived: { label: 'Archived', color: 'bg-destructive text-destructive-foreground' },
};

export default function InternalProjects() {
  const navigate = useNavigate();
  const { currentUser } = useAuth({ requiredRole: 'pm' });
  const { projects, loading } = useProjects();
  const { getLatestPRDVersion } = usePRDVersions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectStatus = (projectId: string) => {
    const prd = getLatestPRDVersion(projectId);
    
    if (!prd) return { status: 'No PRD', color: 'bg-muted text-muted-foreground', needsAction: false };
    return { status: 'PRD Created', color: 'bg-gradient-primary text-primary-foreground', needsAction: false };
  };

  const projectsNeedingAttention = filteredProjects.filter(project => {
    const status = getProjectStatus(project.id);
    return status.needsAction;
  });

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'gradient-primary',
    },
    {
      title: 'Needing Review',
      value: projectsNeedingAttention.length,
      icon: AlertCircle,
      color: 'gradient-secondary',
    },
    {
      title: 'Active Clients',
      value: new Set(projects.map(p => p.owner_user_id)).size,
      icon: Users,
      color: 'gradient-accent',
    },
    {
      title: 'With PRDs',
      value: projects.filter(p => getLatestPRDVersion(p.id)).length,
      icon: Rocket,
      color: 'gradient-primary',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
              Internal Projects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage client projects, review PRDs, and generate MVP specifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              {currentUser?.role?.toUpperCase()} Portal
            </Badge>
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Priority Projects */}
        {projectsNeedingAttention.length > 0 && (
          <Card className="shadow-card border-secondary/20 bg-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-secondary" />
                <CardTitle className="text-secondary">Projects Needing Attention</CardTitle>
              </div>
              <CardDescription>
                These projects have PRDs waiting for review or need MVP specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsNeedingAttention.slice(0, 4).map((project) => {
                  const projectStatus = getProjectStatus(project.id);
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          by {project.client_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={projectStatus.color}>
                          {projectStatus.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/internal/projects/${project.id}`)}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Projects */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>
              Complete list of client projects and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => {
                  const prd = getLatestPRDVersion(project.id);
                  const projectStatus = getProjectStatus(project.id);
                  const statusInfo = statusConfig['draft']; // Default to draft
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-smooth cursor-pointer"
                      onClick={() => navigate(`/internal/projects/${project.id}`)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            <Badge className={projectStatus.color}>
                              {projectStatus.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Client: {project.client_name}</span>
                            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                            {prd && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                PRD: Version {prd.version}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-4" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms.'
                    : 'Client projects will appear here once they start creating them.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}