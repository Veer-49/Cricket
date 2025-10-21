'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, PracticeNet, Booking } from '@/types'
import { 
  MapPin, 
  Star, 
  Clock, 
  Target,
  Calendar,
  Search,
  Filter,
  Zap,
  Wind,
  Activity
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface NetBookingProps {
  user: User | null
}

// Mock data for practice nets
const mockNets: PracticeNet[] = [
  {
    id: '1',
    name: 'Power Cricket Academy - Net 1',
    location: 'Bandra West, Mumbai',
    description: 'Professional practice net with bowling machine and video analysis. Perfect for technique improvement and power hitting practice.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
    ],
    pricePerHour: 800,
    pitchType: 'Artificial Turf',
    facilities: ['Bowling Machine', 'Video Analysis', 'Floodlights', 'Ball Collection'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '22:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '22:00', available: true }
    ]
  },
  {
    id: '2',
    name: 'Elite Sports Complex - Fast Net',
    location: 'Andheri East, Mumbai',
    description: 'High-speed practice net designed for fast bowling practice. Includes speed gun and professional coaching support.',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800'
    ],
    pricePerHour: 1200,
    pitchType: 'Natural Grass',
    facilities: ['Speed Gun', 'Professional Coach', 'Floodlights', 'Changing Room'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '20:00', available: true }
    ]
  },
  {
    id: '3',
    name: 'Spin Academy - Turning Net',
    location: 'Juhu, Mumbai',
    description: 'Specialized net for spin bowling practice with different pitch conditions. Great for developing spin variations.',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
    ],
    pricePerHour: 600,
    pitchType: 'Clay Pitch',
    facilities: ['Spin-friendly Surface', 'Ball Variety', 'Basic Lighting'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: false }
    ]
  },
  {
    id: '4',
    name: 'Champions Net Complex - Multi-Purpose',
    location: 'Powai, Mumbai',
    description: 'Versatile practice net suitable for all types of cricket training. Includes modern amenities and equipment.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    pricePerHour: 1000,
    pitchType: 'Hybrid Surface',
    facilities: ['Multi-Purpose', 'Equipment Rental', 'Floodlights', 'Cafeteria', 'Parking'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '22:00', available: true }
    ]
  }
]

export default function NetBooking({ user }: NetBookingProps) {
  const [nets, setNets] = useState<PracticeNet[]>(mockNets)
  const [filteredNets, setFilteredNets] = useState<PracticeNet[]>(mockNets)
  const [selectedNet, setSelectedNet] = useState<PracticeNet | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pitchTypeFilter, setPitchTypeFilter] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)

  const pitchTypes = ['all', 'Artificial Turf', 'Natural Grass', 'Clay Pitch', 'Hybrid Surface']

  useEffect(() => {
    let filtered = nets

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(net => 
        net.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        net.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        net.pitchType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Pitch type filter
    if (pitchTypeFilter !== 'all') {
      filtered = filtered.filter(net => net.pitchType === pitchTypeFilter)
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(net => {
        if (priceFilter === 'low') return net.pricePerHour < 800
        if (priceFilter === 'medium') return net.pricePerHour >= 800 && net.pricePerHour < 1000
        if (priceFilter === 'high') return net.pricePerHour >= 1000
        return true
      })
    }

    setFilteredNets(filtered)
  }, [searchTerm, pitchTypeFilter, priceFilter, nets])

  const handleBookNet = () => {
    if (!selectedNet || !selectedDate || !selectedTime || !user) return

    const booking: Booking = {
      id: uuidv4(),
      userId: user.id,
      type: 'net',
      resourceId: selectedNet.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime: `${parseInt(selectedTime.split(':')[0]) + duration}:${selectedTime.split(':')[1]}`,
      totalPrice: selectedNet.pricePerHour * duration,
      status: 'confirmed',
      createdAt: new Date()
    }

    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('cricketBookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('cricketBookings', JSON.stringify(existingBookings))

    toast.success('Practice net booked successfully!')
    setShowBookingModal(false)
    setSelectedNet(null)
  }

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'bowling machine': return <Target className="w-4 h-4" />
      case 'speed gun': return <Zap className="w-4 h-4" />
      case 'floodlights': case 'basic lighting': return <Clock className="w-4 h-4" />
      case 'video analysis': return <Activity className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getPitchTypeColor = (pitchType: string) => {
    switch (pitchType) {
      case 'Artificial Turf': return 'bg-green-100 text-green-800'
      case 'Natural Grass': return 'bg-emerald-100 text-emerald-800'
      case 'Clay Pitch': return 'bg-orange-100 text-orange-800'
      case 'Hybrid Surface': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Book Practice Nets</h1>
          <p className="text-gray-300">Find and book practice nets for your cricket training</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            {filteredNets.length} Nets Available
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search nets by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Pitch Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={pitchTypeFilter}
              onChange={(e) => setPitchTypeFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {pitchTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Pitch Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Price Ranges</option>
              <option value="low">Under ₹800/hr</option>
              <option value="medium">₹800 - ₹1,000/hr</option>
              <option value="high">Above ₹1,000/hr</option>
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

      {/* Nets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNets.map((net, index) => (
          <motion.div
            key={net.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="royal-card overflow-hidden group hover:scale-105 transition-transform duration-300"
          >
            {/* Net Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={net.images[0]}
                alt={net.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full">
                <span className="text-sm font-bold">₹{net.pricePerHour}/hr</span>
              </div>
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getPitchTypeColor(net.pitchType)}`}>
                {net.pitchType}
              </div>
            </div>

            {/* Net Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{net.name}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{net.location}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{net.description}</p>

              {/* Facilities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {net.facilities.slice(0, 3).map((facility) => (
                  <div key={facility} className="flex items-center bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                    {getFacilityIcon(facility)}
                    <span className="text-xs ml-1">{facility}</span>
                  </div>
                ))}
                {net.facilities.length > 3 && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-xs">+{net.facilities.length - 3} more</span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedNet(net)
                  setShowBookingModal(true)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Book Net
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedNet && (
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
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Book {selectedNet.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>

                {/* Pitch Type and Facilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Type</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPitchTypeColor(selectedNet.pitchType)}`}>
                    {selectedNet.pitchType}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedNet.facilities.map((facility) => (
                      <div key={facility} className="flex items-center bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                        {getFacilityIcon(facility)}
                        <span className="text-xs ml-1">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Rate per hour:</span>
                    <span className="font-medium">₹{selectedNet.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-orange-600">₹{selectedNet.pricePerHour * duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookNet}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
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
