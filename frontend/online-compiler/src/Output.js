import React from 'react';

const Output = (props) => {
  const textareaStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "none",
    resize: "none",
    outline: "none",
    padding: "10px",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "14px",
    boxSizing: "border-box",
    whiteSpace: "pre-wrap",
  };

  return (
    <div>
      <div style={{ height: "80vh", backgroundColor: '#1e1e1e', padding: "10px", boxSizing: "border-box" }}>
        <textarea 
          id="output" 
          readOnly={props.read} 
          cols={70} 
          rows={10} 
          onKeyDown={props.handleKeyDown} 
          value={props.output} 
          onChange={props.handleOutputChange}
          style={textareaStyle}
        ></textarea>
      </div>
    </div>
  );
}

export default Output;