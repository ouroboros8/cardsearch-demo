import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import elasticlunr from 'elasticlunr';
import debounce from 'debounce';

function Card({score, cardData}) {
  return <div>
    <p>{cardData.title}</p>
    <p style={{fontSize: "0.6em"}}>{cardData.text}</p>
  </div>
}

function Results({search}) {
  // TODO debounce index search
  const [index, setIndex] = useState(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch('https://netrunnerdb.com/api/2.0/public/cards')
      const json = await res.json()

      const index = elasticlunr(function () {
        this.addField("title")
        this.addField("text")
        this.setRef("code")
      })
      json.data.forEach((card) => {
        index.addDoc(card)
      })
      setIndex(index)
      console.log('Got cards')
    }
    loadData()
  }, [])

  const searchDebounce = useCallback(
    debounce((val) => {
      console.log("updating search to", val)
      setDebouncedSearch(val)
    }, 200), []
  )
  useEffect(() => searchDebounce(search), [search])

  const results = index ? index.search(debouncedSearch, {
    fields: {
      text: {
        boost: 2,
        expand: true,
      },
      title: {
        boost: 1,
        expand: true,
      },
      bool: 'AND',
    }
  }) : []

  return results.map((result) => {
    const score = Math.round(result.score * 100) / 100
    const cardData = index.documentStore.getDoc(result.ref)
    return <Card key={cardData.code} score={score} cardData={cardData}/>
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
    <div className="App">
      <header className="App-header">
        <form onSubmit={(event) => event.preventDefault()}>
          <input type="text" value={search} onChange={handleChange}/>
        </form>
        <Results search={search}/>
      </header>
    </div>
  );
}

export default App;
