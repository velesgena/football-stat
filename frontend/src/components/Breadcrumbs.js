import Link from 'next/link';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="text-lg text-gray-500 my-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <span key={index}>
            {isLast ? (
              <span className="text-amber-500">{item.label}</span>
            ) : (
              <>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs; 