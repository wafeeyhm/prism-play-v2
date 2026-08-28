import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [repositories, setRepositories] = useState({});
  const [plugins, setPlugins] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('4K HDHUB');
  const [repoUrl, setRepoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Cloudstream Navigation & Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [itemStatuses, setItemStatuses] = useState({});

  const backendUrl = 'http://localhost:8080';

  // Sample Cloudstream-Style Featured & Feed Data
  const heroItem = {
    id: 'hero-1',
    title: 'BRITANNIA',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    tags: ['1080p', '2160p', 'Action & Adventure', 'Amazon Prime Video', 'Apple TV+', 'Drama', 'English', 'History', 'Sci-Fi & Fantasy', 'SDR'],
    type: 'Series',
    year: '2026',
    rating: '7.8/10.0',
    description: 'Set in 43 AD, the Roman Army - determined and terrified in equal measure - returns to crush the Celtic heart of Britannia - a mysterious land ruled by wild warrior women and powerful druids.'
  };

  const continueWatchingItems = [
    {
      id: 'cw-1',
      title: 'Colony',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
      type: 'Series',
      badge: 'S1 E4',
      status: 'Watching',
      year: '2026',
      rating: '7.4/10.0',
      description: 'In a dystopian near-future Los Angeles, residents live under military occupation by an alien force.'
    },
    {
      id: 'cw-2',
      title: 'Obsession (2026)',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
      type: 'Movie',
      badge: '45m left',
      status: 'Plan to Watch',
      year: '2026',
      rating: '6.9/10.0',
      description: 'A respected London surgeon enters into a dangerous affair with his son\'s fiancée, threatening to unravel everything.'
    },
    {
      id: 'cw-3',
      title: 'The Super Mario Galaxy',
      poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
      type: 'Movie',
      badge: 'E1',
      status: 'Completed',
      year: '2026',
      rating: '8.2/10.0',
      description: 'Mario journeys across the cosmos to save Princess Peach from Bowser\'s interstellar empire.'
    },
    {
      id: 'cw-4',
      title: 'The Whisper Man',
      poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&q=80',
      type: 'Movie',
      badge: 'HD',
      status: 'None',
      year: '2026',
      rating: '5.3/10.0',
      description: 'When his young son vanishes, a widower enlists help from his estranged father, a retired detective who put away the serial killer now linked to the case.'
    }
  ];

  const castMembers = [
    { name: 'Adam Scott', character: 'Tom Kennedy', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
    { name: 'Robert De Niro', character: 'Pete Willis', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    { name: 'Michelle Monaghan', character: 'Amanda Beck', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
    { name: 'Harry Lloyd', character: 'Norman', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' }
  ];

  const watchStatuses = ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch', 'None'];

  const fetchData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/repositories`);
      const data = await res.json();
      setRepositories(data.repositories || {});

      const allPlugins = [];
      Object.values(data.repositories || {}).forEach((list) => allPlugins.push(...list));
      setPlugins(allPlugins);
      if (allPlugins.length > 0 && !selectedProvider) {
        setSelectedProvider(allPlugins[0].name);
      }
    } catch (_err) {}
  };

  const handleInstallRepo = async () => {
    if (!repoUrl) return;
    setMessage('Installing repository...');
    try {
      const res = await fetch(`${backendUrl}/api/plugins/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Loaded repository (${data.count} providers)`);
        setRepoUrl('');
        fetchData();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Failed: ${err.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`${backendUrl}/api/search?provider=${selectedProvider}&query=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const setStatus = (status) => {
    if (selectedItem) {
      setItemStatuses((prev) => ({ ...prev, [selectedItem.id]: status }));
    }
    setStatusModalOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. MEDIA DETAIL SCREEN (Image 2) */}
      {/* ========================================================================= */}
      {selectedItem ? (
        <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0c] relative flex flex-col">
          {/* Top Bar Navigation Icons */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent backdrop-blur-sm">
            <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full hover:bg-zinc-800/60 transition cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex items-center gap-4 text-zinc-300">
              <button className="hover:text-white cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
              <button className="hover:text-white cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
              <button className="hover:text-white cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></button>
              <button className="hover:text-white cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 pb-20 w-full space-y-6">
            {/* Trailer Video Player Card */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center justify-center group">
              <img src={selectedItem.poster} alt={selectedItem.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" />
              <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-white drop-shadow-md">Trailer</div>
              <button onClick={() => alert('Launching video player...')} className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 transition shadow-2xl cursor-pointer">
                <svg className="w-7 h-7 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>

            {/* Title & Metadata Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{selectedItem.title}</h1>
              <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-bold">{selectedProvider}</span>
                <span>{selectedItem.type || 'Movie'}</span>
                <span>{selectedItem.year || '2026'}</span>
                <span className="text-amber-400 font-bold">★ {selectedItem.rating || '5.3/10.0'}</span>
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">{selectedItem.description}</p>

            {/* Cast Row */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Cast</h3>
              <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
                {castMembers.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-shrink-0 text-center w-20">
                    <img src={actor.photo} alt={actor.name} className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 mb-2 shadow-md" />
                    <span className="text-xs font-bold text-white truncate w-full">{actor.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate w-full">{actor.character}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Badges & Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['1080p', '10Bit', 'Crime', 'Drama', 'DV HDR', 'English', 'Hindi', 'Netflix', 'Tamil', 'Telugu'].map((tag, idx) => (
                <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button onClick={() => alert('Starting video stream...')} className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Play Movie
              </button>
              <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
            </div>

            {/* Watch Status Pill (Bottom Right) */}
            <div className="flex justify-end pt-2">
              <button onClick={() => setStatusModalOpen(true)} className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg">
                <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {itemStatuses[selectedItem.id] || 'None'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. HOME CATALOG VIEW (Image 1) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-24 relative">
            {activeTab === 'home' && (
              <>
                {/* Hero Featured Header */}
                <div className="relative w-full h-[62vh] min-h-[420px] bg-zinc-950 flex flex-col justify-end p-8 overflow-hidden">
                  <img src={heroItem.backdrop} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Top Bar Quick Search */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <button onClick={() => setActiveTab('search')} className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-zinc-800 transition cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 border border-white/20 shadow-md"></div>
                  </div>

                  {/* Hero Title & Actions */}
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-pink-500 drop-shadow-lg">{heroItem.title}</h1>
                    <div className="text-[11px] text-zinc-300 font-medium leading-relaxed drop-shadow">
                      {heroItem.tags.join(' • ')}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button onClick={() => { setSelectedItem(heroItem); setStatusModalOpen(true); }} className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 hover:bg-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer">
                        <span>+</span> {itemStatuses[heroItem.id] || 'None'}
                      </button>
                      <button onClick={() => setSelectedItem(heroItem)} className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl text-xs font-black transition shadow-xl cursor-pointer">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> Play
                      </button>
                      <button onClick={() => setSelectedItem(heroItem)} className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 hover:bg-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Info
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Continue Watching Carousel */}
                <div className="px-8 mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Continue Watching</h2>
                    <span className="text-zinc-500 hover:text-white text-sm cursor-pointer">→</span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    {continueWatchingItems.map((item) => (
                      <div key={item.id} onClick={() => setSelectedItem(item)} className="relative flex-shrink-0 w-36 sm:w-44 group cursor-pointer space-y-2">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-sky-500/50 transition">
                          <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center">
                              <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                          {item.badge && (
                            <span className="absolute bottom-2 right-2 text-[10px] font-black bg-black/80 px-2 py-0.5 rounded text-zinc-200 border border-white/10">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Search Tab View */}
            {activeTab === 'search' && (
              <div className="p-8 max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-black">Search Catalog</h1>
                <form onSubmit={handleSearch} className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, TV shows, anime..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
                  />
                  <button type="submit" className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-xl font-bold text-sm transition cursor-pointer">Search</button>
                </form>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {searchResults.map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl cursor-pointer hover:border-sky-500 transition space-y-2">
                      <img src={item.poster} alt={item.title} className="w-full h-44 object-cover rounded-lg" />
                      <h4 className="text-xs font-bold truncate">{item.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repositories Tab View */}
            {activeTab === 'settings' && (
              <div className="p-8 max-w-3xl mx-auto space-y-6">
                <h1 className="text-2xl font-black">Extensions & Repositories</h1>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-zinc-200">Add Repository</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="cloudstreamrepo://..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
                    />
                    <button onClick={handleInstallRepo} className="bg-sky-500 hover:bg-sky-600 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer">Install</button>
                  </div>
                  {message && <p className="text-xs text-zinc-400">{message}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Floating Provider Switcher Pill (Bottom Right of Home) */}
          <div className="fixed bottom-20 right-6 z-20">
            <button onClick={() => setProviderMenuOpen(!providerMenuOpen)} className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl hover:bg-zinc-800 transition cursor-pointer">
              <span>☰</span> {selectedProvider}
            </button>
            {providerMenuOpen && (
              <div className="absolute bottom-12 right-0 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1">
                {plugins.map((p, idx) => (
                  <div key={idx} onClick={() => { setSelectedProvider(p.name); setProviderMenuOpen(false); }} className="px-3 py-2 text-xs hover:bg-zinc-800 rounded-lg cursor-pointer truncate font-medium">
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloudstream Fixed Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-around z-30 px-6">
            {[
              { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { id: 'library', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
              { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 transition cursor-pointer flex flex-col items-center ${activeTab === tab.id ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                </svg>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SET WATCH STATUS BOTTOM SHEET (Image 3) */}
      {/* ========================================================================= */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-[#121318] border-t border-zinc-800 w-full max-w-md rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Grab Handle */}
            <div className="w-10 h-1.5 bg-zinc-600 rounded-full mx-auto mb-2 opacity-60"></div>
            <h3 className="text-base font-bold text-white">Set watch status</h3>

            <div className="space-y-1 pt-2">
              {watchStatuses.map((status) => {
                const isCurrent = (itemStatuses[selectedItem?.id] || 'None') === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatus(status)}
                    className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition cursor-pointer text-left"
                  >
                    <span>{status}</span>
                    {isCurrent && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}