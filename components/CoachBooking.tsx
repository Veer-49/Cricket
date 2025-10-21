'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Coach, Booking } from '@/types'
import { 
  Star, 
  Clock, 
  Award, 
  Users,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface CoachBookingProps {
  user: User | null
}

// Mock data for coaches
const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    specialization: ['Batting', 'Technique', 'Power Hitting'],
    experience: 12,
    description: 'Former state-level player with expertise in batting techniques. Specialized in developing power hitting and timing for all formats.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    pricePerHour: 1500,
    rating: 4.9,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: true }
    ]
  },
  {
    id: '2',
    name: 'Priya Sharma',
    specialization: ['Bowling', 'Spin Bowling', 'Match Strategy'],
    experience: 8,
    description: 'International women\'s cricket coach with specialization in spin bowling and match tactics. Great for developing bowling variations.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    pricePerHour: 1800,
    rating: 4.8,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true }
    ]
  },
  {
    id: '3',
    name: 'Vikram Singh',
    specialization: ['Fast Bowling', 'Fitness', 'Pace Development'],
    experience: 15,
    description: 'Former fast bowler with extensive experience in pace development and cricket fitness. Helps players achieve their maximum bowling speed.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    pricePerHour: 2000,
    rating: 4.7,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true },
      { date: '2024-01-21', startTime: '06:00', endTime: '18:00', available: false }
    ]
  },
  {
    id: '4',
    name: 'Amit Patel',
    specialization: ['Wicket Keeping', 'Fielding', 'Agility'],
    experience: 10,
    description: 'Professional wicket-keeper coach focusing on glove work, agility training, and advanced fielding techniques.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    pricePerHour: 1600,
    rating: 4.6,
    availability: [
      { date: '2024-01-20', startTime: '06:00', endTime: '18:00', available: true }
    ]
  }
]

export default function CoachBooking({ user }: CoachBookingProps) {
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches)
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>(mockCoaches)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)

  const specializations = ['all', 'Batting', 'Bowling', 'Wicket Keeping', 'Fielding', 'Fitness']

  useEffect(() => {
    let filtered = coaches

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(coach => 
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(coach => 
        coach.specialization.some(spec => spec.toLowerCase().includes(specializationFilter.toLowerCase()))
      )
    }

    setFilteredCoaches(filtered)
  }, [searchTerm, specializationFilter, coaches])

  const handleBookCoach = () => {
    if (!selectedCoach || !selectedDate || !selectedTime || !user) return

    const booking: Booking = {
      id: uuidv4(),
      userId: user.id,
      type: 'coach',
      resourceId: selectedCoach.id,
      date: selectedDate,
      startTime: selectedTime,
      endTime: `${parseInt(selectedTime.split(':')[0]) + duration}:${selectedTime.split(':')[1]}`,
      totalPrice: selectedCoach.pricePerHour * duration,
      status: 'confirmed',
      createdAt: new Date()
    }

    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('cricketBookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('cricketBookings', JSON.stringify(existingBookings))

    toast.success('Coach booked successfully!')
    setShowBookingModal(false)
    setSelectedCoach(null)
  }

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'batting': case 'power hitting': case 'technique': return <Target className="w-4 h-4" />
      case 'bowling': case 'fast bowling': case 'spin bowling': return <TrendingUp className="w-4 h-4" />
      case 'wicket keeping': return <Users className="w-4 h-4" />
      case 'fitness': case 'agility': return <Award className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Book Cricket Coach</h1>
          <p className="text-gray-300">Find professional coaches to improve your cricket skills</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            {filteredCoaches.length} Coaches Available
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
              placeholder="Search coaches by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
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

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map((coach, index) => (
          <motion.div
            key={coach.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="royal-card overflow-hidden group hover:scale-105 transition-transform duration-300"
          >
            {/* Coach Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={coach.image}
                alt={coach.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{coach.rating}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full">
                <span className="text-sm font-bold">₹{coach.pricePerHour}/hr</span>
              </div>
            </div>

            {/* Coach Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{coach.name}</h3>
              <div className="flex items-center text-gray-600 mb-3">
                <Award className="w-4 h-4 mr-2" />
                <span className="text-sm">{coach.experience} years experience</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{coach.description}</p>

              {/* Specializations */}
              <div className="flex flex-wrap gap-2 mb-4">
                {coach.specialization.slice(0, 3).map((spec) => (
                  <div key={spec} className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1">
                    {getSpecializationIcon(spec)}
                    <span className="text-xs ml-1">{spec}</span>
                  </div>
                ))}
                {coach.specialization.length > 3 && (
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-xs">+{coach.specialization.length - 3} more</span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCoach(coach)
                  setShowBookingModal(true)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Book Session
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedCoach && (
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
                  src={selectedCoach.image}
                  alt={selectedCoach.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedCoach.name}</h3>
                  <p className="text-gray-600">{selectedCoach.experience} years experience</p>
                </div>
              </div>
              
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
                  </select>
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.specialization.map((spec) => (
                      <div key={spec} className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1">
                        {getSpecializationIcon(spec)}
                        <span className="text-xs ml-1">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800">Rate per hour:</span>
                    <span className="font-medium text-gray-900">₹{selectedCoach.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800">Duration:</span>
                    <span className="font-medium text-gray-900">{duration} hours</span>
                  </div>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-cricket-secondary">₹{selectedCoach.pricePerHour * duration}</span>
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
                  onClick={handleBookCoach}
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
