import React, { useState, useEffect } from 'react';
import { XCircleIcon } from '../Icons';

export const PlanModal = ({ isOpen, onClose, onSave, planToEdit }) => {
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name || '');
      setDurationMonths(planToEdit.durationMonths || 1);
      setPrice(planToEdit.price !== undefined ? planToEdit.price : '');
      setDescription(planToEdit.description || '');
    } else {
      setName('');
      setDurationMonths(1);
      setPrice('');
      setDescription('');
    }
    setError('');
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Valid price is required');
      return;
    }
    try {
      onSave({
        name: name.trim(),
        durationMonths: parseInt(durationMonths, 10),
        price: parseFloat(price),
        description: description.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{planToEdit ? 'Edit Membership Plan' : 'Create Membership Plan'}</h3>
          <button className="close-btn" onClick={onClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label>Plan Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly, Quarterly, Yearly"
                required
              />
            </div>

            <div className="form-group">
              <label>Duration (Months) *</label>
              <select
                className="form-select"
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
              >
                <option value={1}>1 Month (Monthly)</option>
                <option value={3}>3 Months (Quarterly)</option>
                <option value={6}>6 Months (Half-Yearly)</option>
                <option value={12}>12 Months (Yearly)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Standard Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 50"
                required
              />
            </div>

            <div className="form-group">
              <label>Plan Description</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief plan benefits summary"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {planToEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

