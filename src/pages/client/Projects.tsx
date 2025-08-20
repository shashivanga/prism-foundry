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
  Plus, 
  Clock, 
  CheckCircle, 
  Pause, 
  Search,
  FileText,
  Rocket
} from 'lucide-react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  active: { label: 'Active', color: 'bg-gradient-primary text-primary-foreground', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-secondary text-secondary-foreground', icon: Pause },
  completed: { label: 'Completed', color: 'bg-gradient-accent text-accent-foreground', icon: CheckCircle },
} as const;

export default function ClientProjects() {
  const navigate = useNavigate();
  const { currentUser } = useAuth({ requiredRole: 'client' });
  const { userProjects, loading } = useProjects();
  const { getLatestPRDVersion } = usePRDVersions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = userProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSpecStatus = (projectId: string) => {
    const prd = getLatestPRDVersion(projectId);
    
    if (!prd) return 'No PRD';
    return 'PRD Created';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your development projects and track progress
            </p>
          </div>
          <Button 
            onClick={() => navigate('/client/projects/new')}
            className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : userProjects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                      <div className="h-8 bg-muted rounded animate-pulse w-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const statusInfo = statusConfig['draft']; // Default to draft since we don't have status in DB yet
              const StatusIcon = statusInfo.icon;
              const prd = getLatestPRDVersion(project.id);
              const specStatus = getSpecStatus(project.id);

              return (
                <Card key={project.id} className="shadow-card transition-smooth hover:shadow-glow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {project.description}
                        </CardDescription>
                      </div>
                      <Badge className={`ml-2 flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Spec Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Specification:</span>
                        <Badge variant="outline" className="text-xs">
                          {specStatus}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {prd ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/client/projects/${project.id}/prd`)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View PRD
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/client/projects/${project.id}/prd`)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Create PRD
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/client/projects/${project.id}`)}
                        >
                          <Rocket className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="gradient-border p-[1px] rounded-full mb-4">
                <div className="bg-card p-6 rounded-full">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery 
                  ? 'Try adjusting your search terms or create a new project to get started.'
                  : 'Start your development journey by creating your first project. Define your requirements and let our team bring your vision to life.'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/client/projects/new')}
                  className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}