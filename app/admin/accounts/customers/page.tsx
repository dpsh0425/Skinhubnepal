'use client'

import { useEffect, useState } from 'react'
import { getCollection, updateDocument } from '@/lib/utils/firestore'
import { User, Order } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Search, Ban, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery])

  const fetchData = async () => {
    try {
      const [customersData, ordersData] = await Promise.all([
        getCollection<User>('users'),
        getCollection<Order>('orders'),
      ])
      const customerUsers = customersData.filter(u => u.role === 'customer')
      setCustomers(customerUsers)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load customers')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = [...customers]

    if (searchQuery) {
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCustomers(filtered)
  }

  const getUserOrders = (userId: string) => {
    return orders.filter(o => o.userId === userId)
  }

  const getUserTotalSpent = (userId: string) => {
    return getUserOrders(userId).reduce((sum, o) => sum + o.total, 0)
  }

  const handleBlockToggle = async (customerId: string, currentStatus: boolean) => {
    try {
      // Assuming we add a 'blocked' field to User type
      await updateDocument('users', customerId, {
        blocked: !currentStatus,
      })
      toast.success(`Customer ${!currentStatus ? 'blocked' : 'unblocked'}`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update customer status')
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const customerOrders = getUserOrders(customer.id)
                const totalSpent = getUserTotalSpent(customer.id)
                const isBlocked = (customer as any).blocked || false

                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.phone || '-'}</td>
                    <td className="px-6 py-4">{customerOrders.length}</td>
                    <td className="px-6 py-4 font-semibold">Rs. {totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isBlocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/accounts/customers/${customer.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockToggle(customer.id, isBlocked)}
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
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

