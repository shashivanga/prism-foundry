import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { 
  AlertTriangle, 
  ExternalLink, 
  Eye, 
  FileText, 
  Rocket, 
  CheckCircle,
  ArrowLeft,
  Monitor,
  Calendar,
  User
} from 'lucide-react';

export default function ClientReview() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { 
    shareLinks, 
    builds, 
    projects, 
    mvpSpecs, 
    prdVersions,
    users,
    getShareLinkByToken,
    getBuildById,
    getProjectById
  } = useAppStore();

  const shareLink = token ? getShareLinkByToken(token) : null;
  const build = shareLink ? getBuildById(shareLink.buildId) : null;
  const project = shareLink ? getProjectById(shareLink.projectId) : null;
  const mvpSpec = shareLink ? mvpSpecs.find(spec => spec.projectId === shareLink.projectId) : null;
  const prd = shareLink ? prdVersions.find(prd => prd.projectId === shareLink.projectId) : null;
  const projectOwner = project ? users.find(user => user.id === project.ownerId) : null;

  // 404 if token not found
  if (!shareLink || !build || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
        <Card className="max-w-md shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
            <p className="text-muted-foreground text-center mb-6">
              This review link is invalid or has been revoked.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsePRDContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { background: content };
    }
  };

  const prdContent = prd ? parsePRDContent(prd.content) : null;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold text-foreground">Prototype Preview</h1>
              <p className="text-sm text-muted-foreground">
                This review link works only on this device and can be revoked at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Project Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            {project.name}
          </h1>
          <p className="text-muted-foreground mb-4">{project.description}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Build: {build.version}</span>
            <span>•</span>
            <span>Created: {new Date(build.createdAt).toLocaleDateString()}</span>
            {projectOwner && (
              <>
                <span>•</span>
                <span>Client: {projectOwner.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <CardTitle>Live Preview</CardTitle>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {build.status}
              </Badge>
            </div>
            <CardDescription>
              Interactive prototype of your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {build.deployUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium mb-1">Preview URL</div>
                    <div className="text-sm text-muted-foreground font-mono break-all">
                      {build.deployUrl}
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.open(build.deployUrl, '_blank')}
                    className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Preview
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-full">
                    <Eye className="h-3 w-3" />
                    Click the button above to view your prototype in a new tab
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No preview URL available for this build.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MVP Specification Snapshot */}
        {mvpSpec && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-accent" />
                MVP Specification Snapshot
              </CardTitle>
              <CardDescription>
                Technical specification and feature overview for this build
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {mvpSpec.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Development Resources
                  </h4>
                  <ul className="space-y-2">
                    {mvpSpec.resources.map((resource, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Development Timeline
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {mvpSpec.timeline}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original Requirements */}
        {prd && prdContent && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Original Requirements
              </CardTitle>
              <CardDescription>
                Your original project requirements that guided this development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {prdContent.background && (
                <div>
                  <h4 className="font-medium mb-2">Background & Context</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {prdContent.background}
                  </p>
                </div>
              )}

              {prdContent.goals && (
                <div>
                  <h4 className="font-medium mb-2">Goals & Objectives</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {prdContent.goals}
                  </p>
                </div>
              )}

              {prdContent.features && (
                <div>
                  <h4 className="font-medium mb-2">Requested Features</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {prdContent.features}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <div className="inline-flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full">
            <Eye className="h-3 w-3" />
            Confidential prototype preview • For review purposes only
          </div>
        </div>
      </div>
    </div>
  );
}