import React, { useState, useEffect } from 'react';

const Explorer = () => {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTraitTypes, setSelectedTraitTypes] = useState([]);
  const [selectedTraitValues, setSelectedTraitValues] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [isExpanded, setIsExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  const [isSortedByRank, setIsSortedByRank] = useState(false);

  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const url = `https://bitdog-worker.brendano388.workers.dev?page=${currentPage}&limit=${itemsPerPage}`;

  useEffect(() => {
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://bitdogs.vercel.app'
      },
    })
      .then(response => response.json())
      .then(data => {
        setNfts(data || []);
        setFilteredNfts(data.meta || []);
      })
      .catch(err => console.error('Error fetching data:', err));
  }, [currentPage]);

  const traitTypes = Array.from(new Set(nfts.flatMap(nft => nft.meta.attributes.map(attr => attr.trait_type))));
  const traitValues = traitTypes.reduce((acc, traitType) => {
    acc[traitType] = Array.from(
      new Set(
        nfts.flatMap(nft =>
          nft.meta.attributes
            .filter(attr => attr.trait_type === traitType)
            .map(attr => attr.value)
        )
      )
    );
    return acc;
  }, {});

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap";
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // Clean up when the component unmounts
    };
  }, []);

  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    filterNfts(e.target.value, selectedCollections, selectedTraitTypes, selectedTraitValues);
  };

  const handleFilterCollection = (e) => {
    const value = e.target.value;
    setSelectedCollections(prev => 
      prev.includes(value) ? prev.filter(collection => collection !== value) : [...prev, value]
    );
    filterNfts(searchQuery, selectedCollections, selectedTraitTypes, selectedTraitValues);
  };

  const handleTraitTypeChange = (traitType) => {
    setSelectedTraitTypes(prev => {
      if (prev.includes(traitType)) {
        return prev.filter(type => type !== traitType);
      } else {
        return [...prev, traitType];
      }
    });
  };

  const handleTraitValueChange = (traitType, value) => {
    setSelectedTraitValues(prev => {
      const currentValues = prev[traitType] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [traitType]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prev,
          [traitType]: [...currentValues, value],
        };
      }
    });
  };;

  const filtered = nfts.filter(nft => {
    const nftName = nft.name ? nft.name.toLowerCase() : ''; 
    const searchLowered = searchQuery ? searchQuery.toLowerCase() : ''; 
  
    const matchesSearch = nftName.includes(searchLowered);
  
    const matchesTraits = selectedTraitTypes.every(traitType => {
      const values = selectedTraitValues[traitType] || []; // Ensure this is an array
      const traitValue = nft.meta.attributes.find(attr => attr.trait_type === traitType)?.value;
      return values.length === 0 || values.includes(traitValue);
    });
  
    return matchesSearch && matchesTraits;
  });

  // Calculate total pages based on filtered NFTs
  const totalPages = Math.ceil(filteredNfts.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleSortByRank = () => {
    const sortedNfts = [...filteredNfts].sort((a, b) => {
      const rankA = a.meta.attributes.find(attr => attr.trait_type === 'Rank');
      const rankB = b.meta.attributes.find(attr => attr.trait_type === 'Rank');
      
      return (rankA.value - rankB.value); // Adjust based on how your rank values are structured
    });
    setFilteredNfts(sortedNfts);
  };

  useEffect(() => {
    const filtered = nfts.filter(nft => {
      // Ensure nft.name is defined
      const nftName = nft.name ? nft.name.toLowerCase() : ''; // Check if nft.name exists
      const searchLowered = searchQuery ? searchQuery.toLowerCase() : ''; // Ensure searchQuery is defined
  
      const matchesSearch = nftName.includes(searchLowered);
  
      // Check if all selected trait types match selected values
      const matchesTraits = selectedTraitTypes.every(traitType => {
        const values = selectedTraitValues[traitType] || [];
        // Find the attribute for the current traitType
        const traitValue = nft.meta.attributes.find(attr => attr.trait_type === traitType)?.value;
        return values.length === 0 || values.includes(traitValue);
      });
  
      return matchesSearch && matchesTraits;
    });
  
    setFilteredNfts(filtered);
  }, [nfts, searchQuery, selectedTraitTypes, selectedTraitValues]);

  // Function to clear filters
    const clearFilters = () => {
      setSearchQuery('');
      setSelectedTraitTypes([]);
      setSelectedTraitValues([]);
      setFilteredNfts(nfts);
      setIsSortedByRank(false); // Reset to original NFTs if necessary
    };

    const toggleFilter = () => {
      setIsExpanded((prev) => !prev);
    };

    useEffect(() => {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };
  
      // Initial check
      handleResize();
  
      // Add event listener to handle window resize
      window.addEventListener('resize', handleResize);
  
      // Cleanup on component unmount
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    const defaultNfts = [...nfts]; 
    const handleSortToggle = () => {
      setIsSortedByRank((prev) => !prev);
      if (!isSortedByRank) {
        handleSortByRank(); // Apply sorting when turned on
      }
      else {
        setNfts(defaultNfts); // Reset to default NFTs when toggled off
    }
    };

    const containerStyle = {
      height: isExpanded ? '100%' : '0', // Adjust height based on state
      backgroundColor: '#000000',
      opacity: 1,
      borderRight: '1px solid #333',
      padding: isExpanded ? '5rem' : '0', // Adjust padding for transition
      position: 'fixed',
      width: isDesktop ? '30%' : '100vw', // Fixed width for desktop, full width for mobile
      left: '0',
      top: '0', // Stick to the top of the viewport
      overflowY: 'auto', // Allow scrolling if content is long
      color: '#fff',
      zIndex: 100,
      transition: 'height 0.3s, padding 0.3s, width 0.3s', // Smooth transition
    };

    
    return (
      <>
        <div
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5))",
            backgroundSize: "cover", // Cover to fit background
            width: '100vw',
            height: '10vh', // Use viewport height for responsiveness
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000, // Stay above other elements
            display: 'flex',
            justifyContent: 'space-between', // Space items apart
            alignItems: 'center',
            padding: '0 2rem', // Padding for spacing
          }}
        >
          {/* Logo */}
          <img
            src="/bdLogo4.png"
            alt="Custom Image"
            style={{
              width: '20vw', // Scales for mobile
              maxWidth: '150px', // Caps logo size for large screens
              height: 'auto',
            }}
          />
    
          {/* Navbar */}
          <nav>
          <ul
              
              style={{
                display: 'flex',
                listStyle: 'none',
                margin: 1,
                padding: 0,
                left: 0,
                justifyContent: 'center',
                flexWrap: 'wrap',
                
                flexDirection: 'row',
              }}
            >
              <li style={{ margin: '0 1rem' }}>
                <a href="/" 
                onMouseEnter={(e) => e.currentTarget.style.color = 'yellow'} // Hover color
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'} // Revert back when hover ends
                style={{ color: 'white', textDecoration: 'none', fontSize: '25px' }}>Home</a>
              </li>
              <li style={{ margin: '0 1rem' }}>
                <a href="https://runestake.io/collection/bitdogs" 
                onMouseEnter={(e) => e.currentTarget.style.color = 'yellow'} // Hover color
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'} // Revert back when hover ends
                style={{ color: 'white', textDecoration: 'none', fontSize: '25px', }}>Staking</a>
              </li>
              <li style={{ margin: '0 1rem' }}>
                <a href="explorer" 
                onMouseEnter={(e) => e.currentTarget.style.color = 'yellow'} // Hover color
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'} // Revert back when hover ends
                style={{ color: 'white', textDecoration: 'none',fontSize: '25px',
                }}>Explorer</a>
              </li>
            </ul>
          </nav>
        </div>
    
        <div
          style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center',
            height: '100vh',
            top: 0,
            display: 'flex',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'black',
            paddingTop: '12vh', // Adjust padding to avoid overlap with the fixed navbar
          }}
        >
          {/* Filter Button */}
          <button 
            onClick={toggleFilter} 
            style={{ 
              visibility: isDesktop ? 'hidden' : 'visible', // Hide on mobile
              width: '10vw',
              height: '40px', // Adjusted height for better visibility
              backgroundColor: 'transparent',
              alignItems: 'left',
              justifyContent: 'left',
              display: 'flex',
              borderRadius: '5px',
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer',
              top: '8vh',
              left: '13vw',
              position: 'fixed',
              zIndex: 1000
            }}
          >
            {isExpanded ? (
  // When expanded, show "X"
  <div style={{ 
    width: '35px', 
    height: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1px',
    borderColor: 'white',
    border: '1px solid',
    color: 'red',
    fontSize: '30px',
    fontWeight: 'bold',
  }}>
    X
  </div>
) : (
  // When not expanded, show the image
  <img 
    src="filter.png" 
    alt="Filter" 
    style={{ 
      width: '35px', 
      height: '35px',
      borderRadius: '1px',
      borderColor: 'white',
      border: '1px solid',
      rotate: isExpanded ? 0 : 180,
      transition: 'rotate 0.3s',
    }} 
  />
)}

          </button>
          
          {/* Filter Container */}
          <div style={containerStyle}>
            {isExpanded && ( // Render content only when expanded
        <>
          <h3 style={{ fontSize: '30px',
                       fontWeight: 'bold',
                       color: '#f0f0f0',
                       paddingTop: '40px',
                       letterSpacing: '0.1rem',
                     
                     }}>Filter by Traits</h3>
          <br />
          {/* Trait Type Filter */}
          <h4 style={{  color: '#555',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#f0f0f0'  

          }}>Trait Type</h4>
          
          {traitTypes.map((traitType) => (
            <div key={traitType} style={{ margin: '0.5rem 0' }}>
              <label style={{ display: 'block', 
                              cursor: 'pointer', 
                              fontSize: '20px'  }} onClick={() => handleTraitTypeChange(traitType)}>
        {/* Conditional rendering for "+" and "-" symbols */}
                <span style={{  marginRight: '2rem', 
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: 'bold'
                              }}>
                  {selectedTraitTypes.includes(traitType) ? '-' : '+'}
                </span>
                {traitType}
              </label>

              {traitType === 'Rank' ? (
                <button
                onClick={handleSortToggle}
                style={{
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: isSortedByRank ? '#28a745' : '#007bff', // Change color based on state
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
              >
                {isSortedByRank ? 'Sorted by Rank' : 'Sort by Rank'}
              </button>
              ) : (
                selectedTraitTypes.includes(traitType) && (
                  <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {traitValues[traitType]?.map((value) => (
                      <label key={value} style={{ display: 'block', margin: '0.5rem 0' }}>
                        <input
                          type="checkbox"
                          name="traitValue"
                          checked={selectedTraitValues.value}
                          onChange={() => handleTraitValueChange(traitType, value)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                )
              )}
            </div>
          ))}
          <button
            onClick={clearFilters}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#dc3545',
              color: '#fff',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Clear All Filters
          </button>

          
        </>
            )}

  
          </div>
    
          {/* NFT Grid */}
          
<div
  style={{
    width: isDesktop ? 'calc(100vw - 30%)' : '100vw', // Adjust width for desktop
    marginLeft: isDesktop ? '30%' : '0', // Shift content to the right on desktop
    transition: 'margin-left 0.3s',
    top: 0,
    padding: '5rem',
    overflowY: 'auto',
    overflowX: 'hidden', // Prevent horizontal scrolling
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.2)), url('/bckgOne.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '110vh',
    position: 'relative', // Change to relative
  }}
>
   {/* Pagination */}
   <div style={{ 
      textAlign: 'center', 
      marginTop: '1rem',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      }}>
    
      <button
        onClick={() => handlePageChange('prev')}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.5rem',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'black',
          color: '#fff',
          cursor: 'pointer',
          marginLeft: '0.5rem',
        }}
      >
        {/* Left Arrow Unicode */}
        &#8592;
      </button>
      <span style={{ margin: '0 0.5rem', color: '#fff' }}>Page {currentPage} of {totalPages}</span>
      <button
        onClick={() => handlePageChange('next')}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.5rem',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'black',
          color: '#fff',
          cursor: 'pointer',
          marginLeft: '0.5rem',
        }}
      >
        {/* Right Arrow Unicode */}
        &#8594;
      </button>
  </div>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      paddingTop: '5rem',
    }}
  >
    {filteredNfts
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((nft) => (
        <div
          key={nft.tokenId}
          onClick={() => setSelectedNFT(nft)}
          style={{
            cursor: 'pointer',
            padding: '0.5rem',
            border: '1px solid #333',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'transform 0.2s',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          <img
            src={nft.meta.high_res_img_url}
            alt={nft.name || 'NFT Image'}
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />
          <h4 style={{ color: '#f0f0f0', fontSize: '20px', textAlign: 'center', margin: '0.5rem 0' }}>Bitdog #{nft.meta.name}</h4>
        </div>
      ))}
  </div>

</div>
    
         {/* NFT Modal */}
         {selectedNFT && (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      height: 'auto',
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.95)), url('/ptrnBckg.png')",
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      padding: '2rem',
      overflowY: 'auto',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      borderRadius: '15px',
      boxSizing: 'border-box',
    }}
  >
    {/* Close and Download Buttons */}
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%',
      marginBottom: '1rem',
    }}>
      {/* Close Button */}
      <button
        onClick={() => setSelectedNFT(null)}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#dc3545',
          color: '#fff',
          cursor: 'pointer',
          marginRight: '0.5rem',

          // Adjust padding and font size for mobile
          '@media (max-width: 768px)': {
            padding: '0.4rem 0.8rem',
            fontSize: '14px',
          },
        }}
      >
        Close
      </button>

      {/* Download Button */}
      <button
        onClick={() => {
          const link = document.createElement('a');
          link.href = `https://assets.bitdogs.io/bitdogs_full_res/${selectedNFT.meta.name}.webp`; // Image URL
          link.download = `${selectedNFT.meta.name}-Hi-Res.jpg`; // Custom filename for the downloaded image

          // Append the link to the body to ensure proper download behavior
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#007bff', // Customize background color
          color: '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.3s',

          // Adjust padding and font size for mobile
          '@media (max-width: 768px)': {
            padding: '0.4rem 0.8rem',
            fontSize: '14px',
          },
        }}
      >
        View Hi-Res Bitdog
      </button>
    </div>

    {/* NFT Name */}
    <div style={{ color: 'white', textAlign: 'center', fontSize: '30px', paddingTop: '10px', fontWeight: 'bold', marginBottom: '1rem' }}>
      <h3>Bitdog #{selectedNFT.meta.name}</h3>
    </div>

    {/* NFT Image */}
    <img
      src={selectedNFT.meta.high_res_img_url}
      alt={selectedNFT.meta.name}
      style={{
        maxWidth: '100%',
        maxHeight: '500px',
        marginBottom: '1rem',
        borderRadius: '10px',
        objectFit: 'contain',
      }}
    />

    {/* Attributes */}
    <div
      style={{
        marginTop: '1rem',
        color: '#ff4900',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
      }}
    >
      <h4>Attributes:</h4>
      {selectedNFT.meta.attributes.map((attribute, index) => (
        <div
          key={index}
          style={{
            display: 'inline-block',
            margin: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '15px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            color: '#333',
          }}
        >
          {attribute.trait_type}: {attribute.value}
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </>
    );
    
};

export default Explorer;
