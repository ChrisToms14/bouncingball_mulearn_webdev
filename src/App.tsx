import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const BALL_COUNT = 20;
const BALL_RADIUS = 12;
const SPEED_MULTIPLIER = 2;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const ballsRef = useRef<Ball[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [ballCount, setBallCount] = useState(BALL_COUNT);

  // Generate random colors
  const getRandomColor = useCallback(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Initialize balls
  const initializeBalls = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const balls: Ball[] = [];
    
    for (let i = 0; i < BALL_COUNT; i++) {
      balls.push({
        id: i,
        x: Math.random() * (canvas.width - BALL_RADIUS * 2) + BALL_RADIUS,
        y: Math.random() * (canvas.height - BALL_RADIUS * 2) + BALL_RADIUS,
        vx: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        vy: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        radius: BALL_RADIUS,
        color: getRandomColor()
      });
    }
    
    ballsRef.current = balls;
    setBallCount(balls.length);
  }, [getRandomColor]);

  // Update ball positions and handle collisions
  const updateBalls = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ballsRef.current.forEach(ball => {
      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) {
        ball.vx = -ball.vx;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
      }
      
      if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
        ball.vy = -ball.vy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
      }
    });
  }, []);

  // Draw balls on canvas
  const drawBalls = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw balls
    ballsRef.current.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (isPlaying) {
      updateBalls();
      drawBalls();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, updateBalls, drawBalls]);

  // Handle canvas resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }, []);

  // Initialize and start animation
  useEffect(() => {
    resizeCanvas();
    initializeBalls();
    
    const handleResize = () => {
      resizeCanvas();
      initializeBalls();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas, initializeBalls]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Bouncing Balls</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-lg">Balls: {ballCount}</span>
          
          <button
            onClick={togglePlayPause}
            className="p-2 border rounded hover:bg-gray-100"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default App;