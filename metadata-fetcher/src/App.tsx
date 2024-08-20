import React, { useState } from "react";
import axios from "axios";
import "./App.css";

interface Metadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  error?: string;
}

const App: React.FC = () => {
  const [urls, setUrls] = useState<string[]>(["", "", ""]); // Start with 3 empty inputs
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length > 3) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleChangeUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const invalidUrls = urls.filter((url) => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setError("One or more URLs are invalid. Please check your input.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/fetch-metadata",
        { urls }
      );
      setMetadata(response.data);
    } catch (err) {
      setError("Failed to fetch metadata. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>URL Metadata Fetcher</h1>
      <form onSubmit={handleSubmit}>
        {urls.map((url, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              type="url"
              value={url}
              onChange={(e) => handleChangeUrl(index, e.target.value)}
              placeholder={`URL ${index + 1}`}
              required
            />
            {urls.length > 3 && (
              <button
                type="button"
                onClick={() => handleRemoveUrl(index)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddUrl}>
          Add URL
        </button>
        <button type="submit" disabled={urls.length < 3 || loading}>
          {loading ? "Fetching..." : "Submit"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="metadata-results">
        {metadata.map((item, index) => (
          <div key={index} className="metadata-item">
            <h2>{item.title || "No Title"}</h2>
            <p>{item.description || "No Description"}</p>
            {item.image && <img src={item.image} alt={item.title} />}
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Visit Site
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
