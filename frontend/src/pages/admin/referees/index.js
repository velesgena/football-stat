import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { refereesApi } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PageNavButtons from '../../../components/ui/PageNavButtons';

const RefereesList = () => {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchReferees = async () => {
    setLoading(true);
    try {
      const data = await refereesApi.getAllReferees();
      setReferees(data);
    } catch (e) {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReferees();
  }, []);

  const handleEdit = (id) => {
    router.push(`/admin/referees/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить судью?')) {
      await refereesApi.deleteReferee(id);
      fetchReferees();
    }
  };

  const handleCreate = () => {
    router.push('/admin/referees/new');
  };

  return (
    <Card>
      <h2>Судьи</h2>
      <PageNavButtons />
      <button
        type="button"
        className="btn btn-primary mb-4"
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        + Добавить судью
      </button>
      {loading ? (
        <div>Загрузка...</div>
      ) : referees.length === 0 ? (
        <div>Судьи отсутствуют</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Телефон</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {referees.map((ref) => (
              <tr key={ref.id}>
                <td>{ref.id}</td>
                <td>{ref.last_name}</td>
                <td>{ref.first_name}</td>
                <td>{ref.patronymic}</td>
                <td>{ref.phone}</td>
                <td>
                  <button onClick={() => handleEdit(ref.id)}>✏️</button>
                  <button onClick={() => handleDelete(ref.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default RefereesList; 