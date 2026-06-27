import { cn, getInitials } from '@/lib/utils'
import { AVATAR_COLOR_CLASSES } from '@/lib/constants'

interface AvatarProps {
  name: string
  color?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export default function Avatar({ name, color = 'indigo', size = 'md', className }: AvatarProps) {
  const colorClass = AVATAR_COLOR_CLASSES[color] ?? AVATAR_COLOR_CLASSES.indigo

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        colorClass,
        sizes[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
