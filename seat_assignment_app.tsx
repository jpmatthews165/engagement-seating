import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ChevronRight, Loader2 } from 'lucide-react';

// Lightweight Levenshtein distance for fuzzy matching
const getLevenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[a.length][b.length];
};

const FALLBACK_CSV = `id,name,household,table
1,Eleanor Vance,The Vance Family,Table 1
2,Arthur Vance,The Vance Family,Table 1
3,Little Timmy Vance,The Vance Family,Kids Table A
4,Sarah Miller,The Miller-Smith Family,Table 5
5,David Smith,The Miller-Smith Family,Table 5
6,Chloe Miller-Smith,The Miller-Smith Family,Kids Table B
7,Jonathan Harker,The Harker Family,Table 3
8,Mina Murray,The Harker Family,Table 3
9,Josh Adams,The Happy Couple,Head Table
10,Sneha Patel,The Happy Couple,Head Table`;

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Basic CSV splitting (assuming no commas inside the names/values for this simple implementation)
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    data.push(row);
  }
  return data;
};

export default function EngagementSeatingApp() {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  const searchContainerRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchGuestList = async () => {
      try {
        setIsLoading(true);
        // Attempt to fetch from a real backend endpoint
        const response = await fetch('/api/guests.csv');
        if (!response.ok) {
          throw new Error('Backend not found or inaccessible');
        }
        const csvText = await response.text();
        setGuests(parseCSV(csvText));
      } catch (error) {
        console.warn('Simulated backend fetch failed. Using fallback CSV data.', error);
        // Fallback to hardcoded CSV if backend fetch fails
        setGuests(parseCSV(FALLBACK_CSV));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuestList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || guests.length === 0) return { exact: null, approximate: [] };

    const query = searchQuery.toLowerCase().trim();
    let exactMatch = null;
    const approximateMatches = [];

    guests.forEach((guest) => {
      const guestName = guest.name.toLowerCase();
      
      if (guestName === query) {
        exactMatch = guest;
      } else if (guestName.includes(query)) {
        approximateMatches.push({ guest, score: 0 }); 
      } else {
        const queryWords = query.split(' ');
        const nameWords = guestName.split(' ');
        
        let totalDistance = 0;
        let matchedWords = 0;
        
        queryWords.forEach(qw => {
          let bestWordDist = Infinity;
          nameWords.forEach(nw => {
            const dist = getLevenshteinDistance(qw, nw);
            if (dist < bestWordDist) bestWordDist = dist;
          });
          if (bestWordDist <= Math.max(1, Math.floor(qw.length / 2))) {
             totalDistance += bestWordDist;
             matchedWords++;
          }
        });

        if (matchedWords > 0 && matchedWords === queryWords.length) {
           approximateMatches.push({ guest, score: totalDistance });
        }
      }
    });

    approximateMatches.sort((a, b) => a.score - b.score);

    const filteredApprox = approximateMatches
      .map(m => m.guest)
      .filter(g => !exactMatch || g.id !== exactMatch.id)
      .slice(0, 5); 

    return { exact: exactMatch, approximate: filteredApprox };
  }, [searchQuery, guests]);

  const getHouseholdMembers = (householdName) => {
    return guests.filter(g => g.household === householdName);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap');
        
        .font-heading { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Montserrat', sans-serif; }
        
        body {
          background-color: #FAFAF8;
          color: #2C2C2C;
        }
      `}</style>

      <div className="min-h-screen font-body selection:bg-[#E5DFD3] selection:text-[#2C2C2C] flex flex-col">
        
        {/* Navigation / Header */}
        <nav className="p-8 md:p-12 flex justify-center items-center w-full">
          <h1 className="text-3xl md:text-4xl font-heading font-medium tracking-[0.15em] text-[#2C2C2C] uppercase text-center">
            Josh <span className="text-[#BCA37F] italic lowercase mx-2">&amp;</span> Sneha
          </h1>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 pb-32 text-center w-full max-w-3xl mx-auto">
          <span className="text-[#BCA37F] font-body font-medium tracking-[0.25em] uppercase text-xs mb-6 block animate-in fade-in slide-in-from-bottom-4 duration-700">
            Welcome to our Celebration
          </span>
          <h2 className="text-5xl md:text-7xl mb-8 font-heading font-light text-[#2C2C2C] leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Find Your Seat
          </h2>
          <p className="text-sm md:text-base text-[#555555] mb-16 font-light max-w-xl tracking-wide leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            Please enter your name below to discover your table assignment and join us in celebrating our engagement.
          </p>

          {}
          <div className="w-full relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500" ref={searchContainerRef}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-[#BCA37F] animate-spin" strokeWidth={1.5} />
                ) : (
                  <Search className="h-5 w-5 text-[#A0A0A0] group-focus-within:text-[#BCA37F] transition-colors duration-300" strokeWidth={1.5} />
                )}
              </div>
              <input
                type="text"
                disabled={isLoading}
                className="block w-full pl-14 pr-6 py-4 md:py-5 border-b-2 border-[#E5DFD3] bg-transparent text-lg md:text-xl font-heading focus:border-[#BCA37F] text-[#2C2C2C] placeholder:text-[#A0A0A0] transition-all outline-none disabled:opacity-50"
                placeholder={isLoading ? "Loading guest list..." : "Enter your first and last name..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
              />
            </div>

            {isSearchFocused && searchQuery.trim().length > 0 && !isLoading && (
              <div className="absolute w-full mt-4 bg-white rounded-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[#F0EBE1] z-20 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                
                {searchResults.exact && (
                  <div className="p-2 border-b border-[#F0EBE1]">
                    <div className="px-5 py-3 text-[10px] font-medium text-[#BCA37F] tracking-[0.2em] uppercase">Exact Match</div>
                    <button
                      onClick={() => setSelectedGuest(searchResults.exact)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors duration-300 group"
                    >
                      <div>
                        <div className="font-heading text-xl text-[#2C2C2C] group-hover:text-[#BCA37F] transition-colors">{searchResults.exact.name}</div>
                      </div>
                      <ChevronRight className="text-[#D3D3D3] group-hover:text-[#BCA37F] transition-colors" strokeWidth={1} />
                    </button>
                  </div>
                )}

                {searchResults.approximate.length > 0 && (
                  <div className="p-2">
                    <div className="px-5 py-3 text-[10px] font-medium text-[#A0A0A0] tracking-[0.2em] uppercase">
                      {searchResults.exact ? "Similar Names" : "Did you mean?"}
                    </div>
                    {searchResults.approximate.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => setSelectedGuest(guest)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors duration-300 group"
                      >
                        <div>
                          <div className="font-heading text-xl text-[#2C2C2C] group-hover:text-[#BCA37F] transition-colors">{guest.name}</div>
                        </div>
                        <ChevronRight className="text-[#D3D3D3] group-hover:text-[#BCA37F] transition-colors" strokeWidth={1} />
                      </button>
                    ))}
                  </div>
                )}

                {!searchResults.exact && searchResults.approximate.length === 0 && (
                  <div className="p-10 text-center text-[#555555] font-light">
                    <p className="font-heading text-xl">We couldn't find a matching name.</p>
                    <p className="text-xs tracking-wider uppercase mt-4 text-[#A0A0A0]">Please try searching by first or last name only.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {}
        {selectedGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-[#2C2C2C]/20 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setSelectedGuest(null)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#FAFAF8] shadow-2xl border border-[#F0EBE1] overflow-hidden animate-in zoom-in-[0.98] duration-300 p-1">
              <div className="bg-white p-8 md:p-12 relative h-full w-full border border-[#F0EBE1]">
                
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => setSelectedGuest(null)}
                    className="p-2 text-[#A0A0A0] hover:text-[#BCA37F] transition-colors duration-300"
                  >
                    <X size={24} strokeWidth={1} />
                  </button>
                </div>

                <div className="text-center mt-4">
                  <span className="text-[#BCA37F] font-body font-medium tracking-[0.2em] uppercase text-[10px] mb-4 block">
                    Household Assignment
                  </span>
                  <h3 className="text-3xl md:text-4xl font-heading font-medium text-[#2C2C2C] mb-8 pb-8 border-b border-[#F0EBE1]">
                    {selectedGuest.household}
                  </h3>

                  <div className="space-y-1 text-left max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {getHouseholdMembers(selectedGuest.household).map((member, index) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center justify-between p-4 ${member.id === selectedGuest.id ? 'bg-[#FAFAF8]' : ''} ${index !== 0 ? 'border-t border-[#F0EBE1]/50' : ''}`}
                      >
                        <div>
                          <div className={`font-heading text-xl ${member.id === selectedGuest.id ? 'text-[#BCA37F] italic' : 'text-[#2C2C2C]'}`}>
                            {member.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.1em] text-[#A0A0A0] mb-0.5">Table</div>
                          <div className="text-lg font-heading text-[#2C2C2C]">{member.table}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedGuest(null)}
                    className="mt-12 w-full py-4 bg-[#2C2C2C] hover:bg-[#404040] text-white font-body text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}