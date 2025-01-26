// components/FruitGame.js
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../styles"; // Ensure the correct path to your CSS module
import { Canvas } from '@react-three/fiber';

const FRUIT_COUNT = 10;

const FruitGame = () => {
  const canvasRef = useRef(null);
  const scoreContainerRef = useRef(null);
  const startButtonRef = useRef(null);
  const coverScreenRef = useRef(null);
  const resultRef = useRef(null);
  const overTextRef = useRef(null);

  const [points, setPoints] = useState(0);
  const [fruits, setFruits] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const base = "./public/";
    const fruitsList = ["apple", "banana", "grapes"];
    let interval;
    let randomCreationTime;
    let deviceType = "";

    const isTouchDevice = () => {
      try {
        document.createEvent("TouchEvent");
        deviceType = "touch";
        return true;
      } catch (e) {
        deviceType = "mouse";
        return false;
      }
    };

    const generateRandomNumber = (min, max) =>
      Math.floor(Math.random() * (max - min + 1) + min);

    function Fruit(imageSrc, x, y, width) {
      this.image = new Image();
      this.image.src = imageSrc;
      this.x = x;
      this.y = y;
      this.speed = generateRandomNumber(1, 5);
      this.width = width;
      this.clicked = false;
      this.complete = false;
      this.loaded = false;
    
      this.image.onload = () => {
        this.loaded = true;
      };
    
      // Move fruit
      this.update = () => {
        this.y += this.speed;
        if (!this.complete && this.y + this.width > canvas.height) {
          this.complete = true;
        }
      };
    
      // Draw fruit
      this.draw = () => {
        if (this.loaded) {
          ctx.drawImage(this.image, this.x, this.y, this.width, this.width);
        }
      };
    
      this.compare = (mouseX, mouseY) => {
        return (
          mouseX >= this.x &&
          mouseX <= this.x + this.width &&
          mouseY >= this.y &&
          mouseY <= this.y + this.width
        );
      };
    }

    const createRandomFruit = () => {
      randomCreationTime = generateRandomNumber(3, 9);
      if (fruits.length < FRUIT_COUNT) {
        const randomFruit =
          fruitsList[generateRandomNumber(0, fruitsList.length - 1)];
        const randomImage = `${base}${randomFruit}.png`;
        const randomX = generateRandomNumber(0, canvas.width - 50);
        const fruitWidth = generateRandomNumber(100, 200);
        const fruit = new Fruit(randomImage, randomX, 0, fruitWidth);
        setFruits((prevFruits) => [...prevFruits, fruit]);
      }
      if (fruits.length === FRUIT_COUNT) {
        const checker = fruits.every((fruit) => fruit.complete === true);
        if (checker) {
          clearInterval(interval);
          coverScreenRef.current.classList.remove("hide");
          canvas.classList.add("hide");
          overTextRef.current.classList.remove("hide");
          resultRef.current.innerText = `Final Score: ${points}`;
          startButtonRef.current.innerText = "Restart Game";
          scoreContainerRef.current.classList.add("hide");
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const fruit of fruits) {
        fruit.update();
        fruit.draw();
      }
      requestAnimationFrame(animate);
    };

    animate();
    isTouchDevice();

    const handleCanvasClick = (e) => {
      const clickX =
        (deviceType === "touch" ? e.touches[0].pageX : e.pageX) - canvas.offsetLeft;
      const clickY =
        (deviceType === "touch" ? e.touches[0].pageY : e.pageY) - canvas.offsetTop;
      setFruits((prevFruits) =>
        prevFruits.map((fruit) => {
          if (fruit.compare(clickX, clickY) && !fruit.clicked) {
            setPoints((prevPoints) => prevPoints + 1);
            return { ...fruit, clicked: true, complete: true, y: canvas.height };
          }
          return fruit;
        })
      );
    };

    canvas.addEventListener(deviceType === "touch" ? "touchstart" : "mousedown", handleCanvasClick);
    canvas.addEventListener("touchend", (e) => e.preventDefault());

    startButtonRef.current.addEventListener("click", () => {
      setFruits([]);
      setPoints(0);
      scoreContainerRef.current.innerHTML = 0;
      canvas.classList.remove("hide");
      coverScreenRef.current.classList.add("hide");
      createRandomFruit();
      randomCreationTime = generateRandomNumber(3, 9);
      interval = setInterval(createRandomFruit, randomCreationTime * 1000);
      scoreContainerRef.current.classList.remove("hide");
    });

    return () => {
      clearInterval(interval);
      canvas.removeEventListener(deviceType === "touch" ? "touchstart" : "mousedown", handleCanvasClick);
    };
  }, [fruits, points]);

  return (
    <div>
      <div ref={coverScreenRef} className={styles.coverScreen + " hide"}>
        <div ref={overTextRef} id="over-text" className="hide">
          <h1>Game Over</h1>
          <p ref={resultRef} id="result"></p>
        </div>
        <button ref={startButtonRef} id="start-button">Start Game</button>
      </div>
      <canvas ref={canvasRef} id="canvas" />
      <div ref={scoreContainerRef} id="score-container">{points}</div>
    </div>
  );
};

export default FruitGame;

