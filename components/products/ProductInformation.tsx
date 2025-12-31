'use client'

interface ProductInformationProps {
  information: Record<string, string>
}

export const ProductInformation = ({ information }: ProductInformationProps) => {
  if (!information || Object.keys(information).length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Product Information</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(information).map(([key, value], index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 md:px-6 md:py-4 font-semibold text-gray-900 w-1/3 border-r border-gray-200">
                  {key}
                </td>
                <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

