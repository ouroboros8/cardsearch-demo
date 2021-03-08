import './App.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import debounce from 'debounce';

function Card({score, cardData}) {
  return <div>
    <p>{cardData.title} ({score})</p>
    <p style={{fontSize: "0.7em"}}>{cardData.text}</p>
  </div>
}

function Results({search}) {
  const [fuse, setFuse] = useState(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const options = {
    includeScore: true,
    keys: [
      "title",
      "text",
    ],
  }

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch('https://netrunnerdb.com/api/2.0/public/cards')
      const json = await res.json()

      const fuse = new Fuse(json.data, options)
      setFuse(fuse)
      console.log('Got cards')
    }
    loadData()
  }, [])

  const searchDebounce = useCallback(
    debounce((val) => {
      console.log("Updating fuse search to", val)
      setDebouncedSearch(val)
    }, 200), []
  )
  useEffect(() => searchDebounce(search), [search])

  const results = useMemo(() => {
    return fuse ? fuse.search(debouncedSearch) : []
  }, [debouncedSearch])

  return results.map((result) => {
    const score = Math.round(result.score * 100) / 100
    return <Card key={result.item.code} score={score} cardData={result.item}/>
  })
}

function App() {
  const [search, setSearch] = useState('')
  const handleChange = (event) => {
    // TODO: add debounce
    const newSearch = event.target.value
    setSearch(newSearch)
  }

  return (
    <div className="App" style={{
      display: "grid",
      gridTemplateColumns: "100%",
      gridTemplateAreas: "'searchbar' 'results'"
    }}>
      <form style={{gridArea: "searchbar"}} onSubmit={(event) => event.preventDefault()}>
        <input type="text" value={search} onChange={handleChange}/>
      </form>
      <div style={{gridArea: "results"}} >
        <Results search={search}/>
      </div>
    </div>
  );
}

export default App;
