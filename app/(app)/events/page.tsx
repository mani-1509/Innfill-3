'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, EventType } from '@/types/database'

const eventTypeColors: Record<EventType, string> = {
  announcement: 'bg-blue-500',
  update: 'bg-green-500',
  success_story: 'bg-purple-500',
  maintenance: 'bg-orange-500',
  tip: 'bg-yellow-500',
}

const eventTypeLabels: Record<EventType, string> = {
  announcement: 'Announcement',
  update: 'Update',
  success_story: 'Success Story',
  maintenance: 'Maintenance',
  tip: 'Tip',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const filteredEvents = selectedType === 'all' 
    ? events 
    : events.filter(event => event.type === selectedType)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center block opacity-40"
          style={{ filter: 'brightness(1) contrast(1) grayscale(1)' }}
        >
          <source src="https://framerusercontent.com/assets/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        </video>
        {/* Radial gradient overlay */}
        <div 
          className="absolute top-0 left-0 z-1 w-full h-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(8, 9, 10, 0.855) 100%)'
          }}
        ></div>
      </div>

      
      {/* <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://framerusercontent.com/assets/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80"></div>
      </div> */}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">{/* Header */}
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Platform Updates
            </h1>
            <p className="text-gray-400">
              Stay informed with the latest news, updates, and success stories from INNFILL
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as EventType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Events Feed */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-28 bg-white/10 rounded-full"></div>
                    <div className="h-4 w-24 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-8 w-3/4 bg-white/10 rounded mb-4"></div>
                  <div className="h-40 w-full bg-white/10 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/10 rounded"></div>
                    <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">
                No events found. Check back later for updates!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all hover:bg-white/[0.07] ${
                    event.is_pinned 
                      ? 'border-blue-500 border-l-4' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={`${
                          eventTypeColors[event.type]
                        } text-white text-xs font-semibold px-3 py-1 rounded-full`}
                      >
                        {eventTypeLabels[event.type]}
                      </span>
                      {event.is_pinned && (
                        <span className="text-blue-400 text-xs font-semibold flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 00-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                          </svg>
                          Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDate(event.published_at)}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {event.title}
                  </h2>

                  {/* Event Image */}
                  {event.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Event Content */}
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {event.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
