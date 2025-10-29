'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Umpire, Booking } from '@/types'
import { 
  Star, 
  Award, 
  Calendar,
  Search,
  Filter,
  Shield,
  CheckCircle,
  Clock
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface UmpireBookingProps {
  user: User | null
}

// Mock data for umpires
const mockUmpires: Umpire[] = [
  {
    id: '1',
    name: 'Suresh Raina',
    experience: 15,
    description: 'Certified Level 3 umpire with extensive experience in domestic and international matches. Known for fair decisions and excellent match management.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    pricePerMatch: 3000,
    rating: 4.9,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: true }
    ],
    certifications: ['ICC Level 3', 'BCCI Certified', 'First Aid Certified']
  },
  {
    id: '2',
    name: 'Kavita Devi',
    experience: 10,
    description: 'Professional female umpire specializing in women\'s cricket. Excellent knowledge of rules and regulations with calm demeanor.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    pricePerMatch: 2500,
    rating: 4.8,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true }
    ],
    certifications: ['ICC Level 2', 'Women\'s Cricket Specialist', 'BCCI Certified']
  },
  {
    id: '3',
    name: 'Ramesh Kumar',
    experience: 20,
    description: 'Veteran umpire with two decades of experience. Has officiated in numerous state-level tournaments and T20 leagues.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pricePerMatch: 3500,
    rating: 4.7,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: false }
    ],
    certifications: ['ICC Level 3', 'BCCI Elite Panel', 'Tournament Specialist']
  }
]

export default function UmpireBooking({ user }: UmpireBookingProps) {
  const [umpires, setUmpires] = useState<Umpire[]>(mockUmpires)
  const [filteredUmpires, setFilteredUmpires] = useState<Umpire[]>(mockUmpires)
  const [selectedUmpire, setSelectedUmpire] = useState<Umpire | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [experienceFilter, setExperienceFilter] = useState<string>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [matchType, setMatchType] = useState('T20')

  useEffect(() => {
    let filtered = umpires

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(umpire => 
        umpire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        umpire.certifications.some(cert => cert.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(umpire => {
        if (experienceFilter === 'junior') return umpire.experience < 10
        if (experienceFilter === 'senior') return umpire.experience >= 10 && umpire.experience < 20
        if (experienceFilter === 'veteran') return umpire.experience >= 20
        return true
      })
    }

    setFilteredUmpires(filtered)
  }, [searchTerm, experienceFilter, umpires])

  const handleBookUmpire = () => {
    if (!selectedUmpire || !selectedDate || !selectedTime || !user) return

    const booking: Booking = {
      id: uuidv4(),
      userId: user.id,
      type: 'umpire',
      resourceId: selectedUmpire.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime: selectedTime, // For umpires, it's per match, not hourly
      totalPrice: selectedUmpire.pricePerMatch,
      status: 'confirmed',
      createdAt: new Date()
    }

    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('cricketBookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('cricketBookings', JSON.stringify(existingBookings))

    toast.success('Umpire booked successfully!')
    setShowBookingModal(false)
    setSelectedUmpire(null)
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
          <h1 className="text-3xl font-bold text-white mb-2">Book Cricket Umpire</h1>
          <p className="text-gray-300">Find certified umpires for your cricket matches</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            {filteredUmpires.length} Umpires Available
          </span>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="royal-card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search umpires by name or certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Experience Levels</option>
              <option value="junior">Junior (0-10 years)</option>
              <option value="senior">Senior (10-20 years)</option>
              <option value="veteran">Veteran (20+ years)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              className="input-field pl-10"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </motion.div>

      {/* Umpires Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUmpires.map((umpire, index) => (
          <motion.div
            key={umpire.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="royal-card overflow-hidden group hover:scale-105 transition-transform duration-300"
          >
            {/* Umpire Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={umpire.image}
                alt={umpire.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{umpire.rating}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full">
                <span className="text-sm font-bold">₹{umpire.pricePerMatch}/match</span>
              </div>
            </div>

            {/* Umpire Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{umpire.name}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <Award className="w-4 h-4 mr-2" />
                <span className="text-sm">{umpire.experience} years experience</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{umpire.description}</p>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-4">
                {umpire.certifications.slice(0, 2).map((cert) => (
                  <div key={cert} className="flex items-center bg-purple-100 text-purple-800 rounded-full px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="text-xs">{cert}</span>
                  </div>
                ))}
                {umpire.certifications.length > 2 && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-xs">+{umpire.certifications.length - 2} more</span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedUmpire(umpire)
                  setShowBookingModal(true)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Book Umpire
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedUmpire && (
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
              className="royal-card p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center mb-6">
                <img
                  src={selectedUmpire.image}
                  alt={selectedUmpire.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUmpire.name}</h3>
                  <p className="text-gray-600">{selectedUmpire.experience} years experience</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Start Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="06:00">6:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="input-field"
                  >
                    <option value="T20">T20 (3-4 hours)</option>
                    <option value="ODI">ODI (7-8 hours)</option>
                    <option value="Test">Test Match (8+ hours)</option>
                    <option value="Custom">Custom Format</option>
                  </select>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUmpire.certifications.map((cert) => (
                      <div key={cert} className="flex items-center bg-purple-100 text-purple-800 rounded-full px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span className="text-xs">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Match Type:</span>
                    <span className="font-medium">{matchType}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Rate per match:</span>
                    <span className="font-medium">₹{selectedUmpire.pricePerMatch}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-purple-600">₹{selectedUmpire.pricePerMatch}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-white/30 rounded-lg hover:bg-white/20 transition-colors text-gray-700 hover:text-gray-900 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookUmpire}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
