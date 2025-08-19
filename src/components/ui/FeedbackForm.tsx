import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Textarea } from './textarea';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { toast } from 'sonner';
import { MessageSquare, Send } from 'lucide-react';

interface FeedbackFormProps {
  projectId: string;
  buildId?: string;
  mvpSpecId?: string;
  clientId: string;
  clientName: string;
  onSubmit: (feedback: {
    projectId: string;
    buildId?: string;
    mvpSpecId?: string;
    category: 'feature-request' | 'bug' | 'question';
    message: string;
    status: 'new';
    clientId: string;
    clientName: string;
  }) => void;
}

const categoryOptions = [
  { value: 'feature-request', label: 'Feature Request', icon: '💡' },
  { value: 'bug', label: 'Bug Report', icon: '🐛' },
  { value: 'question', label: 'Question', icon: '❓' },
] as const;

export function FeedbackForm({ 
  projectId, 
  buildId, 
  mvpSpecId, 
  clientId, 
  clientName, 
  onSubmit 
}: FeedbackFormProps) {
  const [category, setCategory] = useState<'feature-request' | 'bug' | 'question' | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !message.trim()) {
      toast.error('Please select a category and enter a message');
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit({
        projectId,
        buildId,
        mvpSpecId,
        category: category as 'feature-request' | 'bug' | 'question',
        message: message.trim(),
        status: 'new',
        clientId,
        clientName,
      });
      
      // Reset form
      setCategory('');
      setMessage('');
      
      toast.success('Feedback submitted successfully');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card shadow-elevated hover-scale transition-smooth">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 gradient-text">
          <MessageSquare className="h-5 w-5" />
          Share Your Feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground text-balance">
          Help us improve by sharing your thoughts and suggestions
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value as 'feature-request' | 'bug' | 'question')}
            >
              <SelectTrigger 
                aria-label="Select feedback category"
                className="focus-ring transition-smooth"
              >
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent className="z-50">
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span role="img" aria-label={option.label}>{option.icon}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm font-medium">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your feedback in detail. Be specific about what you'd like to see changed or improved..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none focus-ring transition-smooth min-h-[100px]"
              aria-describedby="message-hint"
            />
            <p id="message-hint" className="text-xs text-muted-foreground">
              Provide as much detail as possible to help us understand your needs
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !category || !message.trim()}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90 border-0 shadow-primary transition-spring hover:scale-[1.02] hover:shadow-glow focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby={isSubmitting ? "submit-status" : undefined}
          >
            {isSubmitting ? (
              <>
                <div 
                  className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" 
                  role="status"
                  aria-label="Submitting feedback"
                />
                <span id="submit-status">Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}