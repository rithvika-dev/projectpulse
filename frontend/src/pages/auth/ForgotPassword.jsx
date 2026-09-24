import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    success('Password reset instructions sent to your email.');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-charcoal-900">Reset your password</h3>
        <p className="text-xs text-sand-600 mt-1">
          Enter your registered email address to receive recovery instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center mx-auto text-forest-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-charcoal-700 leading-relaxed">
            If an account exists for <span className="font-semibold">{email}</span>, an email has been dispatched with recovery instructions.
          </p>
          <NavLink to="/login">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="mt-2">
              Back to Sign In
            </Button>
          </NavLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full">
            Send Reset Instructions
          </Button>

          <div className="text-center mt-4">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand-600 hover:text-charcoal-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </NavLink>
          </div>
        </form>
      )}
    </div>
  );
};
