import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  padding?: boolean;
}

// Mobile-first responsive container with centered column layout
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'lg',
  padding = true 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',    // 640px
    md: 'max-w-screen-md',    // 768px  
    lg: 'max-w-screen-lg',    // 1024px
    xl: 'max-w-screen-xl',    // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    '4xl': 'max-w-4xl',       // 896px
    '6xl': 'max-w-6xl',       // 1152px
  };

  return (
    <div className={cn(
      // Mobile-first: full width with padding
      'w-full mx-auto',
      // Add responsive max-width for desktop centering
      maxWidthClasses[maxWidth],
      // Mobile-first padding
      padding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
}

// Page wrapper for consistent mobile-first layout
export function PageContainer({ 
  children, 
  className,
  withTopPadding = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  withTopPadding?: boolean;
}) {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-background to-muted/50',
      // Mobile-first: account for fixed navigation
      withTopPadding && 'pt-4 pb-4 sm:pt-8 sm:pb-8',
      className
    )}>
      {children}
    </div>
  );
}