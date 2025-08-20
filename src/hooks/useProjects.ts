import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Fetch projects
  const fetchProjects = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const createProject = async (projectData: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at' | 'owner_user_id'>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          owner_user_id: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
        return null;
      }

      // Add to local state
      setProjects(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update project
  const updateProject = async (id: string, updates: ProjectUpdate) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
        return null;
      }

      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === id ? data : project
      ));

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get user's projects
  const getUserProjects = () => {
    if (!currentUser) return [];
    return projects.filter(project => project.owner_user_id === currentUser.id);
  };

  // Get project by ID
  const getProjectById = (id: string) => {
    return projects.find(project => project.id === id);
  };

  // Load projects when user changes
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [currentUser]);

  return {
    projects,
    userProjects: getUserProjects(),
    loading,
    createProject,
    updateProject,
    getProjectById,
    refetch: fetchProjects,
  };
}