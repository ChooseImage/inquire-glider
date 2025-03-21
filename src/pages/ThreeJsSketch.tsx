
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tallestBuildingsStory } from "@/utils/dummyData";

const ThreeJsSketch = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const navigate = useNavigate();

  // Setup Three.js scene and renderer
  useEffect(() => {
    console.log("Setting up Three.js sketch page");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Clear any existing renderer to prevent duplicates
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0.3); // Set a semi-transparent black background
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 10;
      cameraRef.current = camera;

      // Add lights to ensure objects are visible
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Create a simple, visible geometry
      const geometry = new THREE.BoxGeometry(3, 3, 3);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6,
        metalness: 0.7,
        roughness: 0.3
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Add a torus knot for visual interest
      const torusGeometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
      const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2
      });
      const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
      torusKnot.position.set(-4, 0, 0);
      scene.add(torusKnot);

      // Add a sphere
      const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.6,
        roughness: 0.4
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(4, 0, 0);
      scene.add(sphere);

      // Create a grid helper for orientation
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
      scene.add(gridHelper);

      // Add interaction handling
      let isDragging = false;
      let previousMousePosition = {
        x: 0,
        y: 0
      };

      // Mouse controls
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
          x: e.clientX,
          y: e.clientY
        };
      });

      canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
          };

          // Rotate scene
          if (sceneRef.current) {
            sceneRef.current.rotation.y += deltaMove.x * 0.005;
            sceneRef.current.rotation.x += deltaMove.y * 0.005;
          }

          previousMousePosition = {
            x: e.clientX,
            y: e.clientY
          };
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Zoom controls
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (cameraRef.current) {
          cameraRef.current.position.z += e.deltaY * 0.01;
          // Limit zoom range
          cameraRef.current.position.z = Math.max(3, Math.min(20, cameraRef.current.position.z));
        }
      });

      const animate = () => {
        if (!canvasRef.current) return;
        
        requestAnimationFrame(animate);
        
        // Rotate objects if not being dragged
        if (!isDragging) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          torusKnot.rotation.x += 0.01;
          torusKnot.rotation.y += 0.01;
          sphere.rotation.x += 0.01;
          sphere.rotation.y += 0.01;
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();

      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mouseup', () => { isDragging = false; });
        rendererRef.current?.dispose();
      };
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-background relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }} // Ensure canvas has a lower z-index
      />
      
      {/* Increased z-index and improved visibility of the header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-black/50 text-white z-50 pointer-events-auto">
        <Button
          variant="outline"
          size="sm" 
          onClick={() => navigate('/')}
          className="bg-white/40 hover:bg-white/60 text-white border-white/40 font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-xl font-bold">Three.js Visualization</h1>
      </div>
      
      {/* Increased z-index for the footer */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 text-white z-50 pointer-events-auto">
        <p className="text-sm text-center">
          {tallestBuildingsStory.scenes[0]?.data?.content_copy || 
            "Interactive 3D visualization with Three.js. Click and drag to rotate, use the scroll wheel to zoom in and out."}
        </p>
      </div>
    </div>
  );
};

export default ThreeJsSketch;
