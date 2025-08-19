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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Share Your Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as 'feature-request' | 'bug' | 'question')}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please describe your feedback in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !category || !message.trim()}
            className="w-full bg-gradient-primary border-0 shadow-glow transition-spring hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Submitting...
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