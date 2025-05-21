import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTeam, updateTeam, getCities, getStadiums } from '../../../../utils/api';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function EditTeamPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    city_id: '',
    stadium_id: '',
    founded_year: '',
    coach: '',
    description: ''
  });
  const [cities, setCities] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTeam(id).then(data => {
      setForm({
        name: data.name || '',
        logo_url: data.logo_url || '',
        city_id: data.city_id || '',
        stadium_id: data.stadium_id || '',
        founded_year: data.founded_year || '',
        coach: data.coach || '',
        description: data.description || ''
      });
      setLoaded(true);
    });
    getCities().then(setCities);
    getStadiums().then(setStadiums);
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      founded_year: form.founded_year ? parseInt(form.founded_year, 10) : null,
      stadium_id: form.stadium_id || null
    };
    await updateTeam(id, payload);
    setLoading(false);
    router.push('/admin/teams');
  }

  if (!loaded) return <div className="p-8">Загрузка...</div>;

  const breadcrumbsItems = [
    { label: 'Главная', href: '/' },
    { label: 'Администрирование', href: '/admin' },
    { label: 'Команды', href: '/admin/teams' },
    { label: 'Редактирование команды', href: `/admin/teams/edit/${id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbsItems} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать команду</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/teams')}
        >
          Вернуться к списку команд
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input name="name" value={form.name} onChange={handleChange} className="input w-full" placeholder="Название команды*" required />
        <input name="logo_url" value={form.logo_url} onChange={handleChange} className="input w-full" placeholder="URL логотипа" />
        <select name="city_id" value={form.city_id} onChange={handleChange} className="input w-full" required>
          <option value="">Город</option>
          {cities.map(city => <option key={city.id} value={city.id}>{city.name}, {city.country}</option>)}
        </select>
        <select name="stadium_id" value={form.stadium_id} onChange={handleChange} className="input w-full">
          <option value="">Стадион по умолчанию</option>
          {stadiums.map(stadium => <option key={stadium.id} value={stadium.id}>{stadium.name} ({stadium.city?.name})</option>)}
        </select>
        <input name="founded_year" value={form.founded_year} onChange={handleChange} className="input w-full" placeholder="Год основания" />
        <input name="coach" value={form.coach} onChange={handleChange} className="input w-full" placeholder="Тренер" />
        <textarea name="description" value={form.description} onChange={handleChange} className="textarea textarea-bordered h-24 w-full" placeholder="Описание" />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
} 