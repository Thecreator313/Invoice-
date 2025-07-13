import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';

const SplashScreen = () => (
  <div className="fixed inset-0 bg-base-100 flex flex-col justify-center items-center z-50 animate-fadeOut">
    <h1 className="text-5xl font-bold text-content-100 tracking-wider">OZONE</h1>
    <p className="text-2xl text-secondary font-light">GRAPHICS</p>
  </div>
);

// --- Icons for Bottom Navigation ---
const HomeIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>);
const PlusIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>);


const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/create', label: 'New Invoice', icon: PlusIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-base-200 border-t border-base-300 flex justify-around items-center max-w-3xl mx-auto rounded-t-2xl">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link to={item.path} key={item.path} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${isActive ? 'text-primary' : 'text-content-200 hover:text-content-100'}`}>
            <item.icon className="w-7 h-7" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      <main className="max-w-3xl mx-auto p-4 pb-28 min-h-screen">{children}</main>
      <BottomNav />
    </div>
);


const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateInvoice />} />
              <Route path="/invoice/:id" element={<ViewInvoice />} />
            </Routes>
          </Layout>
        </HashRouter>
      )}
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fadeOut {
          animation: fadeOut 0.5s ease-out 2.5s forwards;
        }
      `}</style>
    </>
  );
};

export default App;