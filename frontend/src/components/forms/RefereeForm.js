import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { refereesApi } from '../../services/api';
import Card from '../ui/Card';
import PageNavButtons from '../ui/PageNavButtons';

const initialState = {
  last_name: '',
  first_name: '',
  patronymic: '',
  phone: '',
  description: '',
};

const RefereeForm = ({ mode, refereeId }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (mode === 'edit' && refereeId) {
      setLoading(true);
      refereesApi.getRefereeById(refereeId)
        .then((data) => setForm({
          last_name: data.last_name || '',
          first_name: data.first_name || '',
          patronymic: data.patronymic || '',
          phone: data.phone || '',
          description: data.description || '',
        }))
        .catch(() => setError('Ошибка загрузки данных'))
        .finally(() => setLoading(false));
    }
  }, [mode, refereeId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await refereesApi.createReferee(form);
        router.push('/admin/referees');
      } else if (mode === 'edit') {
        await refereesApi.updateReferee(refereeId, form);
        router.push('/admin/referees');
      }
    } catch (e) {
      setError('Ошибка сохранения');
    }
    setLoading(false);
  };

  return (
    <Card>
      <h2>{mode === 'create' ? 'Добавить судью' : 'Редактировать судью'}</h2>
      <PageNavButtons onBack={() => router.push('/admin/referees')} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Фамилия*<br />
              <input name="last_name" value={form.last_name} onChange={handleChange} required maxLength={50} />
            </label>
          </div>
          <div>
            <label>Имя*<br />
              <input name="first_name" value={form.first_name} onChange={handleChange} required maxLength={50} />
            </label>
          </div>
          <div>
            <label>Отчество<br />
              <input name="patronymic" value={form.patronymic} onChange={handleChange} maxLength={50} />
            </label>
          </div>
          <div>
            <label>Телефон<br />
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={30} />
            </label>
          </div>
          <div>
            <label>Описание<br />
              <textarea name="description" value={form.description} onChange={handleChange} maxLength={500} />
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading}>
              {mode === 'create' ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default RefereeForm; 