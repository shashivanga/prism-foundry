import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PRDVersion = Database['public']['Tables']['prd_versions']['Row'];
type PRDVersionInsert = Database['public']['Tables']['prd_versions']['Insert'];

export function usePRDVersions(projectId?: string) {
  const [prdVersions, setPrdVersions] = useState<PRDVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Fetch PRD versions
  const fetchPRDVersions = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('prd_versions')
        .select('*')
        .order('version', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching PRD versions:', error);
        toast({
          title: "Error",
          description: "Failed to load PRD versions",
          variant: "destructive",
        });
        return;
      }

      setPrdVersions(data || []);
    } catch (error) {
      console.error('Error fetching PRD versions:', error);
      toast({
        title: "Error",
        description: "Failed to load PRD versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create PRD version
  const createPRDVersion = async (prdData: Omit<PRDVersionInsert, 'id' | 'created_at' | 'created_by' | 'version'>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a PRD",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Get the next version number
      const existingVersions = prdVersions.filter(prd => prd.project_id === prdData.project_id);
      const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version)) + 1 : 1;

      const { data, error } = await supabase
        .from('prd_versions')
        .insert([{
          ...prdData,
          version: nextVersion,
          created_by: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating PRD version:', error);
        toast({
          title: "Error",
          description: "Failed to create PRD version",
          variant: "destructive",
        });
        return null;
      }

      // Add to local state
      setPrdVersions(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: `PRD version ${nextVersion} created successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating PRD version:', error);
      toast({
        title: "Error",
        description: "Failed to create PRD version",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get latest PRD version for a project
  const getLatestPRDVersion = (projectId: string) => {
    const projectVersions = prdVersions.filter(prd => prd.project_id === projectId);
    return projectVersions.length > 0 ? projectVersions[0] : null; // Already sorted by version desc
  };

  // Get PRD versions for a project
  const getProjectPRDVersions = (projectId: string) => {
    return prdVersions.filter(prd => prd.project_id === projectId);
  };

  // Load PRD versions when user changes
  useEffect(() => {
    if (currentUser) {
      fetchPRDVersions();
    } else {
      setPrdVersions([]);
      setLoading(false);
    }
  }, [currentUser, projectId]);

  return {
    prdVersions,
    loading,
    createPRDVersion,
    getLatestPRDVersion,
    getProjectPRDVersions,
    refetch: fetchPRDVersions,
  };
}