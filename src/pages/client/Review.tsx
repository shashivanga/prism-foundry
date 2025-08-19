import { useParams } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { FeedbackForm } from '../../components/ui/FeedbackForm';
import { DiffPanel } from '../../components/ui/DiffPanel';
import { compareMvpSpecs } from '../../services/diffUtility';
import { 
  ExternalLink, 
  FileText, 
  Rocket, 
  AlertTriangle,
  Calendar,
  Users,
  Target,
  Sparkles,
  Eye,
  Monitor
} from 'lucide-react';

const ClientReview = () => {
  const { token } = useParams<{ token: string }>();
  const { 
    shareLinks, 
    builds, 
    mvpSpecs, 
    projects,
    addFeedback
  } = useAppStore();

  const shareLink = shareLinks.find(link => link.token === token);
  const build = shareLink ? builds.find(b => b.id === shareLink.buildId) : null;
  const project = shareLink ? projects.find(p => p.id === shareLink.projectId) : null;
  const mvpSpec = shareLink ? mvpSpecs.find(spec => spec.projectId === shareLink.projectId) : null;
  
  // Get previous MVP spec for diff comparison
  const allProjectSpecs = shareLink ? mvpSpecs.filter(spec => spec.projectId === shareLink.projectId) : [];
  const sortedSpecs = allProjectSpecs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const previousSpec = sortedSpecs[1];
  
  // Calculate diff changes
  const diffChanges = mvpSpec && previousSpec ? compareMvpSpecs(previousSpec, mvpSpec) : [];

  const handleFeedbackSubmit = (feedbackData: any) => {
    addFeedback({
      ...feedbackData,
      buildId: build?.id,
      mvpSpecId: mvpSpec?.id,
    });
  };

  if (!shareLink || !build || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
            <p className="text-muted-foreground">This review link is invalid or has been revoked.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">Prototype Preview</h1>
              <p className="text-sm text-muted-foreground">Link works only on this device.</p>
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
        </div>

        {/* Build Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {build.deployUrl ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => window.open(build.deployUrl, '_blank')}
                  className="w-full bg-gradient-primary border-0"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Preview
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No preview URL available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Changes Since Last Version */}
        {diffChanges.length > 0 && (
          <DiffPanel 
            title="Changes Since Last Version"
            changes={diffChanges}
            className="shadow-card"
          />
        )}

        {/* MVP Specification */}
        {mvpSpec && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                MVP Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <ul className="space-y-2">
                    {mvpSpec.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Timeline</h4>
                  <p className="text-sm text-muted-foreground">{mvpSpec.timeline}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Form */}
        <FeedbackForm
          projectId={project.id}
          buildId={build?.id}
          mvpSpecId={mvpSpec?.id}
          clientId="client-temp-id"
          clientName="Client User"
          onSubmit={handleFeedbackSubmit}
        />
      </div>
    </div>
  );
};

export default ClientReview;