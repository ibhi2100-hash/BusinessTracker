import { Bell } from 'lucide-react'
import React from 'react'


export const DashboardHeader = () => {
  return (
    <div className='flex items-center justify-between'>
        <div>
            <p className='text-sm text-gray-500'>GoodMorning</p>
            <h1 className='text-xl font-semibold'>Mr Shrek</h1>

            <select className='mt-1 text-sm bg-gray-100 rounded-lg px-2 py-1'>
                <option value="Ikeja">Ikeja Branch</option>
                <option value="Abuja">Abuja Branch</option>
            </select>
        </div>
        <button className='relative p-2 rounded-full bg-white shadow'>
            <Bell className='w-5 h-5' />
            <span className='absolute top-1 right-1 w-2 h2 bg-red-500 rounded-full'></span>
        </button>
    </div>
  )
}
