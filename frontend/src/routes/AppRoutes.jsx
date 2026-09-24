import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { ProjectList } from '../pages/projects/ProjectList';
import { ProjectDetail } from '../pages/projects/ProjectDetail';
import { MyTasks } from '../pages/tasks/MyTasks';
import { TeamsList } from '../pages/teams/TeamsList';
import { IssuesList } from '../pages/issues/IssuesList';
import { ActivityPage } from '../pages/activity/ActivityPage';
import { GlobalReports } from '../pages/reports/GlobalReports';
import { OrganizationSettings } from '../pages/settings/OrganizationSettings';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Workspace Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/teams" element={<TeamsList />} />
        <Route path="/issues" element={<IssuesList />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/reports" element={<GlobalReports />} />
        <Route path="/settings" element={<OrganizationSettings />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
