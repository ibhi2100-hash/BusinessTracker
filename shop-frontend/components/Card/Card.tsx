import { title } from 'process'
import React from 'react'

export const Card = (title: any, value: any) => {
  return (
    <div className='flex flex-col'>
        <div>
            <h2>{title}</h2>
        </div>
        <div>
            <h1>{value}</h1>
        </div>

    </div>
  )
}
