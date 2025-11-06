'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, EventType } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as EventType,
    is_pinned: false,
    image_url: '',
  })
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      alert('You must be logged in to create events')
      return
    }

    const eventData = {
      ...formData,
      created_by: userData.user.id,
      published_at: new Date().toISOString(),
    }

    if (editingEvent) {
      // Update existing event
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)

      if (error) {
        console.error('Error updating event:', error)
        alert('Failed to update event')
      } else {
        alert('Event updated successfully!')
        resetForm()
        fetchEvents()
      }
    } else {
      // Create new event
      const { error } = await supabase
        .from('events')
        .insert([eventData])

      if (error) {
        console.error('Error creating event:', error)
        alert('Failed to create event')
      } else {
        alert('Event created successfully!')
        resetForm()
        fetchEvents()
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    } else {
      alert('Event deleted successfully!')
      fetchEvents()
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      content: event.content,
      type: event.type,
      is_pinned: event.is_pinned,
      image_url: event.image_url || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      is_pinned: false,
      image_url: '',
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Manage Events
              </h1>
              <p className="text-gray-400">
                Create and manage platform announcements, updates, and news
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setShowForm(!showForm)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Create Event'}
            </Button>
          </div>

          {/* Event Form */}
          {showForm && (
            <Card className="bg-gray-900/80 border-gray-800 p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-white mb-2 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter event title"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content" className="text-white mb-2 block">
                    Content
                  </Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event content"
                  />
                </div>

                {/* Type */}
                <div>
                  <Label htmlFor="type" className="text-white mb-2 block">
                    Event Type
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as EventType,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(eventTypeLabels).map(([type, label]) => (
                      <option key={type} value={type}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image_url" className="text-white mb-2 block">
                    Image URL (Optional)
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Pin Event */}
                <div className="flex items-center gap-3">
                  <input
                    id="is_pinned"
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) =>
                      setFormData({ ...formData, is_pinned: e.target.checked })
                    }
                    className="w-5 h-5 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_pinned" className="text-white">
                    Pin this event to the top
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </form>
            </Card>
          )}

          {/* Events List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-gray-900/80 border-gray-800 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Skeleton className="h-10 w-16" />
                      <Skeleton className="h-10 w-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="bg-gray-900/80 border-gray-800 p-12 text-center">
              <p className="text-gray-400 text-lg">
                No events yet. Create your first event!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className={`bg-gray-900/80 border-gray-800 p-6 ${
                    event.is_pinned ? 'border-blue-500 border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Event Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`${
                            eventTypeColors[event.type]
                          } text-white text-xs font-semibold px-3 py-1 rounded-full`}
                        >
                          {eventTypeLabels[event.type]}
                        </span>
                        {event.is_pinned && (
                          <span className="text-blue-500 text-xs font-semibold">
                            📌 Pinned
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {event.title}
                      </h3>

                      {/* Event Content Preview */}
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {event.content}
                      </p>

                      {/* Event Meta */}
                      <div className="text-sm text-gray-500">
                        Published: {formatDate(event.published_at)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(event)}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id)}
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
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
