import { FaUser, FaMapMarkerAlt, FaPhone, FaEdit, FaTrash, FaSpinner, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './PeopleList.css'

function PeopleList({ people, total, page, limit, isLoading, searchActive, onEdit, onDelete, onPageChange }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1)

  if (isLoading) {
    return (
      <div className="card people-list">
        <div className="loading">
          <FaSpinner className="spinning" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="card people-list">
      <div className="people-list-header">
        <FaSearch />
        {total} {total === 1 ? 'person' : 'people'}
        {searchActive ? ' found' : ' in the directory'}
      </div>

      {people.length === 0 && (
        <div className="no-results">
          <FaSearch />
          No one matches that search.
        </div>
      )}

      <div className="results">
        {people.map((person) => (
          <div key={person.id} className="result-item">
            <div className="result-item-main">
              <h3>
                <FaUser className="result-icon" />
                {person.name || 'N/A'}
              </h3>
              <p>
                <FaMapMarkerAlt className="info-icon" />
                <span><strong>Address:</strong> {person.address || 'Not provided'}</span>
              </p>
              <p>
                <FaPhone className="info-icon" />
                <span><strong>Phone Number(s):</strong> {person.phone || 'Not provided'}</span>
              </p>
            </div>
            <div className="result-item-actions">
              <button type="button" className="icon-btn edit-btn" onClick={() => onEdit(person)} aria-label="Edit">
                <FaEdit />
              </button>
              <button type="button" className="icon-btn delete-btn" onClick={() => onDelete(person)} aria-label="Delete">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="icon-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <FaChevronLeft />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            className="icon-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default PeopleList
