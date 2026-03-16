import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono font-medium border transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
        secondary: 'bg-secondary text-muted-foreground border-border',
        draft:     'bg-muted text-muted-foreground border-border',
        submitted: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
        verified:  'bg-green-950/60 text-green-300 border-green-800/50',
        rejected:  'bg-red-950/60 text-red-300 border-red-800/50',
        outline:   'bg-transparent border-border text-muted-foreground',
        admin:     'bg-purple-950/60 text-purple-300 border-purple-800/50',
        supervisor:'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
        data_entry:'bg-muted text-muted-foreground border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm',
        'placeholder:text-muted-foreground resize-none',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// ─── Label ────────────────────────────────────────────────────────────────────
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
  )
);
Label.displayName = 'Label';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in ms for sequential reveal */
  delay?: number;
  /** Rounded variant: default, lg (cards), xl (large cards) */
  rounded?: 'default' | 'lg' | 'xl';
}

export function Skeleton({ className, delay = 0, rounded = 'default', style, ...props }: SkeletonProps) {
  const roundedClass =
    rounded === 'lg' ? 'rounded-xl' : rounded === 'xl' ? 'rounded-2xl' : 'rounded-md';
  return (
    <div
      className={cn('shimmer-skeleton', roundedClass, className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    />
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
export function Separator({ className, orientation = 'horizontal', ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
      {...props}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2 text-sm',
      'ring-offset-background placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
      'disabled:cursor-not-allowed disabled:opacity-50 transition-colors [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-64 min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        position === 'popper' && 'data-[side=bottom]:translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className={cn('p-1', position === 'popper' && 'w-full min-w-(--radix-select-trigger-width)')}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator><Check className="h-4 w-4 text-amber-400" /></SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
