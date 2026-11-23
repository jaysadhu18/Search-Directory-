import { useEffect, useState } from 'react'
import { FaUser, FaMapMarkerAlt, FaPhone, FaUserPlus, FaSpinner, FaTimes } from 'react-icons/fa'
import './PersonFormModal.css'

const emptyForm = { name: '', address: '', phone: '' }

function PersonFormModal({ open, person, onClose, onSave, isSaving, error }) {
  const [form, setForm] = useState(emptyForm)
  const isEditing = Boolean(person)

  useEffect(() => {
    if (open) {
      setForm(person ? { name: person.name || '', address: person.address || '', phone: person.phone || '' } : emptyForm)
    }
  }, [open, person])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="icon-btn modal-close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <h2>
          <FaUserPlus className="icon-header" />
          {isEditing ? 'Edit Person' : 'Add New Person'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <FaUser className="label-icon" />
              Name *
            </label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              <FaMapMarkerAlt className="label-icon" />
              Address
            </label>
            <div className="input-wrapper textarea-wrapper">
              <FaMapMarkerAlt className="input-icon textarea-icon" />
              <textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows="4"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="label-icon" />
              Phone Number(s)
            </label>
            <div className="input-wrapper">
              <FaPhone className="input-icon" />
              <input
                type="text"
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number(s)"
              />
            </div>
          </div>

          {error && <div className="message error">{error}</div>}

          <button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <FaSpinner className="spinning" />
                Saving...
              </>
            ) : (
              <>
                <FaUserPlus />
                {isEditing ? 'Save Changes' : 'Add Person'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PersonFormModal
