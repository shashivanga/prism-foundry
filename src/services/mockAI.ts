// Mock AI service for generating MVP specifications
export interface GeneratedSpec {
  overview: string;
  features: string[];
  timeline: string;
  resources: string[];
  technicalConsiderations: string[];
  risks: string[];
}

export const mockAI = {
  generateSpec: async (prdContent: string): Promise<GeneratedSpec> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const prd = JSON.parse(prdContent);
      
      return {
        overview: `Based on the requirements analysis, this MVP will deliver core functionality addressing ${prd.goals ? 'the defined business goals' : 'key user needs'}. The solution will be built with modern web technologies ensuring scalability and maintainability.`,
        
        features: [
          'User authentication and account management',
          'Core feature implementation based on PRD requirements',
          'Responsive web interface optimized for desktop and mobile',
          'Basic admin dashboard for content management',
          'Integration with essential third-party services',
          'Performance monitoring and analytics setup'
        ],
        
        timeline: '8-12 weeks development timeline including design, development, testing, and deployment phases',
        
        resources: [
          '1 Full-stack Developer',
          '1 UI/UX Designer', 
          '1 Project Manager',
          'Quality Assurance Testing',
          'DevOps & Deployment Support'
        ],
        
        technicalConsiderations: [
          'React.js frontend with TypeScript for type safety',
          'Node.js backend with Express.js framework',
          'PostgreSQL database for data persistence',
          'AWS cloud infrastructure for hosting',
          'CI/CD pipeline for automated deployments',
          'Security best practices and data encryption'
        ],
        
        risks: [
          'Third-party API dependencies may impact timeline',
          'Complex business logic requirements need clarification',
          'Performance optimization may require additional development time',
          'User acceptance testing feedback may require feature adjustments'
        ]
      };
    } catch {
      // Fallback for non-JSON content
      return {
        overview: 'MVP specification generated based on the submitted requirements. This solution will focus on delivering core functionality with modern web technologies.',
        
        features: [
          'Core application functionality',
          'User interface and experience design',
          'Data management and storage',
          'User authentication system',
          'Admin management capabilities'
        ],
        
        timeline: '6-10 weeks development timeline',
        
        resources: [
          '1 Full-stack Developer',
          '1 UI/UX Designer',
          '1 Project Manager'
        ],
        
        technicalConsiderations: [
          'Modern web framework implementation',
          'Responsive design for multiple devices',
          'Secure data handling and storage',
          'Performance optimization',
          'Cross-browser compatibility'
        ],
        
        risks: [
          'Requirement clarifications may be needed',
          'Integration complexities may arise',
          'Timeline adjustments based on scope changes'
        ]
      };
    }
  }
};