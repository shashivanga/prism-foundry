import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { ArrowLeft, Plus, Lightbulb } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth({ requiredRole: 'client' });
  const { addProject } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    
    try {
      // Create new project
      addProject({
        name: formData.name,
        description: formData.description,
        ownerId: currentUser.id,
        status: 'draft',
        tags: formData.tags.filter(tag => tag.trim() !== '')
      });

      // Navigate back to projects
      navigate('/client/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      addTag(input.value);
      input.value = '';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
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
              New Project
            </h1>
            <p className="text-muted-foreground mt-1">
              Start your development journey
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="gradient-border p-[1px] rounded-lg">
                <div className="bg-card p-2 rounded-lg">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Tell us about your project vision and requirements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., E-commerce Platform, Mobile App, SaaS Dashboard"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="transition-smooth focus:shadow-glow"
                />
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project goals, target audience, key features, and any specific requirements you have in mind..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={5}
                  className="resize-none transition-smooth focus:shadow-glow"
                />
                <p className="text-xs text-muted-foreground">
                  Be as detailed as possible. This helps our team understand your vision better.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Project Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="Press Enter to add tags (e.g., React, E-commerce, Mobile)"
                  onKeyPress={handleTagKeyPress}
                  className="transition-smooth focus:shadow-glow"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add relevant technologies, categories, or keywords to help organize your project.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/client/projects')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                  className="bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="gradient-border p-[1px] rounded-lg">
                <div className="bg-card p-2 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Pro Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific about your target users and their needs</li>
                  <li>• Include any technical preferences or constraints</li>
                  <li>• Mention your timeline and budget expectations</li>
                  <li>• Reference similar apps or websites you admire</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}