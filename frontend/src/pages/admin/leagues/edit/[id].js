import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getLeague, updateLeague } from '../../../../utils/api';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function EditLeaguePage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({ name: '', country: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getLeague(id).then(data => {
      setForm({
        name: data.name || '',
        country: data.country || '',
        description: data.description || ''
      });
      setLoaded(true);
    });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await updateLeague(id, form);
    setLoading(false);
    router.push('/admin/leagues');
  }

  if (!loaded) return <div className="p-8">Загрузка...</div>;

  const breadcrumbsItems = [
    { label: 'Главная', href: '/' },
    { label: 'Администрирование', href: '/admin' },
    { label: 'Лиги', href: '/admin/leagues' },
    { label: 'Редактирование лиги', href: `/admin/leagues/edit/${id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbsItems} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать лигу</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/leagues')}
        >
          Вернуться к списку лиг
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input name="name" value={form.name} onChange={handleChange} className="input w-full" placeholder="Название лиги" required />
        <input name="country" value={form.country} onChange={handleChange} className="input w-full" placeholder="Страна" required />
        <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" placeholder="Описание" />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
} 