"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TwitterSignInButtonProps {
  buttonText?: string;
  className?: string;
  icon?: React.ReactNode;
  onSuccess: () => void;
}

export default function TwitterSignInButton({ 
  buttonText = "Sign in with Twitter", 
  className = "w-full py-3 rounded-lg bg-[#1DA1F2] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center",
  icon,
  onSuccess
}: TwitterSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if Twitter Client ID is configured
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID);

  const handleTwitterSignIn = async () => {
    console.log('=== Twitter Sign-In Debug ===');
    console.log('Button clicked, starting authentication...');
    console.log('Client ID configured:', Boolean(process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID));
    console.log('Client ID value:', process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID ? 'SET' : 'NOT SET');
    
    setLoading(true);
    try {
      console.log('Making request to /api/twitter/auth...');
      
      // Instead of handling OAuth directly in frontend, call our API to get the authorization URL
      const response = await fetch('/api/twitter/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to initiate Twitter authentication: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Response data:', responseData);
      
      const { authUrl } = responseData;
      
      if (!authUrl) {
        throw new Error('No authUrl returned from API');
      }
      
      console.log('Redirecting to Twitter OAuth 1.0a:', authUrl);
      console.log('=== End Debug ===');
      
      // Redirect to Twitter OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('=== Error in Twitter Sign-In ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('=== End Error Debug ===');
      
      setLoading(false);
      
      toast({
        title: 'Authentication Error',
        description: error instanceof Error ? error.message : 'Failed to start Twitter authentication. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const defaultIcon = (
    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.67.9-.53 1.59-1.37 1.92-2.38-.84.5-1.77.86-2.76 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.21 0-.42-.01-.63.84-.6 1.56-1.36 2.14-2.16z" />
    </svg>
  );

  const displayIcon = icon === null ? null : (icon || defaultIcon);

  if (!isConfigured) {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          className="w-full py-3 rounded-lg bg-gray-500 text-white font-bold opacity-50 cursor-not-allowed flex items-center justify-center"
        >
          {displayIcon}
          Twitter Not Configured
        </button>
        <p className="text-xs text-red-400 mt-1">
          Missing NEXT_PUBLIC_TWITTER_CLIENT_ID environment variable
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleTwitterSignIn}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          displayIcon
        )}
        {loading ? 'Connecting...' : buttonText}
      </button>
      <p className="text-xs text-gray-400 mt-1 text-center">
        Using OAuth 1.0a for better compatibility
      </p>
    </div>
  );
} 