// PRD Normalizer utility
export interface NormalizedPrd {
  background: string;
  goals: string[];
  features: string[];
  constraints: string[];
}

export function normalizePrd(prdText: string): NormalizedPrd {
  // Remove common formatting and normalize text
  const cleanText = prdText.replace(/\*\*|__|\*|_/g, '').trim();
  
  // Split into sections
  const sections = cleanText.split(/\n\s*\n/);
  
  // Initialize result
  const result: NormalizedPrd = {
    background: '',
    goals: [],
    features: [],
    constraints: []
  };
  
  // Parse sections based on common PRD patterns
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    if (lowerSection.includes('background') || lowerSection.includes('overview') || lowerSection.includes('context')) {
      result.background = section.replace(/^(background|overview|context):?\s*/i, '').trim();
    } else if (lowerSection.includes('goal') || lowerSection.includes('objective') || lowerSection.includes('purpose')) {
      const goals = extractListItems(section);
      result.goals.push(...goals);
    } else if (lowerSection.includes('feature') || lowerSection.includes('requirement') || lowerSection.includes('functionality')) {
      const features = extractListItems(section);
      result.features.push(...features);
    } else if (lowerSection.includes('constraint') || lowerSection.includes('limitation') || lowerSection.includes('restriction')) {
      const constraints = extractListItems(section);
      result.constraints.push(...constraints);
    }
  }
  
  // Fallback: if no structured content found, extract from full text
  if (!result.background && !result.goals.length && !result.features.length) {
    result.background = sections[0] || prdText.substring(0, 200);
    
    // Extract bullet points and numbered lists
    const allLists = extractListItems(prdText);
    if (allLists.length > 0) {
      // Distribute items based on keywords
      for (const item of allLists) {
        const lowerItem = item.toLowerCase();
        if (lowerItem.includes('goal') || lowerItem.includes('objective')) {
          result.goals.push(item);
        } else if (lowerItem.includes('constraint') || lowerItem.includes('limit')) {
          result.constraints.push(item);
        } else {
          result.features.push(item);
        }
      }
    }
  }
  
  return result;
}

function extractListItems(text: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match bullet points, numbered lists, and dashes
    const listMatch = trimmed.match(/^[-•*]\s+(.+)$/) || 
                     trimmed.match(/^\d+\.\s+(.+)$/) ||
                     trimmed.match(/^[a-zA-Z]\.\s+(.+)$/);
    
    if (listMatch) {
      items.push(listMatch[1].trim());
    }
  }
  
  return items;
}