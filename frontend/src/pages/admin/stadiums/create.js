import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createStadium, getCities } from '../../../utils/api';

export default function CreateStadiumPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', city_id: '', capacity: '', address: '', description: '', photo_url: '' });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCities().then(setCities);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, capacity: form.capacity === '' ? null : parseInt(form.capacity, 10) };
    await createStadium(payload);
    setLoading(false);
    router.push('/admin/stadiums');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Добавить стадион</h1>
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