import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import VideoUpload from "./components/VideoUpload";
import Result from "./components/Result";
import LiveWebcam from "./components/LiveWebcam";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [prediction, setPrediction] = useState("");

  return (
    <div className="container">
      <Header />
      <h1>Defect Detection System</h1>
      <UploadForm setPrediction={setPrediction} />
      <VideoUpload />
      <Result prediction={prediction} />
      <LiveWebcam />
      <Footer />
    </div>
  );
}

export default App;
