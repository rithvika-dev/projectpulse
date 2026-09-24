import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { User, Mail, Lock, Building2, UserPlus } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'organization_admin',
    organizationName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);

    if (result.success) {
      success('Workspace created successfully!');
      navigate('/dashboard');
    } else {
      error(result.message || 'Registration failed');
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-charcoal-900">Create your Workspace</h3>
        <p className="text-xs text-sand-600 mt-1">
          Setup your Agile team collaboration suite in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Elena Rostova"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Password (min 6 characters)"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Input
          label="Organization / Company Name"
          placeholder="e.g. NovaWorks Enterprises"
          icon={Building2}
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          required
        />

        <Select
          label="Your Primary Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { value: 'organization_admin', label: 'Organization Admin (Full Access)' },
            { value: 'project_manager', label: 'Project Manager' },
            { value: 'team_lead', label: 'Team Lead' },
            { value: 'developer', label: 'Developer / Team Member' },
            { value: 'stakeholder', label: 'Stakeholder (Read Only)' },
          ]}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={UserPlus}
        >
          Create Workspace & Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-sand-600">
        Already have an account?{' '}
        <NavLink to="/login" className="font-semibold text-forest-600 hover:text-forest-700">
          Sign In
        </NavLink>
      </p>
    </div>
  );
};
