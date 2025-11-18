'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Match } from '@/types'
import CricketScoreboard from './CricketScoreboard'
import { database } from '@/config/firebase'
import { ref, get, onValue, off } from 'firebase/database'
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Eye,
  Filter,
  Search,
  Download
} from 'lucide-react'

interface MatchHistoryProps {
  user: any
}

export default function MatchHistory({ user }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Test Firebase connection by accessing a public path
  const testFirebaseConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing Firebase connection...')
      
      // Test database connection by reading a public path
      const testRef = ref(database, 'public/test_connection')
      await get(testRef)
      
      console.log('Firebase connection test successful')
      return true
    } catch (error: unknown) {
      console.error('Firebase connection test failed:', error)
      return false
    }
  }

  const [isLoading, setIsLoading] = useState(true);

  const loadFromLocalStorage = () => {
    console.log('Attempting to load matches from localStorage...');
    try {
      const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
      console.log(`Successfully loaded ${savedMatches.length} matches from localStorage`);
      
      // Validate the loaded data
      if (Array.isArray(savedMatches)) {
        console.log('LocalStorage data validation: OK');
        setMatches(savedMatches);
        setFilteredMatches(savedMatches);
        return savedMatches;
      } else {
        console.warn('Invalid data format in localStorage, using empty array');
        const emptyMatches: Match[] = [];
        setMatches(emptyMatches);
        setFilteredMatches(emptyMatches);
        return emptyMatches;
      }
    } catch (localError) {
      console.error('Error loading from localStorage:', {
        error: localError,
        message: localError instanceof Error ? localError.message : 'Unknown error'
      });
      const emptyMatches: Match[] = [];
      setMatches(emptyMatches);
      setFilteredMatches(emptyMatches);
      return emptyMatches;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('Starting to load match data...');
      
      try {
        // First check Firebase connection
        console.log('Testing Firebase connection...');
        const isConnected = await testFirebaseConnection();
        
        if (!isConnected) {
          console.warn('Firebase connection test failed, falling back to localStorage');
          loadFromLocalStorage();
          return;
        }
        
        console.log('Firebase connection test successful');
        console.log('Loading matches from Firebase...');
        
        const matchesRef = ref(database, 'matches');
        
        try {
          // Try to get initial data
          const snapshot = await get(matchesRef);
          console.log('Firebase snapshot:', snapshot.exists() ? 'Data exists' : 'No data found');
          
          const matchesData = snapshot.val() || {};
          console.log('Raw matches data:', matchesData);
          
          // Convert to array and ensure unique IDs
          const matchesList = Object.entries(matchesData).map(([id, match]) => ({
            ...(match as Match),
            id: id || `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          
          console.log(`Found ${matchesList.length} matches in Firebase`);
          
          if (matchesList.length > 0) {
            console.log('Updating state with Firebase matches');
            setMatches(matchesList);
            setFilteredMatches(matchesList);
            localStorage.setItem('cricketMatches', JSON.stringify(matchesList));
          } else {
            console.log('No matches found in Firebase, checking localStorage...');
            loadFromLocalStorage();
          }
        } catch (dbError) {
          console.error('Error reading matches from Firebase:', {
            error: dbError,
            code: (dbError as any)?.code,
            message: (dbError as Error)?.message,
            stack: (dbError as Error)?.stack
          });
          loadFromLocalStorage();
        }
        
        // Set up real-time listener for future updates
        console.log('Setting up real-time listener for matches...');
        const unsubscribe = onValue(matchesRef, 
          (snapshot) => {
            console.log('Received real-time update from Firebase');
            
            if (snapshot.exists()) {
              const matchesData = snapshot.val() || {};
              console.log('Real-time update data:', matchesData);
              
              const updatedMatches = Object.entries(matchesData).map(([id, match]) => ({
                ...(match as Match),
                id: id || `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              }));
              
              console.log(`Processing ${updatedMatches.length} matches from real-time update`);
              
              if (updatedMatches.length > 0) {
                console.log('Updating state with real-time matches');
                setMatches(updatedMatches);
                setFilteredMatches(updatedMatches);
                localStorage.setItem('cricketMatches', JSON.stringify(updatedMatches));
              } else {
                console.log('No matches in real-time update, checking localStorage...');
                loadFromLocalStorage();
              }
            } else {
              console.log('Real-time update: No data available in snapshot');
              loadFromLocalStorage();
            }
          },
          (error) => {
            console.error('Error in real-time listener:', {
              error: error instanceof Error ? error.message : 'Unknown error',
              code: (error as any)?.code,
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        );
        
        // Return cleanup function
        return () => {
          console.log('Cleaning up real-time listener...');
          off(matchesRef, 'value', unsubscribe);
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Unexpected error in loadData:', {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        loadFromLocalStorage();
      } finally {
        console.log('Finished loading match data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [])

  useEffect(() => {
    let filtered = matches

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredMatches(filtered)
  }, [matches, searchTerm, statusFilter])

  const getMatchResult = (match: Match): string => {
    if (!match || match.status !== 'completed' || !match.result) return 'In Progress'
    
    if (match.result.type === 'tie') return 'Match Tied'
    
    return match.result.winner 
      ? `${match.result.winner} won by ${match.result.margin} ${match.result.type}`
      : 'Match completed'
  }

  const getResultColor = (match: Match): string => {
    if (!match || match.status !== 'completed') return 'text-yellow-600'
    if (match.result?.type === 'tie') return 'text-gray-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Match History</h1>
          <p className="text-black">View completed and ongoing cricket matches</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <span className="text-sm text-black mb-4 md:mb-0">
            {filteredMatches.length} matches found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Matches</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match, index) => (
          <motion.div
            key={`${match.id}-${index}-${match.date || ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMatch(match)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Trophy className="w-5 h-5 text-black mr-2" />
                  <h3 className="text-lg font-semibold text-black">
                    {match.team1.name} vs {match.team2.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center text-black">
                    <Calendar className="w-4 h-4 mr-2 text-black" />
                    <span className="text-sm text-black">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-black">
                    <MapPin className="w-4 h-4 mr-2 text-black" />
                    <span className="text-sm text-black">{match.venue}</span>
                  </div>
                  <div className="flex items-center text-black">
                    <Clock className="w-4 h-4 mr-2 text-black" />
                    <span className="text-sm text-black">{match.format}</span>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {match.innings.map((innings, inningsIndex) => {
                    const battingTeam = match.team1.id === innings.battingTeam ? 
                      match.team1 : match.team2
                    return (
                      <div key={inningsIndex} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-black mb-1">
                          {battingTeam.name} - Innings {inningsIndex + 1}
                        </p>
                        <p className="text-xl font-bold text-black">
                          {innings.runs}/{innings.wickets}
                        </p>
                        <p className="text-sm text-black">
                          ({Math.floor(innings.balls / 6)}.{innings.balls % 6} overs)
                        </p>
                      </div>
                    )
                  })}
                </div>

                <p className={`font-semibold text-black`}>
                  {getMatchResult(match)}
                </p>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  <Eye className="w-4 h-4 mr-2 text-black" />
                  View Scorecard
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No matches found</h3>
            <p className="text-black">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start scoring your first cricket match!'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Match Scorecard Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-black">Match Scorecard</h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-black hover:text-black text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CricketScoreboard match={selectedMatch} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
