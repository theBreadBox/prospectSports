import Image from 'next/image';

const TwitterLogin = () => {
  const handleXLogin = async () => {
    try {
      console.log('Initiating Twitter login'); // Debug log
      const response = await fetch('/api/x/request-token', {
        method: 'POST',
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error('Failed to get request token');
      }
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (!data.oauth_token) {
        throw new Error('No oauth_token in response');
      }
      
      window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}`;
    } catch (error) {
      console.error('Error during Twitter authentication:', error);
    }
  };

  return (
    <button
      onClick={handleXLogin}
      style={{
        backgroundColor: '#000000',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      <Image
        src="/x-logo.png"
        alt="X Logo"
        width={20}
        height={20}
      />
      Sign in with X
    </button>
  );
};

export default TwitterLogin;