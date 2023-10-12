import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import './App.css';

function App() {
  const [generatedImageID, setGeneratedImageID] = useState(null);
  const [generatedImageURL, setGeneratedImageURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const [loadingMessage, setLoadingMessage] = useState(''); // Initialize with an empty message
  const [userPreferences, setUserPreferences] = useState({
    gender: 50, // Initialize to the middle value
    style: 50,
    equipment: 50,
  });

  const loadingMessages = [
    "Searching for buried treasure...",
    "Calibrating the quantum compass...",
    "Contacting Blackbeard...",
    "Adjusting the cyber cannons...",
    "Checking the pirate code...",
  ];

  const getRandomLoadingMessage = () => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
  };

  const handleSliderChange = (event, preference) => {
    const newValue = event.target.value;
    setUserPreferences({
      ...userPreferences,
      [preference]: newValue,
    });
  };

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer 00e56c5a-707a-47f7-8795-a0de4fb80a4a'
    },
    body: JSON.stringify({
      height: 1024,
      prompt: 'selfie picture style, angry and dark futuristic cyberpirate, carribean beach, pink violet rosa venom green neonlights, at moonlight night, tropical carribean island, ultra detailed, photorealistic, professional illumination, 8k textures, fine tune, mantain proportions, masterpiece, cyberpunk pirate style, realistic textures, unreal 5 rendered, raytraced,',
      width: 768,
      controlNet: false,
      expandedDomain: true,
      guidance_scale: 7,
      highContrast: true,
      highResolution: false,
      alchemy: true,
      contrastRatio: 1,
      nsfw: false,
      photoReal: true,
      presetStyle: 'CREATIVE',
      num_images: 1,
      promptMagic: true,
      promptMagicVersion: 'v3',
      public: false,
      sd_version: 'v2'
    })
  };

  const fetchImgURLs = async (generationID) => {
    for (let attempt = 1; attempt <= 15; attempt++) { // Attempt up to 10 times
      console.log(`Attempt ${attempt}: Fetching img URL...`);
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer 6ecef0ad-8b8e-45b2-987d-f552f53275a8'
        }
      };

      try {
        const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationID}`, options);
        const responseData = await response.json();

        if (response.status === 200) {
          if (responseData.generations_by_pk.generated_images.length === 0) {
          } else {
            return responseData.generations_by_pk.generated_images;
          }
        } else {
          console.log(`Attempt ${attempt}: Image retrieval failed with status ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
    }

    console.error('Image retrieval failed after 10 attempts');
    return null;
  };

  const generateImg = async () => {
   
    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', options);
      const responseData = await response.json();

      if (response.status === 200 && responseData) {
        
        // Extract the image URL from the response
        const generationID = responseData.sdGenerationJob.generationId;

        const imageUrls = await fetchImgURLs(generationID);

        if (imageUrls && imageUrls.length > 0) {
          setGeneratedImageURL(imageUrls[0].url);
        } else {
          console.error('Error fetching image URLs:', imageUrls);
        }
      } else {
        console.error('Error generating image:', responseData);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setIsLoading(false); // Set loading state to false when done
    }
  };

  useEffect(() => {
    const loadingMessageInterval = setInterval(() => {
      setLoadingMessage(getRandomLoadingMessage());
    }, 3000);

    return () => {
      clearInterval(loadingMessageInterval);
    };
  }, []);

  return (
    <div className='section'>
      <div className='container'>
        <div className='row'>
          <div className='column'>
            <h1>Galleon PFP Generator</h1>
            <p>Customize and mint your own cyber pirate 🏴‍☠️</p>
            <div className="preferences">
              <p>Style: {userPreferences.style > 50 ? 'Pirate 🏴‍☠️' : 'Cyber 🦾'}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={userPreferences.style}
                onChange={(e) => handleSliderChange(e, 'style')}
              />
              <p>Equipment: {userPreferences.equipment > 50 ? 'High tech 🎚️' : 'Low tech 🔧'}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={userPreferences.equipment}
                onChange={(e) => handleSliderChange(e, 'equipment')}
              />
              <p>Gender: {userPreferences.gender > 50 ? 'Female ♀' : 'Male ⚦'}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={userPreferences.gender}
                onChange={(e) => handleSliderChange(e, 'gender')}
              />
              <button onClick={generateImg}>Generate</button>
            </div>
          </div>
          <div className='column'>
            <div className="nft-placeholder">
              {isLoading ? (
                <div className="loader-container">
                  <div className="loader"></div>
                  <p className="loading-message">{loadingMessage}</p>
                </div>
              ) : generatedImageURL && (
                <div>
                  <img className='nft' src={generatedImageURL} alt="Generated NFT" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;