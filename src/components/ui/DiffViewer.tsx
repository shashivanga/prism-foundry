import { DiffChange } from '../../services/diffUtility';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { GitCompare } from 'lucide-react';

interface DiffViewerProps {
  changes: DiffChange[];
  title?: string;
}

export function DiffViewer({ changes, title = "Changes" }: DiffViewerProps) {
  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No changes detected
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          {title} ({changes.length} changes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change, index) => (
            <div key={index} className="border-l-2 border-muted pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                  change.type === 'added' ? 'default' :
                  change.type === 'removed' ? 'destructive' : 'secondary'
                }>
                  {change.type}
                </Badge>
                <span className="font-medium text-sm">{change.field}</span>
              </div>
              
              {change.type === 'modified' && (
                <div className="space-y-2">
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <span className="text-red-700 font-medium">Before:</span>
                    <div className="text-red-600 text-sm mt-1 font-mono">
                      {typeof change.old === 'string' ? change.old : JSON.stringify(change.old, null, 2)}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <span className="text-green-700 font-medium">After:</span>
                    <div className="text-green-600 text-sm mt-1 font-mono">
                      {typeof change.new === 'string' ? change.new : JSON.stringify(change.new, null, 2)}
                    </div>
                  </div>
                </div>
              )}
              
              {change.type === 'added' && (
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <span className="text-green-700 font-medium">Added:</span>
                  <div className="text-green-600 text-sm mt-1 font-mono">
                    {typeof change.new === 'string' ? change.new : JSON.stringify(change.new, null, 2)}
                  </div>
                </div>
              )}
              
              {change.type === 'removed' && (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <span className="text-red-700 font-medium">Removed:</span>
                  <div className="text-red-600 text-sm mt-1 font-mono">
                    {typeof change.old === 'string' ? change.old : JSON.stringify(change.old, null, 2)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}