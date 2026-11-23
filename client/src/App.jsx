import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import PeopleList from './components/PeopleList'
import PersonFormModal from './components/PersonFormModal'
import Toast from './components/Toast'
import { listPeople, addPerson, updatePerson, deletePerson } from './api/people'

const PAGE_SIZE = 50

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [people, setPeople] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [toast, setToast] = useState(null)

  const fetchPeople = useCallback(async (query, pageNum) => {
    try {
      const data = await listPeople({ q: query, page: pageNum, limit: PAGE_SIZE })
      setPeople(data.results)
      setTotal(data.total)
    } catch (error) {
      setToast({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }, [])

  // Reset to page 1 whenever the search term changes, and debounce the fetch.
  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      setPage(1)
      fetchPeople(searchQuery, 1)
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    setIsLoading(true)
    fetchPeople(searchQuery, newPage)
  }

  const refresh = () => fetchPeople(searchQuery, page)

  const openAddModal = () => {
    setEditingPerson(null)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (person) => {
    setEditingPerson(person)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setModalOpen(false)
  }

  const handleSave = async (formData) => {
    setIsSaving(true)
    setFormError('')
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, formData)
        setToast({ type: 'success', text: 'Person updated successfully' })
      } else {
        await addPerson(formData)
        setToast({ type: 'success', text: 'Person added successfully' })
      }
      setModalOpen(false)
      refresh()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (person) => {
    if (!window.confirm(`Delete ${person.name}? This cannot be undone.`)) return
    try {
      await deletePerson(person.id)
      setToast({ type: 'success', text: 'Person deleted successfully' })
      refresh()
    } catch (error) {
      setToast({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="app">
      <Header onAddClick={openAddModal} />

      <p className="tagline">Search and manage your community directory with ease</p>

      <SearchBar value={searchQuery} onChange={setSearchQuery} isSearching={isSearching} />

      <PeopleList
        people={people}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        isLoading={isLoading}
        searchActive={Boolean(searchQuery.trim())}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />

      <PersonFormModal
        open={modalOpen}
        person={editingPerson}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={isSaving}
        error={formError}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default App
