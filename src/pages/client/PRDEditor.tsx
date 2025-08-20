import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { usePRDVersions } from '@/hooks/usePRDVersions';
import { ArrowLeft, FileText, Send, Save } from 'lucide-react';

export default function PRDEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth({ requiredRole: 'client' });
  const { getProjectById } = useProjects();
  const { getLatestPRDVersion, createPRDVersion } = usePRDVersions(projectId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    background: '',
    goals: '',
    features: '',
    nonGoals: '',
    constraints: ''
  });

  const project = projectId ? getProjectById(projectId) : null;
  const existingPRD = projectId ? getLatestPRDVersion(projectId) : null;

  useEffect(() => {
    if (existingPRD) {
      // Parse existing PRD content
      try {
        const content = typeof existingPRD.content_json === 'string' 
          ? JSON.parse(existingPRD.content_json) 
          : existingPRD.content_json;
        setFormData({
          title: `${project?.name || 'Project'} - Product Requirements Document`,
          background: content.background || '',
          goals: content.goals || '',
          features: content.features || '',
          nonGoals: content.nonGoals || '',
          constraints: content.constraints || ''
        });
      } catch {
        // If content is not JSON, treat as plain text
        setFormData(prev => ({
          ...prev,
          title: `${project?.name || 'Project'} - Product Requirements Document`,
          background: existingPRD.content_md || ''
        }));
      }
    } else if (project) {
      setFormData(prev => ({
        ...prev,
        title: `${project.name} - Product Requirements Document`
      }));
    }
  }, [existingPRD, project]);

  if (!project || !currentUser || project.owner_user_id !== currentUser.id) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/client/projects')}>
            Back to Projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleSave = async (submit = false) => {
    if (!currentUser || !projectId) return;

    const actionFn = submit ? setIsSubmitting : setIsSaving;
    actionFn(true);
    
    try {
      const contentJson = {
        background: formData.background,
        goals: formData.goals,
        features: formData.features,
        nonGoals: formData.nonGoals,
        constraints: formData.constraints
      };

      // Create markdown version
      const contentMd = `# ${formData.title}

## Background & Context
${formData.background}

## Goals & Objectives
${formData.goals}

## Key Features & Requirements
${formData.features}

## Non-Goals & Out of Scope
${formData.nonGoals}

## Constraints & Assumptions
${formData.constraints}`;

      const prdData = {
        project_id: projectId,
        content_md: contentMd,
        content_json: contentJson
      };

      await createPRDVersion(prdData);

      if (submit) {
        navigate('/client/projects');
      }
    } catch (error) {
      console.error('Error saving PRD:', error);
    } finally {
      actionFn(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.background.trim() && formData.goals.trim();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/client/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PRD Editor
              </h1>
              <p className="text-muted-foreground mt-1">
                {project.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {existingPRD && (
              <Badge variant="default">
                Version {existingPRD.version}
              </Badge>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Document Title</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Product Requirements Document Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Background */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Background & Context</CardTitle>
              <CardDescription>
                Provide context about the problem, market opportunity, and user needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the problem you're solving, target market, user research insights, and business context..."
                value={formData.background}
                onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                rows={5}
                className="resize-none transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
              <CardDescription>
                Define what success looks like and key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="List your primary and secondary goals, success metrics, and business outcomes you want to achieve..."
                value={formData.goals}
                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                rows={4}
                className="resize-none transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Key Features & Requirements</CardTitle>
              <CardDescription>
                Describe the core functionality and user flows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Detail the main features, user flows, technical requirements, and functionality you want to include..."
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                rows={6}
                className="resize-none transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Non-Goals */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Non-Goals & Out of Scope</CardTitle>
              <CardDescription>
                Clarify what will NOT be included in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="List features, integrations, or functionalities that are explicitly out of scope for this project..."
                value={formData.nonGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, nonGoals: e.target.value }))}
                rows={3}
                className="resize-none transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Constraints & Assumptions</CardTitle>
              <CardDescription>
                Technical, budget, timeline, or other limitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Include budget constraints, technical limitations, timeline requirements, platform preferences, compliance needs..."
                value={formData.constraints}
                onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
                rows={4}
                className="resize-none transition-smooth focus:shadow-glow"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ready to submit?</h3>
                  <p className="text-sm text-muted-foreground">
                    Save your progress or submit for team review to begin spec development.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSave(false)}
                    disabled={isSaving || isSubmitting || !isFormValid}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleSave(true)}
                    disabled={isSaving || isSubmitting || !isFormValid}
                    className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}