'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Plus, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const data = await getCollection<User>('users')
      const adminUsers = data.filter(u => u.role === 'admin')
      setAdmins(adminUsers)
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to load admin accounts')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Accounts</h1>
        <Button>
          <Plus size={20} className="mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserCog size={20} className="text-gray-400" />
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {admins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No admin accounts found</p>
          </div>
        )}
      </div>
    </div>
  )
}

