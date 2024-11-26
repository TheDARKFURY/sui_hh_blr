'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TronLinkContextType {
  isConnected: boolean
  address: string
  setConnection: (isConnected: boolean, address: string) => void
}

const TronLinkContext = createContext<TronLinkContextType | undefined>(undefined)

export const TronLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const storedConnection = localStorage.getItem('tronLinkConnection')
    if (storedConnection) {
      const { isConnected, address } = JSON.parse(storedConnection)
      setIsConnected(isConnected)
      setAddress(address)
    }
  }, [])

  const setConnection = (isConnected: boolean, address: string) => {
    setIsConnected(isConnected)
    setAddress(address)
    localStorage.setItem('tronLinkConnection', JSON.stringify({ isConnected, address }))
  }

  return (
    <TronLinkContext.Provider value={{ isConnected, address, setConnection }}>
      {children}
    </TronLinkContext.Provider>
  )
}

export const useTronLink = () => {
  const context = useContext(TronLinkContext)
  if (context === undefined) {
    throw new Error('useTronLink must be used within a TronLinkProvider')
  }
  return context
}