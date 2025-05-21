import { useState } from 'react';
import { useRouter } from 'next/router';
import { createLeague } from '../../../utils/api';

export default function CreateLeaguePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', country: '', description: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await createLeague(form);
    setLoading(false);
    router.push('/admin/leagues');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Добавить лигу</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input name="name" value={form.name} onChange={handleChange} className="input w-full" placeholder="Название лиги" required />
        <input name="country" value={form.country} onChange={handleChange} className="input w-full" placeholder="Страна" required />
        <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" placeholder="Описание" />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
} 