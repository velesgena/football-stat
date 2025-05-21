import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FormLayout from '../../../components/forms/FormLayout';
import { createEntity } from '../../../utils/formHelpers';
import { getCities, getStadiums } from '../../../utils/api';

export default function CreateTeamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    city_id: '',
    stadium_id: '',
    founded_year: '',
    coach: '',
    description: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [citiesData, stadiumsData] = await Promise.all([
          getCities(),
          getStadiums()
        ]);
        setCities(citiesData);
        setStadiums(stadiumsData);
      } catch (e) {
        setCities([]);
        setStadiums([]);
      }
    }
    fetchData();
  }, []);

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

    const { country, ...payload } = formData;
    const result = await createEntity('teams', payload);

    setIsSubmitting(false);
    
    if (result.success) {
      router.push('/admin/teams');
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Head>
        <title>Добавление команды | Football Stat</title>
      </Head>
      
      <FormLayout 
        title="Добавление новой команды"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      >
        <div className="flex gap-2 mb-4">
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>
            Назад
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/')}> 
            На главную
          </button>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Название команды*</span>
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
            <span className="label-text">URL логотипа</span>
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Город</span>
          </label>
          <select
            name="city_id"
            value={formData.city_id}
            onChange={handleChange}
            className="input input-bordered w-full"
          >
            <option value="">Выберите город</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Стадион по умолчанию</span>
          </label>
          <select
            name="stadium_id"
            value={formData.stadium_id}
            onChange={handleChange}
            className="input input-bordered w-full"
          >
            <option value="">Выберите стадион</option>
            {stadiums.map(stadium => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.name} ({stadium.city?.name})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Год основания</span>
          </label>
          <input
            type="number"
            name="founded_year"
            value={formData.founded_year}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Тренер</span>
          </label>
          <input
            type="text"
            name="coach"
            value={formData.coach}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Описание</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered h-24 w-full"
          />
        </div>
      </FormLayout>
    </>
  );
} 