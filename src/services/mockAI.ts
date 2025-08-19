// Mock AI service for generating MVP specifications
import { NormalizedPrd, normalizePrd } from './prdNormalizer';

export interface GeneratedSpec {
  overview: string;
  features: string[];
  tasks: string[];
  risks: string[];
  timeline: string;
  resources: string[];
  technicalConsiderations: string[];
}

export const mockAI = {
  generateSpec: async (prdContent: string): Promise<GeneratedSpec> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Normalize the PRD content
    const normalizedPrd: NormalizedPrd = normalizePrd(prdContent);
    
    // Generate spec based on normalized PRD
    const hasStructuredData = normalizedPrd.features.length > 0 || normalizedPrd.goals.length > 0;
    
    return {
      overview: hasStructuredData 
        ? `Based on the requirements analysis, this MVP will deliver ${normalizedPrd.features.length} core features addressing ${normalizedPrd.goals.length} business objectives. ${normalizedPrd.background || 'The solution will be built with modern web technologies ensuring scalability and maintainability.'}`
        : 'MVP specification generated based on the submitted requirements. This solution will focus on delivering core functionality with modern web technologies.',
      
      features: hasStructuredData && normalizedPrd.features.length > 0
        ? [
            ...normalizedPrd.features.slice(0, 6), // Use PRD features
            'User authentication and account management',
            'Responsive web interface optimized for desktop and mobile',
            'Performance monitoring and analytics setup'
          ]
        : [
            'Core application functionality',
            'User interface and experience design',
            'Data management and storage',
            'User authentication system',
            'Admin management capabilities'
          ],
      
      tasks: hasStructuredData
        ? [
            'Requirements analysis and technical specification',
            'UI/UX design and prototyping',
            'Frontend development and component creation',
            'Backend API development and database setup',
            'Integration testing and quality assurance',
            'Deployment and production configuration',
            'User acceptance testing and feedback integration'
          ]
        : [
            'Project setup and environment configuration',
            'Core functionality implementation',
            'User interface development',
            'Testing and quality assurance',
            'Deployment and launch preparation'
          ],
      
      risks: hasStructuredData && normalizedPrd.constraints.length > 0
        ? [
            ...normalizedPrd.constraints.map(constraint => `Constraint: ${constraint}`),
            'Third-party API dependencies may impact timeline',
            'Complex business logic requirements need clarification',
            'Performance optimization may require additional development time'
          ]
        : [
            'Requirement clarifications may be needed',
            'Integration complexities may arise',
            'Timeline adjustments based on scope changes',
            'User acceptance testing feedback may require feature adjustments'
          ],
      
      timeline: hasStructuredData 
        ? '8-12 weeks development timeline including design, development, testing, and deployment phases'
        : '6-10 weeks development timeline',
      
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
      ]
    };
  }
};