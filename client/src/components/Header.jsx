import { FaAddressBook, FaUserPlus } from 'react-icons/fa'
import './Header.css'

function Header({ onAddClick }) {
  return (
    <div className="header-container">
      <h1>
        <FaAddressBook />
        Samaj Directory
      </h1>
      <button className="add-person-header-btn" onClick={onAddClick}>
        <FaUserPlus />
        Add Person
      </button>
    </div>
  )
}

export default Header
