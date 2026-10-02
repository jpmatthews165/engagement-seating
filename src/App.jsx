import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Papa from 'papaparse';

// Fallback data in case the CSV file isn't found
const fallbackData = `Name,Household,Table
Josh Matthews,The Matthews Family,1
Sneha Patel,The Patel Family,1
Jane Doe,The Doe Family,4
John Doe,The Doe Family,4
Little Timmy Doe,The Doe Family,Kids Table 1`;

export default function App() {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch and Parse the CSV Data
  useEffect(() => {
    const parseCSV = (data, isString = false) => {
      Papa.parse(data, {
        download: !isString, // If it's a file path, download it. If it's the fallback string, don't.
        header: true,
        skipEmptyLines: true, // This prevents blank rows from crashing the app
        complete: (results) => {
          setGuests(results.data);
          setIsLoading(false);
        },
        error: (error) => {
          console.warn('Could not load guests.csv, using fallback data.', error);
          if (!isString) {
            parseCSV(fallbackData, true); // Fallback to hardcoded string
          }
        }
      });
    };

    // Attempt to load from the public folder
    parseCSV('/guests.csv');
  }, []);

  // 2. Live Search Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    const results = guests.filter((guest) => {
      // The "?." (optional chaining) safely handles missing names without crashing
      const guestName = guest.Name?.toLowerCase() || '';
      return guestName.includes(term);
    });

    setSearchResults(results);
  }, [searchTerm, guests]);

  // 3. Handle Selecting a Guest
  const handleSelectGuest = (guest) => {
    // Find everyone in the same household
    const householdMembers = guests.filter(
      (g) => g.Household === guest.Household
    );
    
    setSelectedHousehold({
      name: guest.Household,
      members: householdMembers
    });
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#333333] font-sans flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        <div className="space-y-2">
          <p className="tracking-[0.2em] text-sm uppercase text-[#A89060] font-medium">
            Find Your Seat
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-wide text-[#222222]">
            Josh & Sneha
          </h1>
        </div>

        {/* Search Input Area */}
        <div className="relative w-full max-w-md mx-auto mt-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-[#A89060] w-5 h-5" />
            <input
              type="text"
              placeholder={isLoading ? "Loading guest list..." : "Enter your full name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E5E5] focus:border-[#A89060] outline-none rounded shadow-sm text-lg transition-all disabled:opacity-50"
            />
          </div>

          {/* Live Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-[#E5E5E5] shadow-lg rounded max-h-64 overflow-y-auto text-left z-50">
              {searchResults.map((guest, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectGuest(guest)}
                  className="w-full text-left px-6 py-4 border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAF8F5] transition-colors"
                >
                  <p className="font-serif text-xl text-[#333333]">{guest.Name}</p>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchTerm.length > 0 && searchResults.length === 0 && !isLoading && (
            <div className="absolute w-full mt-2 bg-white border border-[#E5E5E5] shadow-lg rounded p-6 text-center z-50">
              <p className="text-[#666666]">No guest found matching "{searchTerm}"</p>
              <p className="text-sm mt-1 text-[#A89060]">Try typing just your first or last name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Household Modal Overlay */}
      {selectedHousehold && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 md:p-12 rounded shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedHousehold(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-[#333333] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-[#222222]">
                {selectedHousehold.name}
              </h2>
              <div className="h-px w-16 bg-[#A89060] mx-auto mt-4"></div>
            </div>

            <div className="space-y-4">
              {selectedHousehold.members.map((member, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-3 border-b border-[#F5F5F5] last:border-0"
                >
                  <span className="font-medium text-lg">{member.Name}</span>
                  <div className="text-right">
                    <span className="text-sm text-[#A89060] uppercase tracking-wider block text-xs">Table</span>
                    <span className="font-serif text-2xl">{member.Table}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <button 
                onClick={() => setSelectedHousehold(null)}
                className="bg-[#333333] text-white px-8 py-3 tracking-widest uppercase text-xs hover:bg-[#A89060] transition-colors"
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