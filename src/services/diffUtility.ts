// Diff utility for comparing PRD and Spec versions
export interface DiffChange {
  field: string;
  old: any;
  new: any;
  type: 'added' | 'removed' | 'modified';
}

export function compareObjects(oldObj: any, newObj: any, prefix = ''): DiffChange[] {
  const changes: DiffChange[] = [];
  
  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  
  for (const key of allKeys) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];
    
    if (oldValue === undefined && newValue !== undefined) {
      changes.push({
        field: fieldPath,
        old: null,
        new: newValue,
        type: 'added'
      });
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push({
        field: fieldPath,
        old: oldValue,
        new: null,
        type: 'removed'
      });
    } else if (oldValue !== newValue) {
      // Handle arrays
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        const arrayChanges = compareArrays(oldValue, newValue, fieldPath);
        changes.push(...arrayChanges);
      } 
      // Handle objects
      else if (typeof oldValue === 'object' && typeof newValue === 'object' && 
               oldValue !== null && newValue !== null) {
        const nestedChanges = compareObjects(oldValue, newValue, fieldPath);
        changes.push(...nestedChanges);
      }
      // Handle primitives
      else {
        changes.push({
          field: fieldPath,
          old: oldValue,
          new: newValue,
          type: 'modified'
        });
      }
    }
  }
  
  return changes;
}

function compareArrays(oldArray: any[], newArray: any[], fieldPath: string): DiffChange[] {
  const changes: DiffChange[] = [];
  
  // Simple approach: compare array contents
  const oldSet = new Set(oldArray.map(item => JSON.stringify(item)));
  const newSet = new Set(newArray.map(item => JSON.stringify(item)));
  
  // Find added items
  for (const item of newArray) {
    const itemStr = JSON.stringify(item);
    if (!oldSet.has(itemStr)) {
      changes.push({
        field: `${fieldPath}[]`,
        old: null,
        new: item,
        type: 'added'
      });
    }
  }
  
  // Find removed items
  for (const item of oldArray) {
    const itemStr = JSON.stringify(item);
    if (!newSet.has(itemStr)) {
      changes.push({
        field: `${fieldPath}[]`,
        old: item,
        new: null,
        type: 'removed'
      });
    }
  }
  
  return changes;
}

export function comparePrdVersions(oldPrd: any, newPrd: any): DiffChange[] {
  return compareObjects(oldPrd, newPrd);
}

export function compareMvpSpecs(oldSpec: any, newSpec: any): DiffChange[] {
  return compareObjects(oldSpec, newSpec);
}