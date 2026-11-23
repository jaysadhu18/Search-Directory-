import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa'
import './SearchBar.css'

function SearchBar({ value, onChange, isSearching }) {
  return (
    <div className="search-bar card">
      <div className="input-wrapper">
        <FaSearch className="input-icon" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, address, or phone number..."
          className="search-input"
        />
        {isSearching && <FaSpinner className="search-status spinning" />}
        {!isSearching && value && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
