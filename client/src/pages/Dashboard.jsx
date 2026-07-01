import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Package, Hash, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/v1/products');
        const products = response.data;

        const totalProducts = products.length;
        const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

        setStats({
          totalProducts,
          totalStock,
          totalValue
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Could not load inventory metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Dashboard</h1>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Welcome back, <strong>{user?.email}</strong>
          </div>
        </header>

        <div className="page-body animate-fade-in">
          {error && (
            <div className="form-error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Welcome to InventoryHub Control Center</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px' }}>
              From here, you can track stock counts, total asset valuation, and perform CRUD actions on inventory products.
              Standard users have read-only privileges, while administrators have write privileges.
            </p>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Calculating inventory metrics...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total Unique Products</span>
                  <span className="stat-value">{stats.totalProducts}</span>
                </div>
                <div className="stat-icon primary">
                  <Package size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total Items in Stock</span>
                  <span className="stat-value">{stats.totalStock}</span>
                </div>
                <div className="stat-icon secondary">
                  <Hash size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total Stock Valuation</span>
                  <span className="stat-value">
                    ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="stat-icon success">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
