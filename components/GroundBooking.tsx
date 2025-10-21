'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Ground, Booking } from '@/types'
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Shield,
  Calendar,
  DollarSign,
  Filter,
  Search
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface GroundBookingProps {
  user: User | null
}

// Mock data for grounds
const mockGrounds: Ground[] = [
  {
    id: '1',
    name: 'Central Cricket Stadium',
    location: 'Downtown Sports Complex, Mumbai',
    description: 'Premier cricket ground with international standard facilities. Perfect for tournaments and professional matches.',
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800'
    ],
    pricePerHour: 2500,
    facilities: ['Floodlights', 'Pavilion', 'Parking', 'Cafeteria', 'Changing Rooms', 'WiFi'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: true }
    ],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Green Valley Cricket Ground',
    location: 'Sector 15, Noida',
    description: 'Beautiful ground surrounded by greenery. Ideal for weekend matches and practice sessions.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
    ],
    pricePerHour: 1800,
    facilities: ['Natural Turf', 'Pavilion', 'Parking', 'Changing Rooms'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: false }
    ],
    rating: 4.5
  },
  {
    id: '3',
    name: 'Metro Sports Arena',
    location: 'Andheri West, Mumbai',
    description: 'Modern cricket facility with state-of-the-art amenities. Great for corporate tournaments.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    pricePerHour: 3000,
    facilities: ['Floodlights', 'Air-conditioned Pavilion', 'Premium Parking', 'Restaurant', 'Changing Rooms', 'WiFi', 'Security'],
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true }
    ],
    rating: 4.9
  }
]

export default function GroundBooking({ user }: GroundBookingProps) {
  const [grounds, setGrounds] = useState<Ground[]>(mockGrounds)
  const [filteredGrounds, setFilteredGrounds] = useState<Ground[]>(mockGrounds)
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(2)

  useEffect(() => {
    let filtered = grounds

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ground => 
        ground.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ground.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(ground => {
        if (priceFilter === 'low') return ground.pricePerHour < 2000
        if (priceFilter === 'medium') return ground.pricePerHour >= 2000 && ground.pricePerHour < 2800
        if (priceFilter === 'high') return ground.pricePerHour >= 2800
        return true
      })
    }

    setFilteredGrounds(filtered)
  }, [searchTerm, priceFilter, grounds])

  const handleBookGround = () => {
    if (!selectedGround || !selectedDate || !selectedTime || !user) return

    const booking: Booking = {
      id: uuidv4(),
      userId: user.id,
      type: 'ground',
      resourceId: selectedGround.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime: `${parseInt(selectedTime.split(':')[0]) + duration}:${selectedTime.split(':')[1]}`,
      totalPrice: selectedGround.pricePerHour * duration,
      status: 'confirmed',
      createdAt: new Date()
    }

    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('cricketBookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('cricketBookings', JSON.stringify(existingBookings))

    toast.success('Ground booked successfully!')
    setShowBookingModal(false)
    setSelectedGround(null)
  }

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'floodlights': return <Clock className="w-4 h-4" />
      case 'pavilion': case 'air-conditioned pavilion': return <Users className="w-4 h-4" />
      case 'parking': case 'premium parking': return <Car className="w-4 h-4" />
      case 'cafeteria': case 'restaurant': return <Coffee className="w-4 h-4" />
      case 'wifi': return <Wifi className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Book Cricket Ground</h1>
          <p className="text-gray-300">Find and book the perfect cricket ground for your match</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            {filteredGrounds.length} Grounds Available
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
              placeholder="Search grounds by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Price Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Price Ranges</option>
              <option value="low">Under ₹2,000/hr</option>
              <option value="medium">₹2,000 - ₹2,800/hr</option>
              <option value="high">Above ₹2,800/hr</option>
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

      {/* Grounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrounds.map((ground, index) => (
          <motion.div
            key={ground.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="royal-card overflow-hidden group hover:scale-105 transition-transform duration-300"
          >
            {/* Ground Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={ground.images[0]}
                alt={ground.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{ground.rating}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full">
                <span className="text-sm font-bold">₹{ground.pricePerHour}/hr</span>
              </div>
            </div>

            {/* Ground Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{ground.name}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{ground.location}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ground.description}</p>

              {/* Facilities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {ground.facilities.slice(0, 3).map((facility) => (
                  <div key={facility} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    {getFacilityIcon(facility)}
                    <span className="text-xs ml-1">{facility}</span>
                  </div>
                ))}
                {ground.facilities.length > 3 && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-xs">+{ground.facilities.length - 3} more</span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedGround(ground)
                  setShowBookingModal(true)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedGround && (
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book {selectedGround.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Start Time</label>
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
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Duration (hours)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                  </select>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800">Rate per hour:</span>
                    <span className="font-medium text-gray-900">₹{selectedGround.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800">Duration:</span>
                    <span className="font-medium text-gray-900">{duration} hours</span>
                  </div>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-cricket-primary">₹{selectedGround.pricePerHour * duration}</span>
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
                  onClick={handleBookGround}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50"
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
