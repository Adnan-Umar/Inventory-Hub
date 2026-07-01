import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Save, X, AlertCircle } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/v1/products/${id}`);
        const product = response.data;
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString());
        setQuantity(product.quantity.toString());
      } catch (err) {
        console.error('Error fetching product:', err);
        setApiError('Failed to load product details from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Product name is required';
    
    if (!price) {
      tempErrors.price = 'Price is required';
    } else if (isNaN(price) || Number(price) <= 0) {
      tempErrors.price = 'Price must be a positive number';
    }

    if (quantity === '') {
      tempErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      tempErrors.quantity = 'Quantity must be a non-negative integer';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.put(`/api/v1/products/${id}`, {
        name,
        description,
        price: Number(price),
        quantity: Number(quantity)
      });
      navigate('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      if (err.response?.data?.validationErrors) {
        setErrors(err.response.data.validationErrors);
      }
      setApiError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Edit Product</h1>
          </div>
        </header>

        <div className="page-body animate-fade-in">
          {loading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Loading product details...</div>
          ) : (
            <div className="form-card">
              {apiError && (
                <div className="form-error-alert animate-slide-in">
                  <AlertCircle size={20} />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    id="name"
                    type="text"
                    className="input-control"
                    placeholder="e.g. Wireless Mouse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    className="input-control"
                    placeholder="Product specifications and details..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="e.g. 29.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Stock Quantity *</label>
                  <input
                    id="quantity"
                    type="number"
                    className="input-control"
                    placeholder="e.g. 150"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/products')}
                    disabled={submitting}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    <Save size={18} />
                    <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
