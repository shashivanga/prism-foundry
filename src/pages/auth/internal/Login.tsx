import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store';
import { UserRole } from '@/store/slices/usersSlice';
import { Eye, EyeOff, ArrowLeft, Shield, User, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const roleConfig = {
  pm: {
    label: 'Project Manager',
    icon: User,
    description: 'Manage projects and client relationships',
    color: 'gradient-secondary'
  },
  admin: {
    label: 'Administrator',
    icon: Crown,
    description: 'Full system access and management',
    color: 'gradient-accent'
  }
};

export default function InternalLogin() {
  const navigate = useNavigate();
  const { addUser, login } = useAppStore();
  const { isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    
    // Mock login - create user and session
    const newUser = {
      email: formData.email,
      name: formData.email.split('@')[0],
      role: selectedRole as UserRole,
    };
    
    addUser(newUser);
    const users = useAppStore.getState().users;
    const createdUser = users[users.length - 1];
    
    // Set session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    login(createdUser.id, 'mock-token', expiresAt);
    
    // Navigate based on role
    switch (selectedRole) {
      case 'pm':
      case 'admin':
        navigate('/internal/projects');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="inline-block gradient-border p-[1px] rounded-lg mb-4">
            <Badge className="bg-card border-0 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Internal Access
            </Badge>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
            Team Portal
          </h1>
          <p className="text-muted-foreground">
            Sign in to access internal tools and dashboards
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Internal Sign In</CardTitle>
            <CardDescription className="text-center">
              Select your role and enter credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{config.label}</div>
                              <div className="text-xs text-muted-foreground">{config.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="team@buildflow.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full border-0 shadow-glow transition-spring hover:scale-105 ${
                  selectedRole === 'admin' ? 'bg-gradient-accent' : 'bg-gradient-secondary'
                }`}
              >
                Sign In as {selectedRole ? roleConfig[selectedRole as keyof typeof roleConfig]?.label : 'Team Member'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Need client access?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => navigate('/client/auth/login')}
              >
                Client Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            Demo Mode - Any email/password will work
          </Badge>
        </div>
      </div>
    </div>
  );
}