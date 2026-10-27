import { createContext, useContext } from 'react'

export interface OpenOptions {
  personId?: string
}

export interface CaptureApi {
  openCapture: (options?: OpenOptions) => void
}

export const CaptureContext = createContext<CaptureApi>({ openCapture: () => {} })

export const useCapture = () => useContext(CaptureContext)
