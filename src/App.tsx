import React, { useState } from 'react'

interface Item {
  name: string
  category: string
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')

  const addItem = () => {
    const newItem: Item = { name, category }
    setItems((prevItems) => [...prevItems, newItem])
    setName('')
    setCategory('')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Workshop Inventory</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={addItem} style={{ marginLeft: '0.5rem' }}>Add</button>
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
