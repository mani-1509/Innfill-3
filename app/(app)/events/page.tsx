'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, EventType } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

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
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="https://framerusercontent.com/assets/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
            <Button
              onClick={() => setSelectedType('all')}
              variant={selectedType === 'all' ? 'default' : 'outline'}
              className={selectedType === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
            >
              All
            </Button>
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                onClick={() => setSelectedType(type as EventType)}
                variant={selectedType === type ? 'default' : 'outline'}
                className={
                  selectedType === type
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Events Feed */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-900/80 border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="bg-gray-900/80 border-gray-800 p-12 text-center">
              <p className="text-gray-400 text-lg">
                No events found. Check back later for updates!
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className={`bg-gray-900/80 border-gray-800 p-6 transition-all hover:border-gray-700 ${
                    event.is_pinned ? 'border-blue-500 border-l-4' : ''
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
                        <span className="text-blue-500 text-xs font-semibold flex items-center gap-1">
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
                    <div className="mb-4 rounded-lg overflow-hidden">
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
