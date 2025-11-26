"use client"

import React, { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CollapsibleTriggerProps {
  children: ReactNode
  className?: string
  asChild?: boolean
}

interface CollapsibleContentProps {
  children: ReactNode
  className?: string
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, open, onOpenChange, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <>{children}</>
    }
    
    return (
      <button
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-all duration-300 ease-in-out', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
