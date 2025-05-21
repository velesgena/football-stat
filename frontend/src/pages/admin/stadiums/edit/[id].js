import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStadium, updateStadium, getCities } from '../../../../utils/api';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function EditStadiumPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({ name: '', city_id: '', capacity: '', address: '', description: '', photo_url: '' });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStadium(id).then(data => {
      setForm({
        name: data.name || '',
        city_id: data.city_id || '',
        capacity: data.capacity || '',
        address: data.address || '',
        description: data.description || '',
        photo_url: data.photo_url || ''
      });
      setLoaded(true);
    });
    getCities().then(setCities);
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, capacity: form.capacity === '' ? null : parseInt(form.capacity, 10) };
    await updateStadium(id, payload);
    setLoading(false);
    router.push('/admin/stadiums');
  }

  if (!loaded) return <div className="p-8">Загрузка...</div>;

  const breadcrumbsItems = [
    { label: 'Главная', href: '/' },
    { label: 'Администрирование', href: '/admin' },
    { label: 'Стадионы', href: '/admin/stadiums' },
    { label: 'Редактирование стадиона', href: `/admin/stadiums/edit/${id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbsItems} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать стадион</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/stadiums')}
        >
          Вернуться к списку стадионов
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input name="name" value={form.name} onChange={handleChange} className="input w-full" placeholder="Название стадиона" required />
        <select name="city_id" value={form.city_id} onChange={handleChange} className="input w-full" required>
          <option value="">Город</option>
          {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
        <input name="capacity" value={form.capacity} onChange={handleChange} className="input w-full" placeholder="Вместимость" type="number" />
        <input name="address" value={form.address} onChange={handleChange} className="input w-full" placeholder="Адрес" />
        <input name="photo_url" value={form.photo_url} onChange={handleChange} className="input w-full" placeholder="URL фотографии" />
        <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" placeholder="Описание" />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
} 