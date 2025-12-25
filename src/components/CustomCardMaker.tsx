"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Button from "./Button";

export default function CustomCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastImageUrlRef = useRef<string | null>(null);
  const [title, setTitle] = useState("My Card");
  const [message, setMessage] = useState("Hello world!");
  const [bgColor, setBgColor] = useState("#0ea5e9");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [messageColor, setMessageColor] = useState("#ffffff");
  const [titleFontFamily, setTitleFontFamily] = useState("system-ui");
  const [messageFontFamily, setMessageFontFamily] = useState("system-ui");
  const [borderStyle, setBorderStyle] = useState<"none" | "solid" | "dashed" | "double">("none");
  const [borderWidth, setBorderWidth] = useState(8);
  const [borderColor, setBorderColor] = useState("#0f172a");
  const [borderRadius, setBorderRadius] = useState(24);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [width, setWidth] = useState<number>(640);
  const [height, setHeight] = useState<number>(360);
  const [titleSize, setTitleSize] = useState<number>(28);
  const [messageSize, setMessageSize] = useState<number>(16);
  const [imageScale, setImageScale] = useState<number>(1.0);
  const [imageXOffset, setImageXOffset] = useState<number>(0);
  const [imageYOffset, setImageYOffset] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 640, height: 360 });

  // Element interaction states
  const [selectedElement, setSelectedElement] = useState<'canvas' | 'image' | 'title' | 'message' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isElementResizing, setIsElementResizing] = useState(false);
  const [elementResizeHandle, setElementResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewScale, setPreviewScale] = useState(1);

  // Element positions and sizes
  const [titlePosition, setTitlePosition] = useState({ x: 0, y: 0 });
  const [titleDimensions, setTitleDimensions] = useState({ width: 0, height: 0 });
  const [messagePosition, setMessagePosition] = useState({ x: 0, y: 0 });
  const [messageDimensions, setMessageDimensions] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Additional features
  const [titleRotation, setTitleRotation] = useState(0);
  const [messageRotation, setMessageRotation] = useState(0);
  const [imageRotation, setImageRotation] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<any>(null);

  // Keep orientation label in sync with current dimensions
  useEffect(() => {
    setOrientation(width >= height ? "landscape" : "portrait");
  }, [width, height]);

  // Auto-render canvas when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [
    title,
    message,
    bgColor,
    titleColor,
    messageColor,
    titleFontFamily,
    messageFontFamily,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    imageUrl,
    imageLoaded,
    width,
    height,
    titleSize,
    messageSize,
    imageScale,
    imageXOffset,
    imageYOffset,
    titleRotation,
    messageRotation,
    imageRotation,
    titlePosition,
    messagePosition
  ]);

  // Calculate text dimensions when text properties change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.font = `bold ${titleSize}px ${titleFontFamily}, sans-serif`;
    const titleMetrics = ctx.measureText(title);
    const titleWidth = titleMetrics.width;
    const titleHeight = titleSize;

    ctx.font = `${messageSize}px ${messageFontFamily}, sans-serif`;
    const messageLines = wrapText(ctx, message, 0, 0, canvas.width * 0.8, Math.max(18, Math.round(messageSize * 1.2)), true);
    const messageHeight = messageLines * Math.max(18, Math.round(messageSize * 1.2));
    const messageWidth = canvas.width * 0.8 + 20;

    setTitleDimensions({ width: titleWidth + 20, height: titleHeight + 10 });
    setMessageDimensions({ width: messageWidth, height: messageHeight + 20 });
  }, [title, titleSize, titleFontFamily, message, messageSize, messageFontFamily, width]);

  // Cleanup old object URLs
  useEffect(() => {
    return () => {
      if (lastImageUrlRef.current) {
        URL.revokeObjectURL(lastImageUrlRef.current);
      }
    };
  }, []);

  const titleBox = useMemo(() => {
    // Match the exact canvas strokeRect used for title:
    // strokeRect(titleX - 10, titleY - titleHeight, titleWidth + 20, titleHeight + 10)
    const titleTextWidth = Math.max(0, titleDimensions.width - 20);
    const titleTextHeight = titleSize;
    const baseY = height - Math.max(90, Math.round(height * 0.2)) + titlePosition.y;
    const x = (width - titleTextWidth) / 2 + titlePosition.x - 10;
    const y = baseY - titleTextHeight;
    const w = titleTextWidth + 20;
    const h = titleTextHeight + 10;
    return { x, y, w, h };
  }, [width, height, titleDimensions.width, titlePosition.x, titlePosition.y, titleSize]);

  const messageBox = useMemo(() => {
    // Match the exact canvas strokeRect used for message:
    // strokeRect((w - w*0.8)/2 - 10 + messagePosition.x, messageY - messageHeight - 10, w*0.8 + 20, messageHeight + 20)
    const messageTextHeight = Math.max(0, messageDimensions.height - 20);
    const baseY = height - Math.max(60, Math.round(height * 0.15)) + messagePosition.y;
    const x = (width - width * 0.8) / 2 - 10 + messagePosition.x;
    const y = baseY - messageTextHeight - 10;
    const w = width * 0.8 + 20;
    const h = messageTextHeight + 20;
    return { x, y, w, h };
  }, [width, height, messageDimensions.height, messagePosition.x, messagePosition.y]);

  const imageBounds = useMemo(() => {
    if (!imageLoaded || !imageRef.current) return null;
    const img = imageRef.current;
    const w = Math.max(200, Math.min(2000, width));
    const h = Math.max(150, Math.min(2000, height));
    const fitRatio = Math.min(w * 0.8 / img.width, h * 0.5 / img.height);
    const ratio = fitRatio * Math.max(0.1, imageScale);
    const iw = img.width * ratio;
    const ih = img.height * ratio;
    const ix = (w - iw) / 2 + imageXOffset;
    const iy = 40 + imageYOffset;
    return { x: ix, y: iy, w: iw, h: ih };
  }, [imageLoaded, width, height, imageScale, imageXOffset, imageYOffset]);

  const canvasCoordsFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // History management
  const saveToHistory = () => {
    const state = {
      title, message, bgColor, imageUrl, width, height, titleSize, messageSize,
      imageScale, imageXOffset, imageYOffset, titlePosition, messagePosition,
      titleRotation, messageRotation, imageRotation,
      titleColor, messageColor, titleFontFamily, messageFontFamily,
      borderStyle, borderWidth, borderColor, borderRadius,
      orientation
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTitle(prevState.title);
      setMessage(prevState.message);
      setBgColor(prevState.bgColor);
      setImageUrl(prevState.imageUrl);
      setWidth(prevState.width);
      setHeight(prevState.height);
      setTitleSize(prevState.titleSize);
      setMessageSize(prevState.messageSize);
      setImageScale(prevState.imageScale);
      setImageXOffset(prevState.imageXOffset);
      setImageYOffset(prevState.imageYOffset);
      setTitlePosition(prevState.titlePosition);
      setMessagePosition(prevState.messagePosition);
      setTitleRotation(prevState.titleRotation);
      setMessageRotation(prevState.messageRotation);
      setImageRotation(prevState.imageRotation);
      if (prevState.titleColor) setTitleColor(prevState.titleColor);
      if (prevState.messageColor) setMessageColor(prevState.messageColor);
      if (prevState.titleFontFamily) setTitleFontFamily(prevState.titleFontFamily);
      if (prevState.messageFontFamily) setMessageFontFamily(prevState.messageFontFamily);
      if (prevState.borderStyle) setBorderStyle(prevState.borderStyle);
      if (typeof prevState.borderWidth === "number") setBorderWidth(prevState.borderWidth);
      if (prevState.borderColor) setBorderColor(prevState.borderColor);
      if (typeof prevState.borderRadius === "number") setBorderRadius(prevState.borderRadius);
      if (prevState.orientation) setOrientation(prevState.orientation);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTitle(nextState.title);
      setMessage(nextState.message);
      setBgColor(nextState.bgColor);
      setImageUrl(nextState.imageUrl);
      setWidth(nextState.width);
      setHeight(nextState.height);
      setTitleSize(nextState.titleSize);
      setMessageSize(nextState.messageSize);
      setImageScale(nextState.imageScale);
      setImageXOffset(nextState.imageXOffset);
      setImageYOffset(nextState.imageYOffset);
      setTitlePosition(nextState.titlePosition);
      setMessagePosition(nextState.messagePosition);
      setTitleRotation(nextState.titleRotation);
      setMessageRotation(nextState.messageRotation);
      setImageRotation(nextState.imageRotation);
      if (nextState.titleColor) setTitleColor(nextState.titleColor);
      if (nextState.messageColor) setMessageColor(nextState.messageColor);
      if (nextState.titleFontFamily) setTitleFontFamily(nextState.titleFontFamily);
      if (nextState.messageFontFamily) setMessageFontFamily(nextState.messageFontFamily);
      if (nextState.borderStyle) setBorderStyle(nextState.borderStyle);
      if (typeof nextState.borderWidth === "number") setBorderWidth(nextState.borderWidth);
      if (nextState.borderColor) setBorderColor(nextState.borderColor);
      if (typeof nextState.borderRadius === "number") setBorderRadius(nextState.borderRadius);
      if (nextState.orientation) setOrientation(nextState.orientation);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const copyElement = (elementType: 'title' | 'message' | 'image') => {
    let elementData;
    switch (elementType) {
      case 'title':
        elementData = { type: 'title', text: title, size: titleSize, position: titlePosition, rotation: titleRotation, color: titleColor, fontFamily: titleFontFamily };
        break;
      case 'message':
        elementData = { type: 'message', text: message, size: messageSize, position: messagePosition, rotation: messageRotation, color: messageColor, fontFamily: messageFontFamily };
        break;
      case 'image':
        elementData = { type: 'image', url: imageUrl, scale: imageScale, rotation: imageRotation, offset: { x: imageXOffset, y: imageYOffset } };
        break;
    }
    setClipboard(elementData);
  };

  const pasteElement = () => {
    if (!clipboard) return;

    switch (clipboard.type) {
      case 'title':
        setTitle(clipboard.text);
        setTitleSize(clipboard.size);
        setTitlePosition({ x: clipboard.position.x + 20, y: clipboard.position.y + 20 });
        setTitleRotation(clipboard.rotation);
        if (clipboard.color) setTitleColor(clipboard.color);
        if (clipboard.fontFamily) setTitleFontFamily(clipboard.fontFamily);
        break;
      case 'message':
        setMessage(clipboard.text);
        setMessageSize(clipboard.size);
        setMessagePosition({ x: clipboard.position.x + 20, y: clipboard.position.y + 20 });
        setMessageRotation(clipboard.rotation);
        if (clipboard.color) setMessageColor(clipboard.color);
        if (clipboard.fontFamily) setMessageFontFamily(clipboard.fontFamily);
        break;
      case 'image':
        if (clipboard.url) {
          setImageUrl(clipboard.url);
          setImageScale(clipboard.scale);
          setImageRotation(clipboard.rotation);
          setImageXOffset(clipboard.offset.x);
          setImageYOffset(clipboard.offset.y);
        }
        break;
    }
    saveToHistory();
  };

  // Save initial state to history
  useEffect(() => {
    saveToHistory();
  }, []);

  // Mouse event handlers for resizing
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width, height });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    let newWidth = startSize.width;
    let newHeight = startSize.height;

    switch (resizeHandle) {
      case 'se': // southeast
        newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
        newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
        break;
      case 'sw': // southwest
        newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
        newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
        break;
      case 'ne': // northeast
        newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
        newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
        break;
      case 'nw': // northwest
        newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
        newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
        break;
      case 'e': // east
        newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
        break;
      case 'w': // west
        newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
        break;
      case 's': // south
        newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
        break;
      case 'n': // north
        newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
        break;
    }

    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Element click detection
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isResizing || isDragging) return;

    const coords = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;

    // Check if clicking on image
    if (imageBounds) {
      if (coords.x >= imageBounds.x && coords.x <= imageBounds.x + imageBounds.w &&
          coords.y >= imageBounds.y && coords.y <= imageBounds.y + imageBounds.h) {
        setSelectedElement('image');
        return;
      }
    }

    // Check if clicking on title
    ctx.font = `bold ${titleSize}px system-ui, sans-serif`;
    const titleMetrics = ctx.measureText(title);
    const titleWidth = titleMetrics.width;
    const titleX = (w - titleWidth) / 2 + titlePosition.x;
    const titleY = h - Math.max(90, Math.round(height * 0.2)) + titlePosition.y;

    if (coords.x >= titleX - 10 && coords.x <= titleX + titleWidth + 10 &&
        coords.y >= titleY - titleSize && coords.y <= titleY + 10) {
      setSelectedElement('title');
      return;
    }

    // Check if clicking on message
    ctx.font = `${messageSize}px system-ui, sans-serif`;
    const messageY = h - Math.max(60, Math.round(height * 0.15)) + messagePosition.y;
    const messageHeight = Math.max(18, Math.round(messageSize * 1.2)) * wrapText(ctx, message, w / 2, messageY, w * 0.8, Math.max(18, Math.round(messageSize * 1.2)), true);

    if (coords.x >= (w - w * 0.8) / 2 - 10 && coords.x <= (w + w * 0.8) / 2 + 10 &&
        coords.y >= messageY - messageHeight - 10 && coords.y <= messageY + 20) {
      setSelectedElement('message');
      return;
    }

    // Click on canvas background
    setSelectedElement('canvas');
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: 'image' | 'title' | 'message', action: 'drag' | 'resize' = 'drag', handle?: string) => {
    setSelectedElement(element);
    e.preventDefault();
    e.stopPropagation();

    // Drag should work immediately (no waiting for effect-based listeners)
    if (action === 'drag') {
      let last = canvasCoordsFromClient(e.clientX, e.clientY);

      const onMove = (ev: MouseEvent) => {
        const cur = canvasCoordsFromClient(ev.clientX, ev.clientY);
        const dx = cur.x - last.x;
        const dy = cur.y - last.y;
        last = cur;

        if (element === "image") {
          setImageXOffset((p) => p + dx);
          setImageYOffset((p) => p + dy);
        } else if (element === "title") {
          setTitlePosition((p) => ({ x: p.x + dx, y: p.y + dy }));
        } else if (element === "message") {
          setMessagePosition((p) => ({ x: p.x + dx, y: p.y + dy }));
        }
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      return;
    }

    // Resize (only image uses this now)
    setIsElementResizing(true);
    setElementResizeHandle(handle || null);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        let newWidth = startSize.width;
        let newHeight = startSize.height;

        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
            newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
            break;
          case 'sw':
            newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
            newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
            break;
          case 'ne':
            newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
            newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
            break;
          case 'nw':
            newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
            newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
            break;
          case 'e':
            newWidth = Math.max(200, Math.min(2000, startSize.width + deltaX));
            break;
          case 'w':
            newWidth = Math.max(200, Math.min(2000, startSize.width - deltaX));
            break;
          case 's':
            newHeight = Math.max(150, Math.min(2000, startSize.height + deltaY));
            break;
          case 'n':
            newHeight = Math.max(150, Math.min(2000, startSize.height - deltaY));
            break;
        }

        setWidth(newWidth);
        setHeight(newHeight);
      } else if (isElementResizing && selectedElement) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;

        if (selectedElement === 'image' && elementResizeHandle) {
          // True Windows-style corner resizing - each corner proportionally scales from that corner
          // The corner being dragged maintains its position while the opposite corner moves
          const scaleChange = deltaY * 0.004; // Use vertical movement direction for scaling
          const newScale = Math.max(0.1, Math.min(3, imageScale + scaleChange));
          setImageScale(newScale);
        }
      } else if (isDragging && selectedElement) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currentCoords = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
        };

        const deltaX = currentCoords.x - dragOffset.x;
        const deltaY = currentCoords.y - dragOffset.y;

        if (selectedElement === 'image') {
          setImageXOffset(prev => prev + deltaX);
          setImageYOffset(prev => prev + deltaY);
        } else if (selectedElement === 'title') {
          setTitlePosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        } else if (selectedElement === 'message') {
          setMessagePosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        }

        setDragOffset(currentCoords);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      setIsDragging(false);
      setIsElementResizing(false);
      setElementResizeHandle(null);
    };

    if (isResizing || isDragging || isElementResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, resizeHandle, startPos, startSize, isDragging, isElementResizing, elementResizeHandle, selectedElement, dragOffset, imageScale, titleSize, messageSize]);

  function renderCanvas() {
    const cnv = canvasRef.current!;
    cnv.width = Math.max(200, Math.min(2000, width));
    cnv.height = Math.max(150, Math.min(2000, height));
    const ctx = cnv.getContext("2d")!;
    const w = cnv.width, h = cnv.height;

    ctx.clearRect(0, 0, w, h);

    // Helper for rounded rect path (used for clipping + border)
    const drawRoundedRect = (x: number, y: number, rw: number, rh: number, r: number) => {
      const rr = Math.max(0, Math.min(r, Math.min(rw, rh) / 2));
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(x, y, rw, rh, rr);
      } else {
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + rw, y, x + rw, y + rh, rr);
        ctx.arcTo(x + rw, y + rh, x, y + rh, rr);
        ctx.arcTo(x, y + rh, x, y, rr);
        ctx.arcTo(x, y, x + rw, y, rr);
      }
      ctx.closePath();
    };

    // Clip card content to rounded corners to avoid corner artifacts
    const clipRadius = Math.max(0, Math.min(200, borderRadius));
    if (clipRadius > 0) {
      ctx.save();
      drawRoundedRect(0, 0, w, h, clipRadius);
      ctx.clip();
    }

    // background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // optional image (draw from cached imageRef to avoid “blank frame” during edits)
    if (imageUrl && imageLoaded && imageRef.current) {
      const img = imageRef.current;
        const fitRatio = Math.min(w * 0.8 / img.width, h * 0.5 / img.height);
        const ratio = fitRatio * Math.max(0.1, imageScale);
        const iw = img.width * ratio;
        const ih = img.height * ratio;
        const ix = (w - iw) / 2 + imageXOffset;
        const iy = 40 + imageYOffset;

      // Keep state in sync for UI handles (no loops: only updates when values actually change)
      if (Math.abs(imageSize.width - iw) > 0.5 || Math.abs(imageSize.height - ih) > 0.5) {
        setImageSize({ width: iw, height: ih });
      }

      ctx.save();
      const centerX = ix + iw / 2;
      const centerY = iy + ih / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();

      // Draw selection outline for image (unrotated bounds)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(ix, iy, iw, ih);
      ctx.setLineDash([]);
    }

    drawText();

    if (clipRadius > 0) {
      ctx.restore();
    }

    // Card border (final pass)
    if (borderStyle !== "none" && borderWidth > 0) {
      const bw = Math.max(1, Math.min(80, borderWidth));
      const br = Math.max(0, Math.min(200, borderRadius));

      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = bw;
      ctx.lineJoin = "round";
      ctx.setLineDash(borderStyle === "dashed" ? [Math.max(6, bw * 1.2), Math.max(6, bw * 0.9)] : []);

      const inset = bw / 2;
      drawRoundedRect(inset, inset, w - bw, h - bw, br);
      ctx.stroke();

      if (borderStyle === "double") {
        const innerBw = Math.max(1, Math.round(bw * 0.55));
        const gap = Math.max(2, Math.round(bw * 0.6));
        const inset2 = inset + gap + innerBw / 2;
        ctx.lineWidth = innerBw;
        ctx.setLineDash([]);
        drawRoundedRect(inset2, inset2, w - inset2 * 2, h - inset2 * 2, Math.max(0, br - gap));
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawText() {
      // Title rendering
      ctx.fillStyle = titleColor;
      ctx.font = `bold ${titleSize}px ${titleFontFamily}, sans-serif`;
      ctx.textAlign = "center";

      const titleMetrics = ctx.measureText(title);
      const titleWidth = titleMetrics.width;
      const titleHeight = titleSize;
      const titleX = (w - titleWidth) / 2 + titlePosition.x;
      const titleY = h - Math.max(90, Math.round(height * 0.2)) + titlePosition.y;

      // Render title with rotation
      ctx.save();
      const titleCenterX = titleX + titleWidth / 2;
      const titleCenterY = titleY - titleHeight / 2;
      ctx.translate(titleCenterX, titleCenterY);
      ctx.rotate((titleRotation * Math.PI) / 180);
      ctx.fillText(title, -titleWidth / 2, titleHeight / 2);
      ctx.restore();

      // Draw selection outline for title
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(titleX - 10, titleY - titleHeight, titleWidth + 20, titleHeight + 10);
      ctx.setLineDash([]);

      // Title position calculated dynamically for resize handles

      // Message rendering
      ctx.fillStyle = messageColor;
      ctx.font = `${messageSize}px ${messageFontFamily}, sans-serif`;

      const messageX = w / 2 + messagePosition.x;
      const messageY = h - Math.max(60, Math.round(height * 0.15)) + messagePosition.y;
      const messageLines = wrapText(ctx, message, messageX, messageY, w * 0.8, Math.max(18, Math.round(messageSize * 1.2)), true);
      const messageHeight = messageLines * Math.max(18, Math.round(messageSize * 1.2));
      const messageWidth = w * 0.8 + 20;

      // Render message with rotation
      ctx.save();
      const messageCenterX = messageX;
      const messageCenterY = messageY - messageHeight / 2;
      ctx.translate(messageCenterX, messageCenterY);
      ctx.rotate((messageRotation * Math.PI) / 180);
      wrapText(ctx, message, -w * 0.4, -messageHeight / 2, w * 0.8, Math.max(18, Math.round(messageSize * 1.2)));
      ctx.restore();

      // Draw selection outline for message
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect((w - w * 0.8) / 2 - 10 + messagePosition.x, messageY - messageHeight - 10, messageWidth, messageHeight + 20);
      ctx.setLineDash([]);

      // Message position calculated dynamically for resize handles
    }
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, measureOnly: boolean = false) {
    const words = text.split(" ");
    let line = "";
    let lines = 1;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        if (!measureOnly) ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
        lines++;
      } else {
        line = testLine;
      }
    }
    if (!measureOnly) ctx.fillText(line, x, y);
    return lines;
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    // revoke previous
    if (lastImageUrlRef.current) URL.revokeObjectURL(lastImageUrlRef.current);
    lastImageUrlRef.current = url;
    setImageLoaded(false);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = url;
  }

  function download() {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const a = document.createElement("a");
    a.href = cnv.toDataURL("image/png");
    a.download = "custom-card.png";
    a.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Custom Card Maker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create beautiful custom cards with text, images, and customizable styling. Perfect for invitations, announcements, or personal projects.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m-.75-.082a24.301 24.301 0 006.75 0m-6.75.082l-1.5.106M9.75 3.104l1.5.106M5 14.5l.659-.591A2.25 2.25 0 017.25 12.5v-5.714" />
                  </svg>
                  Basic Settings
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Title
        </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter card title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title Color
        </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => { setTitleColor(e.target.value); saveToHistory(); }}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{titleColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
        </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your message"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Color
        </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={messageColor}
                        onChange={(e) => { setMessageColor(e.target.value); saveToHistory(); }}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{messageColor}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
        </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); saveToHistory(); }}
                      className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Image Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Image Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <Button variant="primary" as="label" className="cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Choose Background Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </Button>
                    {imageUrl && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Image uploaded successfully
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Scale: {imageScale.toFixed(2)}×
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={3}
                      step={0.05}
                      value={imageScale}
                      onChange={(e) => { setImageScale(parseFloat(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Horizontal Offset
                      </label>
                      <input
                        type="range"
                        min={-200}
                        max={200}
                        step={1}
                        value={imageXOffset}
                        onChange={(e) => { setImageXOffset(parseInt(e.target.value)); saveToHistory(); }}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{imageXOffset}px</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vertical Offset
                      </label>
                      <input
                        type="range"
                        min={-200}
                        max={200}
                        step={1}
                        value={imageYOffset}
                        onChange={(e) => { setImageYOffset(parseInt(e.target.value)); saveToHistory(); }}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{imageYOffset}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Rotation: {imageRotation}°
                    </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={imageRotation}
                      onChange={(e) => { setImageRotation(parseInt(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-h-[280px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h-.75v-.75H6v.75H4.5v-.75H3.75V12h.75v3h.75V12h1.5v3h.75V8.25zm3 0h3v6.75h-.75V12h-1.5v2.25h-.75V8.25zM13.5 8.25h.75v3h.75V8.25h.75V12h-.75v3h-.75V12h-.75V8.25zm3 0h.75v3h.75V8.25H21V12h-.75v3h-.75V12H18V8.25z" />
                  </svg>
                  Typography
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title Font
                    </label>
                    <select
                      value={titleFontFamily}
                      onChange={(e) => { setTitleFontFamily(e.target.value); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="system-ui">System UI</option>
                      <option value="Arial">Arial</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Font
                    </label>
                    <select
                      value={messageFontFamily}
                      onChange={(e) => { setMessageFontFamily(e.target.value); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="system-ui">System UI</option>
                      <option value="Arial">Arial</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title Size (px)
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={120}
                      value={titleSize}
                      onChange={(e) => { setTitleSize(parseInt(e.target.value || "0")); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Size (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={messageSize}
                      onChange={(e) => { setMessageSize(parseInt(e.target.value || "0")); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title Rotation: {titleRotation}°
                    </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={titleRotation}
                      onChange={(e) => { setTitleRotation(parseInt(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Rotation: {messageRotation}°
        </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={messageRotation}
                      onChange={(e) => { setMessageRotation(parseInt(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text Controls</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Use the resize handles in the preview to adjust text size interactively.
                    Drag the colored borders to move text elements around the canvas.
                  </p>
                </div>
              </div>

            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Card Preview
                  </h2>

                  {/* Preview Scale Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Zoom:</span>
                    <button
                      onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.25))}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-center">
                      {Math.round(previewScale * 100)}%
                    </span>
                    <button
                      onClick={() => setPreviewScale(Math.min(2, previewScale + 0.25))}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    ref={previewContainerRef}
                    className="relative border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 overflow-hidden"
                    style={{ width: `${Math.min(600, width * previewScale + 32)}px`, height: `${Math.min(450, height * previewScale + 32)}px` }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute rounded shadow-sm"
                      style={{
                        width: `${width * previewScale}px`,
                        height: `${height * previewScale}px`,
                        left: '16px',
                        top: '16px'
                      }}
                      onClick={handleCanvasClick}
                    />

                    {/* Canvas Resize handles - Windows-style corner only */}
                    <>
                      <div
                        className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors shadow-lg opacity-70 hover:opacity-100 border-2 border-white"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                        style={{ zIndex: 20 }}
                      />
                      <div
                        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors shadow-lg opacity-70 hover:opacity-100 border-2 border-white"
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                        style={{ zIndex: 20 }}
                      />
                      <div
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors shadow-lg opacity-70 hover:opacity-100 border-2 border-white"
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                        style={{ zIndex: 20 }}
                      />
                      <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors shadow-lg opacity-70 hover:opacity-100 border-2 border-white"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                        style={{ zIndex: 20 }}
                      />
                    </>

                    {/* Image Resize handles - show when image exists */}
                    {imageBounds && (
                      <>
                        {/* Image corner resize handles - Windows-style */}
                        <div
                          className="absolute w-3 h-3 bg-green-500 rounded-full cursor-nw-resize hover:bg-green-600 transition-colors shadow-md opacity-70 hover:opacity-100 border border-white"
                          onMouseDown={(e) => handleElementMouseDown(e, 'image', 'resize', 'nw')}
                          style={{
                            left: `${16 + imageBounds.x * previewScale - 6}px`,
                            top: `${16 + imageBounds.y * previewScale - 6}px`,
                            zIndex: 25
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-green-500 rounded-full cursor-ne-resize hover:bg-green-600 transition-colors shadow-md opacity-70 hover:opacity-100 border border-white"
                          onMouseDown={(e) => handleElementMouseDown(e, 'image', 'resize', 'ne')}
                          style={{
                            left: `${16 + (imageBounds.x + imageBounds.w) * previewScale - 6}px`,
                            top: `${16 + imageBounds.y * previewScale - 6}px`,
                            zIndex: 25
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-green-500 rounded-full cursor-sw-resize hover:bg-green-600 transition-colors shadow-md opacity-70 hover:opacity-100 border border-white"
                          onMouseDown={(e) => handleElementMouseDown(e, 'image', 'resize', 'sw')}
                          style={{
                            left: `${16 + imageBounds.x * previewScale - 6}px`,
                            top: `${16 + (imageBounds.y + imageBounds.h) * previewScale - 6}px`,
                            zIndex: 25
                          }}
                        />
                        <div
                          className="absolute w-3 h-3 bg-green-500 rounded-full cursor-se-resize hover:bg-green-600 transition-colors shadow-md opacity-70 hover:opacity-100 border border-white"
                          onMouseDown={(e) => handleElementMouseDown(e, 'image', 'resize', 'se')}
                          style={{
                            left: `${16 + (imageBounds.x + imageBounds.w) * previewScale - 6}px`,
                            top: `${16 + (imageBounds.y + imageBounds.h) * previewScale - 6}px`,
                            zIndex: 25
                          }}
                        />

                        {/* Image drag area */}
                        <div
                          className="absolute cursor-move"
                          onMouseDown={(e) => handleElementMouseDown(e, 'image', 'drag')}
                          style={{
                            left: `${16 + imageBounds.x * previewScale}px`,
                            top: `${16 + imageBounds.y * previewScale}px`,
                            width: `${imageBounds.w * previewScale}px`,
                            height: `${imageBounds.h * previewScale}px`,
                            zIndex: 10
                          }}
                        />
                      </>
                    )}

                    {/* Title drag area (no mouse resizing) */}
                    {titleDimensions.width > 0 && titleDimensions.height > 0 && (
                      <div
                        className="absolute cursor-move"
                        onMouseDown={(e) => handleElementMouseDown(e, 'title', 'drag')}
                        style={{
                          left: `${16 + titleBox.x * previewScale}px`,
                          top: `${16 + titleBox.y * previewScale}px`,
                          width: `${titleBox.w * previewScale}px`,
                          height: `${titleBox.h * previewScale}px`,
                          zIndex: 40,
                          pointerEvents: "auto",
                          background: "transparent"
                        }}
                      />
                    )}

                    {/* Message drag area (no mouse resizing) */}
                    {messageDimensions.width > 0 && messageDimensions.height > 0 && (
                      <div
                        className="absolute cursor-move"
                        onMouseDown={(e) => handleElementMouseDown(e, 'message', 'drag')}
                        style={{
                          left: `${16 + messageBox.x * previewScale}px`,
                          top: `${16 + messageBox.y * previewScale}px`,
                          width: `${messageBox.w * previewScale}px`,
                          height: `${messageBox.h * previewScale}px`,
                          zIndex: 40,
                          pointerEvents: "auto",
                          background: "transparent"
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4 text-center space-y-2">
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Canvas</span>
                    </div>
                    {imageUrl && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">Image</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Title</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Message</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Blue handles: Resize canvas • Green handles: Resize image • Purple handles: Resize title • Orange handles: Resize message
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click and drag anywhere on elements to move them • Use zoom controls to adjust preview size
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Canvas: {width} × {height} pixels • Zoom: {Math.round(previewScale * 100)}%
                  </p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Dimensions
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Orientation
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrientation("landscape");
                        if (height > width) {
                          setWidth(height);
                          setHeight(width);
                        }
                        saveToHistory();
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        orientation === "landscape"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrientation("portrait");
                        if (width > height) {
                          setHeight(width);
                          setWidth(height);
                        }
                        saveToHistory();
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        orientation === "portrait"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      Portrait
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Width (px)
        </label>
                    <input
                      type="number"
                      min={200}
                      max={2000}
                      value={width}
                      onChange={(e) => { setWidth(parseInt(e.target.value || "0")); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (px)
        </label>
                    <input
                      type="number"
                      min={150}
                      max={2000}
                      value={height}
                      onChange={(e) => { setHeight(parseInt(e.target.value || "0")); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Border */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v10.5H3.75V6.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9.75h10.5v4.5H6.75v-4.5z" />
                  </svg>
                  Border
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Border Style
                    </label>
                    <select
                      value={borderStyle}
                      onChange={(e) => { setBorderStyle(e.target.value as any); saveToHistory(); }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="double">Double</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Border Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => { setBorderColor(e.target.value); saveToHistory(); }}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        disabled={borderStyle === "none"}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{borderColor}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Border Width: {borderWidth}px
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      step={1}
                      value={borderWidth}
                      onChange={(e) => { setBorderWidth(parseInt(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      disabled={borderStyle === "none"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Corner Radius: {borderRadius}px
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={1}
                      value={borderRadius}
                      onChange={(e) => { setBorderRadius(parseInt(e.target.value)); saveToHistory(); }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      disabled={borderStyle === "none"}
                    />
                  </div>
                </div>
              </div>

              {/* Download */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {/* Edit Controls */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Undo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Redo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0 0l6 6m-6-6h12a6 6 0 010-12h-3" />
                    </svg>
                  </button>
                  <div className="h-px bg-gray-300 dark:bg-gray-600 mx-2 my-auto"></div>
                  <button
                    onClick={() => copyElement('image')}
                    disabled={!imageUrl}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Copy Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a2.25 2.25 0 012.25 2.25v.75m6.75 0v3m0-3l-3-3m3 3l3-3m-3 3v9.75a2.25 2.25 0 01-2.25 2.25H7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyElement('title')}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="Copy Title"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h-.75v-.75H6v.75H4.5v-.75H3.75V12h.75v3h.75V12h1.5v3h.75V8.25zm3 0h3v6.75h-.75V12h-1.5v2.25h-.75V8.25zM13.5 8.25h.75v3h.75V8.25h.75V12h-.75v3h-.75V12h-.75V8.25zm3 0h.75v3h.75V8.25H21V12h-.75v3h-.75V12H18V8.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyElement('message')}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="Copy Message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h-.75v-.75H6v.75H4.5v-.75H3.75V12h.75v3h.75V12h1.5v3h.75V8.25zm3 0h3v6.75h-.75V12h-1.5v2.25h-.75V8.25zM13.5 8.25h.75v3h.75V8.25h.75V12h-.75v3h-.75V12h-.75V8.25zm3 0h.75v3h.75V8.25H21V12h-.75v3h-.75V12H18V8.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={pasteElement}
                    disabled={!clipboard}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Paste Element"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a2.25 2.25 0 012.25 2.25v.75m6.75 0v3m0-3l-3-3m3 3l3-3m-3 3v9.75a2.25 2.25 0 01-2.25 2.25H7.5" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={download}
                    className="flex-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    Download Card
                  </Button>
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}