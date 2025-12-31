'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { ActivityLog } from '@/lib/types'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format } from 'date-fns'
import { FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery])

  const fetchLogs = async () => {
    try {
      const data = await getCollection<ActivityLog>('logs')
      // Sort by date (newest first)
      const sorted = data.sort((a, b) => {
        const dateA = convertTimestamp(a.createdAt)
        const dateB = convertTimestamp(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      setLogs(sorted)
      setFilteredLogs(sorted)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    if (searchQuery) {
      filtered = filtered.filter(
        log =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entityType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const logDate = convertTimestamp(log.createdAt)
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {format(logDate, 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-medium">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{log.entityType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {JSON.stringify(log.details, null, 2).substring(0, 100)}
                      {JSON.stringify(log.details).length > 100 && '...'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

