import React, { useState } from "react";
import Modal from "react-modal";
import "./App.css";

function App() {
  const [panels, setPanels] = useState(Array.from({ length: 10 }, () => ""));
  const [comicImages, setComicImages] = useState(Array(10).fill(null));
  const [showComic, setShowComic] = useState(false);

  const handleInputChange = (index, value) => {
    const updatedPanels = [...panels];
    updatedPanels[index] = value;
    setPanels(updatedPanels);
  };

  const generateComic = async () => {
    try {
      const imagePromises = panels.map(async (panelText, index) => {
        setComicImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = "Receiving...";
          return updatedImages;
        });

        const response = await query({ inputs: panelText });
        const imageUrl = URL.createObjectURL(response);

        setComicImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = imageUrl;
          return updatedImages;
        });
      });

      await Promise.all(imagePromises);
    } catch (error) {
      console.error("Error generating comic:", error);
      setComicImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages.fill("Error loading image");
        return updatedImages;
      });
    }
  };

  const query = async (data) => {
    try {
      const response = await fetch(
        "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
        {
          method: "POST",
          headers: {
            Accept: "image/png",
            Authorization:
              "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${
            response.status
          }: ${await response.text()}`
        );
      }

      return response.blob();
    } catch (error) {
      console.error("Error in API request:", error);
      throw error;
    }
  };
  const openModal = () => {
    setShowComic(true);
  };

  const closeModal = () => {
    setShowComic(false);
  };
  return (
    <div className="App">
      <h1>Comic Creator</h1>
      <table>
        <thead>
          <tr>
            <th>Panel</th>
            <th>Text Input</th>
            <th>Generated Image</th>
          </tr>
        </thead>
        <tbody>
          {panels.map((text, index) => (
            <tr key={index}>
              <td>{`Panel ${index + 1}`}</td>
              <td>
                <label
                  htmlFor={`panel${index + 1}`}
                  className="sr-only"
                >{`Panel ${index + 1} Text:`}</label>
                <textarea
                  id={`panel${index + 1}`}
                  value={text}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </td>
              <td>
                {comicImages[index] === "Receiving..." ? (
                  <p>{comicImages[index]}</p>
                ) : comicImages[index] === "Error loading image" ? (
                  <p style={{ color: "red" }}>{comicImages[index]}</p>
                ) : (
                  <div className="comic-panel">
                    <img
                      src={comicImages[index]}
                      alt={`Generated Comic Panel ${index + 1}`}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={generateComic}>
        Generate Comic
      </button>

      <button type="button" onClick={openModal}>
        Show Comic Panel
      </button>
      <Modal
        isOpen={showComic}
        onRequestClose={closeModal}
        contentLabel="Comic Panel Modal"
        className="comic-modal"
        overlayClassName="comic-overlay"
      >
        <div className="comic-modal-content">
          {comicImages.map((imageUrl, index) => (
            <div key={index} className="comic-panel">
              <img src={imageUrl} alt={`Generated Comic Panel ${index + 1}`} />
            </div>
          ))}
        </div>
        <button className="close-modal-button" onClick={closeModal}>
          Close
        </button>
      </Modal>
    </div>
  );
}

export default App;
