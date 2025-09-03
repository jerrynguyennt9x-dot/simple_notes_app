"use client";

import React, { useRef, useEffect } from "react";

interface ShaderBackgroundProps {
  className?: string;
}

export default function ShaderBackground({ className = "" }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Set canvas dimensions to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      varying vec2 vUv;
      
      void main() {
        gl_Position = aVertexPosition;
        vUv = aVertexPosition.xy * 0.5 + 0.5;
      }
    `;

    // Fragment shader program - nice gradient with moving waves
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      
      vec3 colorA = vec3(0.1, 0.3, 0.9);  // Blue
      vec3 colorB = vec3(0.3, 0.6, 1.0);  // Light blue
      vec3 colorC = vec3(0.5, 0.2, 0.8);  // Purple
      
      void main() {
        vec2 uv = vUv;
        
        // Create multiple moving waves
        float wave1 = sin(uv.x * 10.0 + uTime * 0.5) * 0.1;
        float wave2 = sin(uv.y * 8.0 + uTime * 0.4) * 0.1;
        
        // Combine waves
        uv.y += wave1;
        uv.x += wave2;
        
        // Create gradient
        vec3 color = mix(colorA, colorB, uv.y);
        color = mix(color, colorC, uv.x * uv.y);
        
        // Add some variation
        float brightness = sin(uTime * 0.2) * 0.1 + 0.9;
        color *= brightness;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Initialize a shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;
    
    // Collect all the info needed to use the shader program
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        time: gl.getUniformLocation(shaderProgram, "uTime"),
      },
    };
    
    // Create buffer for positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Create a square that covers the entire canvas
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    let startTime = Date.now();
    
    function render() {
      // Calculate time
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Tell WebGL how to pull out the positions from the position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2, // 2 components per vertex
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      
      // Tell WebGL to use our program
      gl.useProgram(programInfo.program);
      
      // Set the shader uniforms
      gl.uniform1f(programInfo.uniformLocations.time, elapsedTime);
      
      // Draw the square
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Request animation frame
      requestAnimationFrame(render);
    }
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (shaderProgram && positionBuffer) {
        gl.deleteProgram(shaderProgram);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);
  
  // Helper function to initialize a shader program
  function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    // Create the shader program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return null;
    
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    
    return shaderProgram;
  }
  
  // Helper function to load a shader
  function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    // Send the source to the shader object
    gl.shaderSource(shader, source);
    
    // Compile the shader program
    gl.compileShader(shader);
    
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`} 
    />
  );
}
