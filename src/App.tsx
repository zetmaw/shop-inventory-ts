import React, { useState, useRef } from 'react'

interface Item {
  name: string
  category: string
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addItem = () => {
    if (name && category) {
      setItems((prev) => [...prev, { name, category }])
      setName('')
      setCategory('')
    }
  }

  const exportCSV = () => {
    const headers = ['name', 'category']
    const rows = items.map((item) => [item.name, item.category])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'inventory.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(Boolean)
      const importedItems: Item[] = []

      for (let i = 1; i < lines.length; i++) {
        const [name, category] = lines[i].split(',')
        if (name && category) importedItems.push({ name: name.trim(), category: category.trim() })
      }

      setItems((prev) => [...prev, ...importedItems])
    }

    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>🛠️ Workshop Inventory</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ marginRight: '0.5rem' }}>
            Item Name:
            <input
              type="text"
              placeholder="e.g., Clamps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ marginRight: '0.5rem' }}>
            Category:
            <input
              type="text"
              placeholder="e.g., Tools"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
        </div>

        <button
          onClick={addItem}
          style={{ marginRight: '0.75rem', background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none' }}
        >
          ➕ Add Item
        </button>

        <button
          onClick={exportCSV}
          style={{ marginRight: '0.75rem', background: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none' }}
        >
          ⬆️ Export CSV
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 1rem', border: 'none' }}
        >
          ⬇️ Import CSV
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={importCSV}
        />
      </div>

      <ul>
        {items.map((item, index) => (
          <li key={index}><strong>{item.category}</strong>: {item.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
