import React, { Children } from 'react'

const PageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className='px-4 py-3'>
        {children}
    </div>
  )
}

export default PageWrapper