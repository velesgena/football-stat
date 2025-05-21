import Link from 'next/link';

export default function Card({ title, subtitle, content, footer, link, className = '', onClick, children }) {
  const cardContent = (
    <div className={`card hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="text-xl font-semibold">{title}</h3>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
      )}
      
      {content && <div className="mt-4">{content}</div>}
      
      {children && <div className="mt-4">{children}</div>}
      
      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );

  if (link) {
    return <Link href={link}>{cardContent}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick} className="cursor-pointer">{cardContent}</div>;
  }

  return cardContent;
} 