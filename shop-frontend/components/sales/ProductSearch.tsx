"use client"

import React, { useState } from 'react'

export const ProductSearch = () => {
    const [search, setSearch ] = useState("");

  return (
    <div className="bg-white p-3 rounded-xl shadow">
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full outline-none"
      />
    </div>
  )
}
