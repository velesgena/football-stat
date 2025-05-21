import Header from './Header';
// import Footer from './Footer';
// import PageNavButtons from '../ui/PageNavButtons';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* <PageNavButtons /> */}
      <main className="flex-grow">{children}</main>
      {/* <Footer /> */}
    </div>
  );
} 