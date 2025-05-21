import { useRouter } from 'next/router';

export default function PageNavButtons({ className = '' }) {
  const router = useRouter();
  return (
    <div className={`flex gap-2 mb-4 ${className}`}>
      <button type="button" className="btn btn-outline" onClick={() => router.back()}>
        Назад
      </button>
      <button type="button" className="btn btn-outline" onClick={() => router.push('/')}> 
        На главную
      </button>
    </div>
  );
} 