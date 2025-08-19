import { DiffChange } from '../../services/diffUtility';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { GitCompare, Plus, Minus, Edit } from 'lucide-react';

interface DiffPanelProps {
  title?: string;
  changes: DiffChange[];
  className?: string;
}

const getChangeIcon = (type: DiffChange['type']) => {
  switch (type) {
    case 'added':
      return <Plus className="h-3 w-3" />;
    case 'removed':
      return <Minus className="h-3 w-3" />;
    case 'modified':
      return <Edit className="h-3 w-3" />;
    default:
      return null;
  }
};

const getChangeBadgeVariant = (type: DiffChange['type']) => {
  switch (type) {
    case 'added':
      return 'default';
    case 'removed':
      return 'destructive';
    case 'modified':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function DiffPanel({ title = "Changes", changes, className }: DiffPanelProps) {
  if (changes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No changes detected</p>
          <p className="text-sm">This version is identical to the previous one.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          {title} ({changes.length} {changes.length === 1 ? 'change' : 'changes'})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getChangeBadgeVariant(change.type)} className="flex items-center gap-1">
                  {getChangeIcon(change.type)}
                  {change.type}
                </Badge>
                <span className="font-medium text-sm">{change.field}</span>
              </div>
              
              <div className="pl-4 space-y-2">
                {change.type === 'modified' && (
                  <>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Minus className="h-3 w-3 text-red-600" />
                        <span className="text-red-700 font-medium text-sm">Before</span>
                      </div>
                      <div className="text-red-600 text-sm font-mono bg-red-100 p-2 rounded">
                        {typeof change.old === 'string' ? (
                          change.old.length > 100 ? `${change.old.substring(0, 100)}...` : change.old
                        ) : (
                          JSON.stringify(change.old, null, 2)
                        )}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="h-3 w-3 text-green-600" />
                        <span className="text-green-700 font-medium text-sm">After</span>
                      </div>
                      <div className="text-green-600 text-sm font-mono bg-green-100 p-2 rounded">
                        {typeof change.new === 'string' ? (
                          change.new.length > 100 ? `${change.new.substring(0, 100)}...` : change.new
                        ) : (
                          JSON.stringify(change.new, null, 2)
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {change.type === 'added' && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-3 w-3 text-green-600" />
                      <span className="text-green-700 font-medium text-sm">Added</span>
                    </div>
                    <div className="text-green-600 text-sm font-mono bg-green-100 p-2 rounded">
                      {typeof change.new === 'string' ? (
                        change.new.length > 100 ? `${change.new.substring(0, 100)}...` : change.new
                      ) : (
                        JSON.stringify(change.new, null, 2)
                      )}
                    </div>
                  </div>
                )}
                
                {change.type === 'removed' && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="h-3 w-3 text-red-600" />
                      <span className="text-red-700 font-medium text-sm">Removed</span>
                    </div>
                    <div className="text-red-600 text-sm font-mono bg-red-100 p-2 rounded">
                      {typeof change.old === 'string' ? (
                        change.old.length > 100 ? `${change.old.substring(0, 100)}...` : change.old
                      ) : (
                        JSON.stringify(change.old, null, 2)
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {index < changes.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}