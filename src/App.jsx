import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

export default function App() {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/guests.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setGuests(results.data);
        setIsLoading(false);
      },
      error: (error) => {
        console.warn('Could not load guests.csv:', error);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    const results = guests.filter((guest) => {
      const guestName = guest.Name?.toLowerCase() || '';
      return guestName.includes(term);
    });

    setSearchResults(results);
  }, [searchTerm, guests]);

  const handleSelectGuest = (guest) => {
    const householdMembers = guests.filter(
      (g) => g.Household === guest.Household
    );
    
    setSelectedHousehold({
      name: guest.Household,
      members: householdMembers
    });
    
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f0] via-[#f1ece0] to-[#e8e1d1] text-[#723332] font-text flex flex-col items-center justify-center p-6 selection:bg-[#723332] selection:text-[#f1ece0]">
      
      <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-subheading tracking-[0.25em] text-sm md:text-base uppercase text-[#4b483c] font-semibold opacity-80">
            Welcome to the engagement of
          </p>
          <h1 className="font-title text-6xl md:text-8xl tracking-tight text-[#723332]">
            Sneha & Josh
          </h1>
        </div>

        {/* Search Area */}
        <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <label className="block font-subheading uppercase tracking-[0.15em] text-xl md:text-2xl text-[#723332] mb-6 text-center">
            Find Your Seat
          </label>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4b483c]/60 w-5 h-5 transition-colors group-focus-within:text-[#723332]" />
            <input
              type="text"
              placeholder={isLoading ? "Loading guest list..." : "Enter your exact full name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-white/40 focus:border-[#723332]/30 outline-none rounded-full shadow-[0_8px_30px_rgb(114,51,50,0.06)] text-lg font-text transition-all disabled:opacity-50 text-[#723332] placeholder:text-[#723332]/40 focus:bg-white focus:shadow-[0_8px_30px_rgb(114,51,50,0.12)]"
            />
          </div>

          {/* Live Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-3 bg-white/95 backdrop-blur-md border border-[#f1ece0] shadow-xl rounded-2xl max-h-[60vh] overflow-y-auto text-left z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {searchResults.map((guest, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectGuest(guest)}
                  className="w-full group flex items-center justify-between px-6 py-4 border-b border-[#f1ece0] last:border-0 hover:bg-[#f8f5f0] transition-colors"
                >
                  <span className="font-text text-xl text-[#723332] group-hover:translate-x-1 transition-transform">
                    {guest.Name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#4b483c] opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchTerm.length > 0 && searchResults.length === 0 && !isLoading && (
            <div className="absolute w-full mt-3 bg-white/95 backdrop-blur-md border border-[#f1ece0] shadow-xl rounded-2xl p-8 text-center z-50 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xl text-[#723332] font-title mb-2">No guest found</p>
              <p className="text-sm font-text text-[#4b483c]/80">Try typing just your first or last name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Household Modal Overlay */}
      {selectedHousehold && (
        <div className="fixed inset-0 bg-[#4b483c]/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-[#fcfbf9]/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full relative border border-white/50 animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setSelectedHousehold(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#f1ece0]/50 text-[#723332]/60 hover:text-[#723332] hover:bg-[#f1ece0] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-10 mt-2">
              <h2 className="font-title text-3xl md:text-4xl text-[#723332]">
                {selectedHousehold.name}
              </h2>
              <div className="h-px w-12 bg-[#723332]/20 mx-auto mt-6"></div>
            </div>

            <div className="space-y-2">
              {selectedHousehold.members.map((member, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-4 px-2 border-b border-[#723332]/10 last:border-0 group hover:bg-[#f1ece0]/30 rounded-lg transition-colors"
                >
                  <span className="font-text font-bold text-lg text-[#4b483c]">{member.Name}</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-subheading text-[10px] text-[#723332]/60 uppercase tracking-[0.2em] font-semibold mb-1">Table</span>
                    <span className="font-title text-3xl text-[#723332] leading-none">{member.Table}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button 
                onClick={() => setSelectedHousehold(null)}
                className="w-full bg-[#723332] text-[#f1ece0] px-8 py-4 font-subheading tracking-[0.2em] uppercase text-xs font-semibold hover:bg-[#5a2322] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}