import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-md bg-card/95 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🍺 Welcome to BineTime</CardTitle>
          <CardDescription className="text-lg">
            Sign in to access your fantasy football teams and track your performance.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <SignInButton>
            <Button 
              className="w-full bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold" 
              size="lg"
            >
              Sign In with Clerk
            </Button>
          </SignInButton>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Secure authentication powered by Clerk
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}