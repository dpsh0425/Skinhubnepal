'use client'

import { useEffect, useState } from 'react'
import { getCollection, updateDocument } from '@/lib/utils/firestore'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Ban, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await getCollection<User>('users')
      // Filter out admins
      const customerData = data.filter(u => u.role === 'customer')
      setCustomers(customerData)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      // Note: You'll need to add a 'blocked' field to the User type
      await updateDocument('users', userId, {
        blocked: !isBlocked,
      })
      toast.success(isBlocked ? 'Customer unblocked' : 'Customer blocked')
      fetchCustomers()
    } catch (error) {
      toast.error('Failed to update customer status')
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => {
                const isBlocked = (customer as any).blocked || false
                return (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          isBlocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleBlock(customer.id, isBlocked)}
                      >
                        {isBlocked ? (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban size={16} className="mr-2" />
                            Block
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

