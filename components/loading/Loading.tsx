import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="custom-loader"></div>
    </div>
  );
};

export default Loading;
