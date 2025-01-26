'use client';
import { useState, useEffect } from 'react';

export default function Menu({ openMenu }) {
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Hide menu when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY) {
      setIsMenuVisible(false);
    } else {
      setIsMenuVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup scroll event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Toggle menu visibility when the logo is clicked
  const toggleMenuVisibility = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div>
       {/* Menu */}
       <div
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.01))",
            backgroundSize: "cover", // Cover to fit background
            width: '100vw',
            height: '12vh', // Use viewport height for responsiveness
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000, // Stay above other elements
            display: isMenuVisible ? 'flex' : 'none',
            justifyContent: 'space-between', // Space items apart
            alignItems: 'center',
            padding: '0 3rem',
            
          }}
        >
          {/* Logo */}
          <img
            src="/app-icon.png"
            alt="Custom Image"
            style={{
              width: 'auto', // Scales for mobile
              maxWidth: 'auto', // Caps logo size for large screens
              height: 'auto',
              display: 'block', // Hide on mobile
  }}
/>
         
    
          {/* Navbar */}
          <nav>
            <ul
              
              style={{
                display: 'flex',
                listStyle: 'none',
                margin: '0 10px',
                padding: 10,
                justifyContent: 'center',
                flexWrap: 'wrap', // Ensures items wrap on smaller screens if needed
                flexDirection: 'row',
                fontSize: '15px',
              }}
            >
             
              <li style={{ margin: '0 10px' }}>
                <a href="/" 
                onMouseEnter={(e) => e.currentTarget.style.color = 'yellow'} // Hover color
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'} // Revert back when hover ends
                style={{ color: 'white', textDecoration: 'none', fontSize: '15' }}>Home</a>
              </li>
            </ul>
           
          </nav>
      </div>



      {/* Logo (always visible) */}
      <div
  onClick={toggleMenuVisibility}
  style={{
    position: 'fixed',
    top: '30px', // Distance from the top
    
    flexDirection: 'flex-row-reverse',
    
    zIndex: 1100, // Ensure logo is above the menu
    cursor: 'pointer',
    display: isMenuVisible ? 'none' : 'flex', // Hide when menu is visible
    transition: 'all 0.8s slideIn', // Smooth transition
  }}
>
  <div style={{
    position: 'fixed', // Fixed position to stay in place
    top: '30px', // Distance from the top
    right: -100,
    justifyContent: 'center',
    justifyItems: 'center',
    transform: 'translateX(-50%)', // Adjust for the width of the image
    zIndex: 1100, // Ensure logo is above other elements
  }}
>
  <img
    src="/bdWhite2.png"
    alt="Custom Image"
    onMouseEnter={(e) => e.currentTarget.src = '/inverseOrangeBd.png'} // Hover image
    onMouseLeave={(e) => e.currentTarget.src = '/bdWhite2.png'} // Revert back when hover ends
    style={{
      width: '50%', // Scales for mobile
      maxWidth: '150px', // Caps logo size for large screens
      height: 'auto', // Maintain aspect ratio
      display: 'block',
       // Ensures the image is a block element
    }}
  />
</div>
      </div>
     
    </div>
  );
}