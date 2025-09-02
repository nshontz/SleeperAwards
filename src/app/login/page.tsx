import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer, ResponsiveContainer } from '@/components/ui/responsive-container';

export default function LoginPage() {
  return (
    <PageContainer className="flex items-center justify-center">
      <ResponsiveContainer maxWidth="sm">
        <Card className="w-full backdrop-blur-md bg-card/95 shadow-xl sm:shadow-2xl">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">🍺 Welcome to BineTime</CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg">
              Sign in to access your fantasy football teams and track your performance.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <SignInButton>
              <Button 
                className="w-full bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base" 
                size="default"
              >
                Sign In with Clerk
              </Button>
            </SignInButton>

            <div className="text-center">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Secure authentication powered by Clerk
              </p>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </PageContainer>
  );
}