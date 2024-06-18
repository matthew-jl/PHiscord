import React from 'react'

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-16 flex flex-col bg-gray-900 text-white shadow-lg">
        <p>A</p>
        <p>A</p>
        <p>A</p>
        <p>A</p>
        <p>A</p>
    </div>
  )
}

const SidebarIcon = ({ icon }) => {
    <div className="sidebar-icon">
        { icon }
    </div>
}

export default Sidebar