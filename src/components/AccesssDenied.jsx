import React from 'react';
import { Shield, Lock, User } from 'lucide-react';

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Access Restricted
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          This feature is restricted to <span className="font-semibold text-red-600">Super Administrators</span> and <span className="font-semibold text-blue-600">Developers</span> only.
        </p>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Contact Information</span>
          </div>
          <p className="text-sm text-gray-600">
            If you believe you should have access to this feature, please contact your system administrator or the development team.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Go Back
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2025 Lab Management System - Restricted Access
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;