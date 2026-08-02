import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, RotateCcw, Search, Sparkles } from 'lucide-react'

const API_URL = 'https://rickandmortyapi.com/api/character'
const INITIAL_FILTERS = { name: '', status: '', species: '', gender: '' }

const statusText = { Alive: 'Vivo', Dead: 'Muerto', unknown: 'Desconocido' }
const genderText = { Female: 'Femenino', Male: 'Masculino', Genderless: 'Sin género', unknown: 'Desconocido' }

function CharacterCard({ character }) {
  const statusClass = character.status.toLowerCase()

  return (
    <article className="character-card">
      <div className="image-wrap">
        <img src={character.image} alt={character.name} loading="lazy" />
        <span className={`status ${statusClass}`}>
          <i /> {statusText[character.status] || character.status}
        </span>
      </div>
      <div className="card-content">
        <p className="eyebrow">#{String(character.id).padStart(3, '0')}</p>
        <h2>{character.name}</h2>
        <p className="species">{character.species} · {genderText[character.gender] || character.gender}</p>
        <div className="location">
          <MapPin size={16} aria-hidden="true" />
          <div><span>Última ubicación</span><strong>{character.location.name}</strong></div>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [query, setQuery] = useState(INITIAL_FILTERS)
  const [characters, setCharacters] = useState([])
  const [info, setInfo] = useState({ pages: 0, count: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(page) })
    Object.entries(query).forEach(([key, value]) => value && params.set(key, value))

    setLoading(true)
    setError('')
    fetch(`${API_URL}?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) return { results: [], info: { pages: 0, count: 0 } }
        if (!response.ok) throw new Error('No pudimos conectar con el multiverso.')
        return response.json()
      })
      .then((data) => {
        setCharacters(data.results)
        setInfo(data.info)
      })
      .catch((err) => err.name !== 'AbortError' && setError(err.message))
      .finally(() => !controller.signal.aborted && setLoading(false))

    return () => controller.abort()
  }, [query, page])

  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  const applyFilters = (event) => {
    event.preventDefault()
    setPage(1)
    setQuery(filters)
  }
  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setQuery(INITIAL_FILTERS)
    setPage(1)
  }

  return (
    <main>
      <header className="hero">
        <nav><span className="logo"><Sparkles size={20} /> RM</span><a href="https://rickandmortyapi.com/" target="_blank" rel="noreferrer">Sobre la API</a></nav>
        <div className="hero-copy">
          <p className="kicker">Wubba Lubba Dub Dub!</p>
          <h1>Explora el <em>multiverso</em></h1>
          <p>Encuentra a tus personajes favoritos entre infinitas dimensiones.</p>
        </div>
      </header>

      <section className="content">
        <form className="filters" onSubmit={applyFilters}>
          <label className="search-field"><span>Buscar personaje</span><div><Search size={18} /><input name="name" value={filters.name} onChange={updateFilter} placeholder="Ej. Rick, Morty, Summer..." /></div></label>
          <label><span>Estado</span><select name="status" value={filters.status} onChange={updateFilter}><option value="">Todos</option><option value="alive">Vivo</option><option value="dead">Muerto</option><option value="unknown">Desconocido</option></select></label>
          <label><span>Especie</span><input name="species" value={filters.species} onChange={updateFilter} placeholder="Ej. Human, Alien..." /></label>
          <label><span>Género</span><select name="gender" value={filters.gender} onChange={updateFilter}><option value="">Todos</option><option value="female">Femenino</option><option value="male">Masculino</option><option value="genderless">Sin género</option><option value="unknown">Desconocido</option></select></label>
          <button className="primary" type="submit"><Search size={18} /> Buscar</button>
          <button className="reset" type="button" onClick={resetFilters} title="Limpiar filtros"><RotateCcw size={19} /></button>
        </form>

        <div className="results-heading">
          <div><p className="kicker">Archivo interdimensional</p><h2>{loading ? 'Abriendo portales...' : `${info.count} personajes encontrados`}</h2></div>
          {info.pages > 0 && <span>Página {page} de {info.pages}</span>}
        </div>

        {error && <div className="message">{error}<button onClick={() => setQuery({ ...query })}>Reintentar</button></div>}
        {!loading && !error && characters.length === 0 && <div className="empty"><Sparkles size={32} /><h2>No encontramos a nadie</h2><p>Prueba con otros filtros o limpia la búsqueda.</p><button onClick={resetFilters}>Limpiar filtros</button></div>}
        <div className="grid" aria-live="polite">
          {loading ? Array.from({ length: 8 }, (_, i) => <div className="skeleton" key={i} />) : characters.map((character) => <CharacterCard key={character.id} character={character} />)}
        </div>

        {!loading && info.pages > 1 && <div className="pagination">
          <button disabled={page === 1} onClick={() => { setPage((p) => p - 1); scrollTo({ top: 300, behavior: 'smooth' }) }}><ChevronLeft size={19} /> Anterior</button>
          <span>{page} / {info.pages}</span>
          <button disabled={page === info.pages} onClick={() => { setPage((p) => p + 1); scrollTo({ top: 300, behavior: 'smooth' }) }}>Siguiente <ChevronRight size={19} /></button>
        </div>}
      </section>
      <footer>Datos proporcionados por The Rick and Morty API · Proyecto educativo</footer>
    </main>
  )
}
