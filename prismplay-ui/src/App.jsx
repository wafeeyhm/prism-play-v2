import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [repositories, setRepositories] = useState({});
  const [plugins, setPlugins] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [categories, setCategories] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const backendUrl = 'http://localhost:8080';

  const fetchData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/repositories`);
      const data = await res.json();
      setRepositories(data.repositories || {});

      // Flatten all plugins for dropdown selection
      const allPlugins = [];
      Object.values(data.repositories || {}).forEach(list => allPlugins.push(...list));
      setPlugins(allPlugins);

      if (allPlugins.length > 0 && !selectedProvider) {
        setSelectedProvider(allPlugins[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
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
        setMessage(`Successfully loaded repository with ${data.count} providers!`);
        setRepoUrl('');
        fetchData();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Failed to connect to backend: ${err.message}`);
    }
  };

  const fetchHomepage = async (providerName) => {
    setSelectedProvider(providerName);
    try {
      const res = await fetch(`${backendUrl}/api/homepage?provider=${providerName}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch homepage:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedProvider || !searchQuery) return;
    try {
      const res = await fetch(`${backendUrl}/api/search?provider=${selectedProvider}&query=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchHomepage(selectedProvider);
    }
  }, [selectedProvider]);

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          <div className="text-2xl font-black tracking-wider text-sky-400 mb-10 flex items-center gap-2">
            <span>⚡</span> Prism<span className="text-white">Play</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'search', label: 'Search', icon: '🔍' },
              { id: 'library', label: 'Library', icon: '📚' },
              { id: 'settings', label: 'Repositories', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Active Provider</div>
          <div className="text-sm font-bold text-sky-400 truncate">{selectedProvider || 'None Selected'}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Switch Provider:</span>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {plugins.map((p, idx) => (
                <option key={idx} value={p.name}>{p.name} ({p.lang || 'en'})</option>
              ))}
            </select>
          </div>
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Persistent Storage Active
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'home' && (
            <div className="space-y-8">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-200">{cat.categoryName}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {cat.items.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden group hover:border-sky-500/50 transition duration-300 cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-[2/3] bg-slate-950 overflow-hidden">
                          <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <span className="absolute top-2 right-2 text-[10px] font-extrabold uppercase tracking-wider bg-black/70 backdrop-blur-md text-sky-300 px-2 py-0.5 rounded border border-white/10">
                            {item.type}
                          </span>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <h3 className="font-bold text-sm truncate text-white mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-2xl font-black mb-1">Search {selectedProvider}</h1>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, anime..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <button type="submit" className="bg-sky-500 hover:bg-sky-600 px-8 py-3 rounded-xl font-bold text-sm transition cursor-pointer">
                  Search
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {searchResults.map((item) => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-sky-500">
                    <img src={item.poster} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-2" />
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-sky-400 uppercase">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="text-center py-20 space-y-3">
              <div className="text-4xl">📚</div>
              <h2 className="text-xl font-bold">Your Library is Empty</h2>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8">
              <div>
                <h1 className="text-2xl font-black mb-1">Extension Repositories</h1>
                <p className="text-xs text-slate-400">Manage sources just like Cloudstream</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Add Repository URL</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../repo.json"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                  <button onClick={handleInstallRepo} className="bg-sky-500 hover:bg-sky-600 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer">
                    Add Repository
                  </button>
                </div>
                {message && <p className="text-xs text-slate-400">{message}</p>}
              </div>

              {/* Render repositories grouped like Cloudstream screenshot */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Installed Repositories ({Object.keys(repositories).length})</h3>
                {Object.entries(repositories).map(([repoName, providerList], idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-black text-sky-400 text-base">{repoName}</h4>
                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">{providerList.length} Providers</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {providerList.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                          <div>
                            <div className="font-bold text-sm text-white">{p.name}</div>
                            <div className="text-xs text-slate-400">🏴󠁧󠁢󠁥󠁮󠁧󠁿 {p.lang || 'en'} • v{p.version || '1'} • {p.description || 'No description'}</div>
                          </div>
                          <button 
                            onClick={() => { setSelectedProvider(p.name); setActiveTab('home'); }} 
                            className="bg-slate-800 hover:bg-sky-500 text-xs px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                          >
                            Open
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Media Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer z-10">✕</button>
            <div className="flex flex-col sm:flex-row">
              <img src={selectedItem.poster} alt={selectedItem.title} className="w-full sm:w-48 h-64 object-cover" />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-sky-950 text-sky-400 px-2.5 py-1 rounded border border-sky-800 font-bold uppercase tracking-wider inline-block mb-3">
                    {selectedItem.type}
                  </span>
                  <h2 className="text-xl font-black mb-2">{selectedItem.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedItem.description}</p>
                </div>
                <button onClick={() => alert('Stream player ready!')} className="mt-6 bg-sky-500 hover:bg-sky-600 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-sky-500/20 cursor-pointer text-center">
                  ▶ Watch Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}