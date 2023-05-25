import React, { useState } from "react";

const Video = () => {//basico video rodando com tsx pego pelo note
    const [vid, setVid] = useState(null);
  
    const handleChange = (event) => {//logica pause
      setVid(URL.createObjectURL(event.target.files[0]));
    };

    return (
        <>
          <input type="file" onChange={handleChange} />
          <iframe src={vid}></iframe>
        </>
      );
  }

  export default Video;