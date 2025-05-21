import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getCity } from '../../../../utils/api';
import { updateEntity } from '../../../../utils/formHelpers';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function EditCityPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    population: ''
  });

  useEffect(() => {
    const fetchCityData = async () => {
      if (!id) return;
      
      try {
        const cityData = await getCity(id);
        setFormData({
          name: cityData.name,
          country: cityData.country,
          population: cityData.population || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных населенного пункта');
        setLoading(false);
      }
    };

    fetchCityData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);
    setError(null);

    const result = await updateEntity('cities', id, formData);

    setIsSubmitting(false);
    
    if (result.success) {
      router.push('/admin/cities');
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const breadcrumbsItems = [
    { label: 'Главная', href: '/' },
    { label: 'Администрирование', href: '/admin' },
    { label: 'Населенные пункты', href: '/admin/cities' },
    { label: 'Редактирование населенного пункта', href: `/admin/cities/edit/${id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbsItems} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать населенный пункт</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/cities')}
        >
          Вернуться к списку населенных пунктов
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Название*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Страна*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Население</span>
          </label>
          <input
            type="number"
            name="population"
            value={formData.population}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        
        {error && <div className="text-error">{error}</div>}
        
        <button 
          type="submit" 
          className="btn btn-primary mt-4" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
} 