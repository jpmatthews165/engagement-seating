import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Papa from 'papaparse';

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

  useEffect(() => {
    const parseCSV = (data, isString = false) => {
      Papa.parse(data, {
        download: !isString,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setGuests(results.data);
          setIsLoading(false);
        },
        error: (error) => {
          console.warn('Could not load guests.csv, using fallback data.', error);
          if (!isString) {
            parseCSV(fallbackData, true);
          }
        }
      });
    };

    parseCSV('/guests.csv');
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
    <div className="min-h-screen bg-[#f1ece0] text-[#723332] font-sans flex flex-col items-center justify-center p-4">
      
      {/* Hero Section */}
      <div className="max-w-xl w-full text-center relative z-10">
        <div className="space-y-4">
          {/* New Introductory Text */}
          <p className="tracking-[0.15em] text-xs md:text-sm uppercase text-[#4b483c] font-medium">
            Welcome to the engagement of
          </p>
          {/* Main title updated to Sneha & Josh */}
          <h1 className="font-serif text-6xl md:text-7xl tracking-wide text-[#723332]">
            Sneha & Josh
          </h1>
        </div>

        {/* Search Input Area */}
        <div className="relative w-full max-w-md mx-auto mt-12">
          {/* Instruction for finding seat */}
          <p className="font-serif text-2xl text-[#723332] mb-4">
            Find Your Seat
          </p>

          <div className="relative flex items-center">
            {/* Search icon updated to Accent #4b483c */}
            <Search className="absolute left-4 text-[#4b483c] w-5 h-5" />
            <input
              type="text"
              placeholder={isLoading ? "Loading guest list..." : "Enter your full name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              // Focus ring updated to Accent #4b483c
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 focus:border-[#4b483c] outline-none rounded shadow-sm text-lg transition-all disabled:opacity-50 text-[#723332] placeholder:text-[#723332]/50"
            />
          </div>

          {/* Live Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 shadow-lg rounded max-h-64 overflow-y-auto text-left z-50">
              {searchResults.map((guest, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectGuest(guest)}
                  // Hover effect uses a slight transparency of the accent color for a smooth feel
                  className="w-full text-left px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-[#4b483c]/10 transition-colors"
                >
                  <p className="font-serif text-xl text-[#723332]">{guest.Name}</p>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchTerm.length > 0 && searchResults.length === 0 && !isLoading && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 shadow-lg rounded p-6 text-center z-50">
              <p className="text-[#723332]/70">No guest found matching "{searchTerm}"</p>
              <p className="text-sm mt-1 text-[#4b483c]">Try typing just your first or last name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Household Modal Overlay */}
      {selectedHousehold && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#f1ece0] p-8 md:p-12 rounded shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200 border-t-4 border-[#723332]">
            <button 
              onClick={() => setSelectedHousehold(null)}
              className="absolute top-6 right-6 text-[#723332]/40 hover:text-[#723332] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-[#723332]">
                {selectedHousehold.name}
              </h2>
              {/* Divider updated to Accent #4b483c */}
              <div className="h-px w-16 bg-[#4b483c] mx-auto mt-4"></div>
            </div>

            <div className="space-y-4">
              {selectedHousehold.members.map((member, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-3 border-b border-[#723332]/10 last:border-0"
                >
                  <span className="font-medium text-lg text-[#723332]">{member.Name}</span>
                  <div className="text-right">
                    {/* Table label updated to Accent #4b483c */}
                    <span className="text-sm text-[#4b483c] uppercase tracking-wider block text-xs">Table</span>
                    <span className="font-serif text-2xl text-[#723332]">{member.Table}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <button 
                onClick={() => setSelectedHousehold(null)}
                // Button background is Font #723332, hover is Accent #4b483c
                className="bg-[#723332] text-[#f1ece0] px-8 py-3 tracking-widest uppercase text-xs hover:bg-[#4b483c] transition-colors rounded-sm shadow-md"
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