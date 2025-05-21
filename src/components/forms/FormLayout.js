import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FormLayout({ 
  title, 
  children, 
  onSubmit, 
  onCancel, 
  isSubmitting = false, 
  error = null,
  successMessage = null
}) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(!!successMessage);
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Ошибка! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {showSuccess && successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Успешно! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
} 