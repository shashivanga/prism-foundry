import { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Separator } from './separator';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  Filter,
  Search
} from 'lucide-react';
import { Feedback } from '../../store/slices/feedbackSlice';

interface FeedbackTableProps {
  feedback: Feedback[];
  onUpdateFeedback: (id: string, updates: Partial<Feedback>) => void;
  onMarkResolved: (id: string, resolvedBy: string, notes?: string) => void;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

const categoryConfig = {
  'feature-request': { label: 'Feature Request', color: 'bg-purple-100 text-purple-800', icon: '💡' },
  bug: { label: 'Bug Report', color: 'bg-red-100 text-red-800', icon: '🐛' },
  question: { label: 'Question', color: 'bg-blue-100 text-blue-800', icon: '❓' },
};

export function FeedbackTable({ feedback, onUpdateFeedback, onMarkResolved }: FeedbackTableProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter feedback based on filters
  const filteredFeedback = feedback.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleMarkResolved = (item: Feedback) => {
    onMarkResolved(item.id, 'current-user-id', notes);
    setNotes('');
    setSelectedFeedback(null);
  };

  const handleStatusChange = (id: string, status: Feedback['status']) => {
    onUpdateFeedback(id, { status });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Client Feedback ({filteredFeedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[150px]">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          {filteredFeedback.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feedback found</p>
              <p className="text-sm">No feedback matches your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon;
                  const categoryEmoji = categoryConfig[item.category].icon;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.clientName}</div>
                          <div className="text-sm text-muted-foreground">Client</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={categoryConfig[item.category].color}>
                          <span className="mr-1">{categoryEmoji}</span>
                          {categoryConfig[item.category].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.status} 
                          onValueChange={(value: Feedback['status']) => handleStatusChange(item.id, value)}
                        >
                          <SelectTrigger className="w-auto">
                            <Badge variant="outline" className={statusConfig[item.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[item.status].label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{item.message}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedFeedback(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Feedback Details</DialogTitle>
                              </DialogHeader>
                              {selectedFeedback && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Client</Label>
                                      <p>{selectedFeedback.clientName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Date</Label>
                                      <p>{selectedFeedback.createdAt.toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Category</Label>
                                      <Badge variant="outline" className={categoryConfig[selectedFeedback.category].color}>
                                        <span className="mr-1">{categoryConfig[selectedFeedback.category].icon}</span>
                                        {categoryConfig[selectedFeedback.category].label}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Status</Label>
                                      <Badge variant="outline" className={statusConfig[selectedFeedback.status].color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig[selectedFeedback.status].label}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Message</Label>
                                    <div className="mt-2 p-3 bg-muted rounded-lg">
                                      <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                                    </div>
                                  </div>

                                  {selectedFeedback.notes && (
                                    <div>
                                      <Label className="text-sm font-medium">Notes</Label>
                                      <div className="mt-2 p-3 bg-muted rounded-lg">
                                        <p className="whitespace-pre-wrap">{selectedFeedback.notes}</p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedFeedback.status !== 'resolved' && (
                                    <div className="space-y-3">
                                      <Separator />
                                      <div>
                                        <Label htmlFor="notes">Resolution Notes</Label>
                                        <Textarea
                                          id="notes"
                                          placeholder="Add notes about how this feedback was addressed..."
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          rows={3}
                                        />
                                      </div>
                                      <Button 
                                        onClick={() => handleMarkResolved(selectedFeedback)}
                                        className="w-full"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Resolved
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}