import React, { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || '';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a video");

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/upload_video`, formData);
      setVideoUrl(`${API_URL}${response.data.video_url}`);
      setMetadata(response.data.predictions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h3>Video Upload & Analysis</h3>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload Video'}
      </button>
      {videoUrl && (
        <div>
          <video src={videoUrl} controls width="600" />
          <h4>Predictions:</h4>
          <ul>
            {metadata.map((pred, i) => (
              <li key={i}>Frame {pred.frame}: {pred.result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;

