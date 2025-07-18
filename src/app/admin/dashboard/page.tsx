'use client';
import React from 'react';
import MockProtectedRoute from './MockProtectedRoute';
import AdminDashboard from './AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <MockProtectedRoute requireAdmin>
      <AdminDashboard />
    </MockProtectedRoute>
  );
};

export default AdminDashboardPage;