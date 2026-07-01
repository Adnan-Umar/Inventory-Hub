import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Search, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const ProductList = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/v1/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/v1/products/${id}`);
      setSuccessMsg('Product deleted successfully!');
      setProducts(products.filter(p => p.id !== id));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Products</h1>
          </div>
          {isAdmin() && (
            <Link to="/products/new" className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
              <Plus size={18} />
              <span>Add Product</span>
            </Link>
          )}
        </header>

        <div className="page-body animate-fade-in">
          {error && (
            <div className="form-error-alert animate-slide-in">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="form-success-alert animate-slide-in">
              <span>{successMsg}</span>
            </div>
          )}

          <div className="table-card">
            <div className="table-header-bar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button className="icon-btn" title="Refresh products" onClick={fetchProducts}>
                <RefreshCw size={16} />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Fetching inventory items...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>{products.length === 0 ? 'Start by adding a new product to the inventory database.' : 'Try matching a different search term.'}</p>
                {isAdmin() && products.length === 0 && (
                  <Link to="/products/new" className="btn btn-primary" style={{ width: 'auto', marginTop: '10px' }}>
                    <Plus size={18} />
                    <span>Add First Product</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Stock Value</th>
                      {isAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.description || '-'}
                        </td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-success'}`}>
                            {p.quantity} units
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          ${(p.price * p.quantity).toFixed(2)}
                        </td>
                        {isAdmin() && (
                          <td>
                            <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button 
                                className="icon-btn edit-btn" 
                                title="Edit Product"
                                onClick={() => navigate(`/products/edit/${p.id}`)}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="icon-btn delete-btn" 
                                title="Delete Product"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductList;
