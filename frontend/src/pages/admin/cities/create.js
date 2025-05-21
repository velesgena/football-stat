import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FormLayout from '../../../components/forms/FormLayout';
import { citiesApi } from '../../../services/api';

export default function CreateCityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    population: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Преобразуем население в число, если оно задано
    const processedData = {
      ...formData,
      population: formData.population ? parseInt(formData.population, 10) : null
    };

    try {
      await citiesApi.createCity(processedData);
      router.push('/admin/cities');
    } catch (err) {
      console.error("Ошибка при создании города:", err);
      setError(err.response?.data?.detail || 'Произошла ошибка при создании населенного пункта');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Добавление населенного пункта | Football Stat</title>
      </Head>
      
      <FormLayout 
        title="Добавление населенного пункта"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      >
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
      </FormLayout>
    </>
  );
} 