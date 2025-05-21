import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorMessage({ message, className = '' }) {
  return (
    <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {message || 'Произошла ошибка. Пожалуйста, попробуйте позже.'}
          </p>
        </div>
      </div>
    </div>
  );
} 