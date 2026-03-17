import { cn } from '@/lib/utils'
import Image from 'next/image'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center shrink-0", className)}>
      <Image src="/ghana-aids-commission-removebg-preview.png" alt="Logo" width={100} height={100} className="w-30 h-auto" />
    </div>
  )
}
