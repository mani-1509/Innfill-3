import React from 'react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-neutral-900/70 border border-neutral-800 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-neutral-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-800/30 to-transparent animate-[shimmer_1.6s_infinite]" />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export function SkeletonText({ width = '100%', className = '' }: { width?: string; className?: string }) {
  return <Skeleton className={`h-4 ${className}`} />
}

export function SkeletonCircle({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative rounded-full bg-neutral-900/70 border border-neutral-800 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-neutral-900 rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-800/30 to-transparent animate-[shimmer_1.6s_infinite] rounded-full" />
    </div>
  )
}
