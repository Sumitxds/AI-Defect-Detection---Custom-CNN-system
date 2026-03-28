// responsible  for image data like showing history, recent 5 inspected product, total inspection data by diagram, download image data as csv file and more.

import React, { useState } from "react";
import axios from "axios";
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UploadForm = ({ setPrediction }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recentImages, setRecentImages] = useState([]);
  const [showRecent, setShowRecent] = useState(false); 
  const [showDiagram, setShowDiagram] = useState(false); 
  const [defectiveCount, setDefectiveCount] = useState(0);
  const [nonDefectiveCount, setNonDefectiveCount] = useState(0);
  const [totalInspectedImages, setTotalInspectedImages] = useState(0); 
  const [timeRange, setTimeRange] = useState("today"); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); 
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage(""); // Reset message before upload

    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(response.data.prediction);
      setImageUrl(`${API_URL}${response.data.image_url}`); 
      setMessage("Upload successful!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open(`${API_URL}/download_csv`, "_blank");
  };

  const fetchRecentImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/uploaded_images`); 
      setRecentImages(response.data);
      const defective = response.data.filter(img => img.result === "Defective").length;
      const nonDefective = response.data.filter(img => img.result === "Non-Defective").length;
      setDefectiveCount(defective);
      setNonDefectiveCount(nonDefective);
      setTotalInspectedImages(defective + nonDefective);
    } catch (error) {
      console.error("Error fetching recent images:", error);
    }
  };

  const fetchInspectionData = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspections?range=${timeRange}`);
      setDefectiveCount(response.data.defective);
      setNonDefectiveCount(response.data.non_defective);
      setTotalInspectedImages(response.data.total);
    } catch (error) {
      console.error("Error fetching inspection data:", error);
    }
  };

  const toggleRecentImages = () => {
    setShowRecent(!showRecent);
    if (!showRecent) {
      fetchRecentImages();
    }
  };

  const toggleDiagram = () => {
    setShowDiagram(!showDiagram);
    if (!showDiagram) {
      fetchInspectionData();
    }
  };

  const data = {
    labels: ['Defective', 'Non-Defective'],
    datasets: [
      {
        label: 'Image Count',
        data: [defectiveCount, nonDefectiveCount],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      },
    ],
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload & Predict"}
      </button>
      {message && <p>{message}</p>} {/* Display success/error message */}
      {imageUrl && <img src={imageUrl} alt="Processed" style={{ marginTop: '20px', maxWidth: '100%' }} />}
      <button onClick={handleDownloadCSV} style={{ marginTop: '20px' }}>
        Download CSV
      </button>
      <button onClick={toggleRecentImages} style={{ marginTop: '20px' }}>
        {showRecent ? "Hide Recent Images" : "Show Recent Images"}
      </button>
      {showRecent && (
        <div>
          {recentImages.map((img) => (
            <div key={img.filename}>
              <p>{img.filename}: {img.result}</p>
            <img src={`${API_URL}/uploads/${img.filename}`} alt={img.filename} style={{ maxWidth: '100px', margin: '10px' }} />
            </div>
          ))}
          <p>Total Inspected Images: {totalInspectedImages}</p> {/* Display total inspected images */} 
        </div>
      )}
      <select onChange={(e) => setTimeRange(e.target.value)} value={timeRange} style={{ marginTop: '20px' }}>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last_7_days">Last 7 Days</option>
        <option value="last_30_days">Last 30 Days</option>
      </select>
      <button onClick={fetchInspectionData} style={{ marginTop: '20px' }}>
        Fetch Inspection Data
      </button>
      <button onClick={toggleDiagram} style={{ marginTop: '20px' }}>
        {showDiagram ? "Hide Diagram" : "Show Diagram"}
      </button>
      {showDiagram && (
          <div>
            <Bar data={data} />
            <p>Total Inspected Images: {totalInspectedImages}</p> {/* Display total inspected images below the diagram */}
          </div>
      )}
    </div>
  );
};

export default UploadForm;
