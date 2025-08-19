import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label as ShadcnLabel } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { mockAI } from '@/services/mockAI';
import { 
  ArrowLeft, 
  FileText, 
  Rocket, 
  User, 
  Calendar,
  Target,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Monitor,
  Share,
  Link,
  Copy,
  Trash2,
  ExternalLink,
  Eye
} from 'lucide-react';

const prdStatusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  review: { label: 'Under Review', color: 'bg-gradient-secondary text-secondary-foreground' },
  approved: { label: 'Approved', color: 'bg-gradient-primary text-primary-foreground' },
  archived: { label: 'Archived', color: 'bg-destructive text-destructive-foreground' },
};

const mvpStatusConfig = {
  planning: { label: 'Planning', color: 'bg-muted text-muted-foreground', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-gradient-secondary text-secondary-foreground', icon: Settings },
  testing: { label: 'Testing', color: 'bg-gradient-accent text-accent-foreground', icon: AlertTriangle },
  completed: { label: 'Completed', color: 'bg-gradient-primary text-primary-foreground', icon: CheckCircle },
};

export default function InternalProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth({ requiredRole: 'pm' });
  const { 
    projects, 
    prdVersions, 
    mvpSpecs, 
    users, 
    builds,
    shareLinks,
    getProjectById, 
    addMvpSpec,
    updatePrdVersion,
    addBuild,
    addShareLink,
    removeShareLink,
    getShareLinksByProject,
    getBuildsByProject
  } = useAppStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();

  const project = projectId ? getProjectById(projectId) : null;
  const projectOwner = project ? users.find(user => user.id === project.ownerId) : null;
  const prd = prdVersions.find(prd => prd.projectId === projectId);
  const mvpSpec = mvpSpecs.find(spec => spec.projectId === projectId);
  const projectBuilds = projectId ? getBuildsByProject(projectId) : [];
  const projectShareLinks = projectId ? getShareLinksByProject(projectId) : [];

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/internal/projects')}>
            Back to Projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleGenerateSpec = async () => {
    if (!prd || !currentUser || !projectId) return;

    setIsGenerating(true);
    try {
      const generatedSpec = await mockAI.generateSpec(prd.content);
      
      // Add MVP spec to store
      addMvpSpec({
        projectId,
        prdVersionId: prd.id,
        title: `${project.name} - MVP Specification`,
        features: generatedSpec.features,
        timeline: generatedSpec.timeline,
        resources: generatedSpec.resources,
        status: 'planning'
      });

      // Update PRD status to approved
      updatePrdVersion(prd.id, { status: 'approved' });
      
    } catch (error) {
      console.error('Error generating spec:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const parsePRDContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { background: content };
    }
  };

  const handleAddBuild = () => {
    if (!previewUrl.trim() || !projectId || !currentUser) return;

    // Create new build
    addBuild({
      projectId,
      mvpSpecId: mvpSpec?.id || '',
      version: `v${projectBuilds.length + 1}.0`,
      status: 'deployed',
      deployUrl: previewUrl.trim()
    });

    setPreviewUrl('');
    toast({
      title: "Build Added",
      description: "Preview build has been created successfully.",
    });
  };

  const handleGenerateShareLink = (buildId: string) => {
    if (!projectId) return;

    addShareLink({
      projectId,
      buildId,
      isPublic: false
    });

    toast({
      title: "Share Link Generated",
      description: "Client review link has been created.",
    });
  };

  const handleRevokeShareLink = (linkId: string) => {
    removeShareLink(linkId);
    toast({
      title: "Share Link Revoked",
      description: "The client review link has been removed.",
      variant: "destructive"
    });
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/client/review/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const prdContent = prd ? parsePRDContent(prd.content) : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/internal/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Project Details & Specifications
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              {currentUser?.role?.toUpperCase()} Portal
            </Badge>
          </div>
        </div>

        {/* Project Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview & PRD</TabsTrigger>
            <TabsTrigger value="spec">MVP Specification</TabsTrigger>
            <TabsTrigger value="builds">Builds & Sharing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Project Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-1">{project.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="mt-1 text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                    <p className="mt-1 font-medium">{projectOwner?.name || 'Unknown Client'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="mt-1 text-sm">{projectOwner?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <Badge variant="outline" className="mt-1">
                      {projectOwner?.role?.toUpperCase() || 'CLIENT'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PRD Section */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Product Requirements Document</CardTitle>
                  </div>
                  {prd && (
                    <Badge className={prdStatusConfig[prd.status]?.color}>
                      {prdStatusConfig[prd.status]?.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {prd ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">{prd.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        Submitted by {projectOwner?.name} on {new Date(prd.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {prdContent && (
                      <div className="space-y-6">
                        {prdContent.background && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Background & Context
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {prdContent.background}
                            </p>
                          </div>
                        )}

                        {prdContent.goals && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Goals & Objectives
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {prdContent.goals}
                            </p>
                          </div>
                        )}

                        {prdContent.features && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Key Features & Requirements
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {prdContent.features}
                            </p>
                          </div>
                        )}

                        {prdContent.constraints && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Constraints & Assumptions
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {prdContent.constraints}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {prd.status === 'review' && !mvpSpec && (
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handleGenerateSpec}
                          disabled={isGenerating}
                          className="bg-gradient-secondary border-0 shadow-glow transition-spring hover:scale-105"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Generating Spec...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-4 w-4 mr-2" />
                              Generate MVP Spec
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No PRD submitted yet</p>
                    <p className="text-sm">Client needs to create and submit a PRD for this project.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MVP Spec Tab */}
          <TabsContent value="spec">
            {mvpSpec ? (
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-accent" />
                      <CardTitle>MVP Specification</CardTitle>
                    </div>
                    <Badge className={mvpStatusConfig[mvpSpec.status]?.color}>
                      {(() => {
                        const IconComponent = mvpStatusConfig[mvpSpec.status]?.icon;
                        return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
                      })()}
                      {mvpStatusConfig[mvpSpec.status]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">{mvpSpec.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      Generated on {new Date(mvpSpec.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {mvpSpec.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Required Resources
                      </h4>
                      <ul className="space-y-2">
                        {mvpSpec.resources.map((resource, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {mvpSpec.timeline}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Rocket className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No MVP Specification</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Generate an MVP specification from the submitted PRD to get started.
                  </p>
                  {prd && prd.status === 'review' && (
                    <Button 
                      onClick={handleGenerateSpec}
                      disabled={isGenerating}
                      className="bg-gradient-secondary border-0 shadow-glow transition-spring hover:scale-105"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Generate MVP Spec
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds" className="space-y-6">
            {/* Add Build Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Add New Build
                </CardTitle>
                <CardDescription>
                  Create a new build with a preview URL for client review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <ShadcnLabel htmlFor="preview-url">Preview URL</ShadcnLabel>
                    <Input
                      id="preview-url"
                      placeholder="https://preview.example.com/project-demo"
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddBuild}
                      disabled={!previewUrl.trim()}
                      className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Add Build
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Builds List */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Project Builds
                </CardTitle>
                <CardDescription>
                  Manage builds and generate client review links
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectBuilds.length > 0 ? (
                  <div className="space-y-4">
                    {projectBuilds.map((build) => {
                      const shareLink = projectShareLinks.find(link => link.buildId === build.id);
                      
                      return (
                        <div key={build.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{build.version}</h4>
                                <Badge variant="outline">
                                  {build.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(build.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Preview URL */}
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Preview URL</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={build.deployUrl || 'No URL'} readOnly className="flex-1" />
                                {build.deployUrl && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(build.deployUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Share Link Management */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="text-sm">
                                {shareLink ? (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <Link className="h-3 w-3" />
                                    Client review link active
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">No client review link</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {shareLink ? (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => copyShareLink(shareLink.token)}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Link
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRevokeShareLink(shareLink.id)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Revoke
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleGenerateShareLink(build.id)}
                                  >
                                    <Share className="h-3 w-3 mr-1" />
                                    Generate Link
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Builds Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Add a preview URL to create your first build for client review.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </div>
  );
}