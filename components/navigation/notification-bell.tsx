'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiX, FiCheck, FiTrash2 } from 'react-icons/fi'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '@/lib/actions/notifications'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    const result = await getNotifications(20)
    if (result.success && result.data) {
      setNotifications(result.data as Notification[])
    }
    setLoading(false)
  }

  const fetchUnreadCount = async () => {
    const result = await getUnreadCount()
    if (result.success) {
      setUnreadCount(result.count)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    fetchNotifications()
    fetchUnreadCount()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    fetchNotifications()
    fetchUnreadCount()
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
    fetchNotifications()
    fetchUnreadCount()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_accepted':
        return '🎉'
      case 'order_payment_completed':
      case 'payment_received':
        return '💰'
      case 'order_delivered':
        return '📦'
      case 'order_completed':
        return '🎊'
      case 'order_cancelled':
      case 'order_declined':
        return '🚫'
      case 'order_revision_requested':
        return '🔄'
      case 'order_in_progress':
        return '🚀'
      case 'rating_received':
        return '⭐'
      case 'message_received':
        return '💬'
      case 'payment_deadline':
        return '⏰'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 max-h-[600px] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-white/5 transition-colors ${
                          !notification.is_read ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {notification.link ? (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  handleMarkAsRead(notification.id)
                                  setIsOpen(false)
                                }}
                                className="block"
                              >
                                <h4 className="text-white font-medium text-sm mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </Link>
                            ) : (
                              <>
                                <h4 className="text-white font-medium text-sm mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors rounded hover:bg-white/10"
                                title="Mark as read"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-white/10"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
