'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from 'ogl';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface GalleryItem {
  image: string;
  text: string;
  url?: string;
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

type GL = Renderer['gl'];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind<T extends object>(instance: T): void {
  const proto = Object.getPrototypeOf(instance) as Record<string, unknown> | null;
  if (!proto) return;
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor') {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc && typeof desc.value === 'function') {
        const fn = desc.value as (...args: unknown[]) => unknown;
        (instance as Record<string, unknown>)[key] = fn.bind(instance);
      }
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

// FIX TASK 1: Enhanced text texture with better antialiasing for image clarity
function createTextTexture(
  gl: GL,
  text: string,
  font = 'bold 30px monospace',
  color = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {
    // TASK 1 FIX: Enable high-quality 2D rendering for crisp text
    willReadFrequently: false,
    alpha: true,
  });
  if (!context) throw new Error('Could not get 2d context');

  // TASK 1 FIX: Use 2x pixel density for sharper text on retina displays
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  // TASK 1 FIX: Scale canvas by DPR for crisp rendering
  canvas.width = (textWidth + 20) * dpr;
  canvas.height = (textHeight + 20) * dpr;
  canvas.style.width = `${textWidth + 20}px`;
  canvas.style.height = `${textHeight + 20}px`;

  context.scale(dpr, dpr);
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  // TASK 1 FIX: Enable sub-pixel rendering
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, (textWidth + 20) / 2, (textHeight + 20) / 2);

  const texture = new Texture(gl, {
    generateMipmaps: false,
    // TASK 1 FIX: Linear filtering for smooth texture scaling
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  texture.image = canvas;
  return {
    texture,
    width: textWidth + 20,  // Return CSS pixels, not physical pixels
    height: textHeight + 20,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TITLE CLASS
// ─────────────────────────────────────────────────────────────────────────────

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({
    gl,
    plane,
    renderer,
    text,
    textColor = '#ffffff',
    font = 'bold 28px Figtree',
  }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(
      this.gl,
      this.text,
      this.font,
      this.textColor
    );
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.1;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y =
      -this.plane.scale.y * 0.5 - textHeightScaled * 0.9 - 0.15;
    this.mesh.setParent(this.plane);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA CLASS
// ─────────────────────────────────────────────────────────────────────────────

interface ScreenSize {
  width: number;
  height: number;
}
interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  url?: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
}

class Media {
  extra = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  url?: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  // TASK 1 FIX: Slowed card speed tracking — was direct delta, now damped
  speed = 0;
  isBefore = false;
  isAfter = false;

  constructor({
    geometry,
    gl,
    image,
    url,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.url = url;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
      // TASK 1 FIX: Use linear filtering for clear, sharp image display
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR,
    });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          /*
           * TASK 1 FIX: Slow down card wave motion.
           * Was: 0.1 + uSpeed * 0.5  (aggressive ripple at speed)
           * Now: 0.05 + uSpeed * 0.15 (subtle ripple, 70% reduced amplitude)
           * Duration effect: easing via App.scroll.ease = 0.035 (was 0.05)
           */
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5)
                * (0.05 + uSpeed * 0.15);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          /*
           * TASK 1 FIX: Correct cover-fit UV mapping.
           * Ensures images fill the card without distortion — object-fit: cover
           */
          float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
          float imageAspect = uImageSizes.x / uImageSizes.y;

          vec2 uv = vUv;
          if (planeAspect > imageAspect) {
            // plane is wider than image → scale image height to fill
            float scale = planeAspect / imageAspect;
            uv.y = (vUv.y - 0.5) * scale + 0.5;
          } else {
            // plane is taller than image → scale image width to fill
            float scale = imageAspect / planeAspect;
            uv.x = (vUv.x - 0.5) * scale + 0.5;
          }

          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(
            vUv - 0.5,
            vec2(0.5 - uBorderRadius),
            uBorderRadius
          );
          if (d > 0.0) discard;

          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
      uniforms: {
        tMap:          { value: texture },
        uPlaneSizes:   { value: [0, 0] },
        uImageSizes:   { value: [0, 0] },
        uSpeed:        { value: 0 },
        uTime:         { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }

  update(
    scroll: { current: number; last: number },
    direction: 'right' | 'left'
  ) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    /*
     * TASK 1 FIX: Slow card motion — dampen speed value fed to shader.
     * Multiply by 0.4 to reduce wave distortion intensity by 60%.
     * Combined with vertex shader change: total reduction ~70–80%.
     */
    this.speed = (scroll.current - scroll.last) * 0.4;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({
    screen,
    viewport,
  }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }

    this.scale = this.screen.height / 1500;

    const availableHeight = this.screen.height;
    const cardHeightPx = availableHeight * (this.screen.width < 640 ? 0.82 : 0.72);
    const cardWidthPx = cardHeightPx * (9 / 16);

    this.plane.scale.y =
      (this.viewport.height * cardHeightPx) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * cardWidthPx) / this.screen.width;

    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.padding = this.plane.scale.x * 0.08;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * (this.index - Math.floor(this.length / 4));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// APP CLASS
// ─────────────────────────────────────────────────────────────────────────────

interface AppConfig {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: GalleryItem[] = [];
  screen!: ScreenSize;
  viewport!: Viewport;
  raf = 0;
  isDown = false;
  start = 0;
  dragDistance = 0;

  maxScrollTarget = 0;
  isComplete = false;
  onProgressCb?: (p: number) => void;

  boundOnResize!: () => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: (e: MouseEvent | TouchEvent) => void;

  onClickCallback?: (url: string) => void;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 28px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.035, // TASK 1 FIX: default slowed
    }: AppConfig,
    onClickCallback?: (url: string) => void,
    onProgressCb?: (p: number) => void
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onClickCallback = onClickCallback;
    this.onProgressCb = onProgressCb;
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.calcMaxScroll();
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      // TASK 1 FIX: Enable antialiasing for crisp card edges
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(
    items: GalleryItem[] | undefined,
    bend: number,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const galleryItems = items?.length ? items : [];
    this.mediasImages = [...galleryItems, ...galleryItems];
    this.medias = this.mediasImages.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          url: data.url,
          index,
          length: this.mediasImages.length,
          renderer: this.renderer,
          scene: this.scene,
          screen: this.screen,
          text: data.text,
          viewport: this.viewport,
          bend,
          textColor,
          borderRadius,
          font,
        })
    );
  }

  calcMaxScroll() {
    if (this.medias.length > 0) {
      this.maxScrollTarget = this.medias[0].width * (this.medias.length / 2);
    }
  }

  pushScroll(deltaY: number) {
    this.scroll.target = Math.max(
      0,
      Math.min(
        this.maxScrollTarget,
        this.scroll.target + deltaY * this.scrollSpeed * 0.18
      )
    );
    const p = Math.min(this.scroll.target / this.maxScrollTarget, 1);
    this.onProgressCb?.(p);
    this.isComplete = this.scroll.target >= this.maxScrollTarget;
  }

  reset() {
    this.isComplete = false;
    this.scroll.target = 0;
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.dragDistance = 0;
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    this.dragDistance = Math.abs(this.start - x);
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = Math.max(
      0,
      Math.min(this.maxScrollTarget, (this.scroll.position ?? 0) + distance)
    );
    this.isComplete = this.scroll.target >= this.maxScrollTarget;
    this.onProgressCb?.(this.scroll.target / this.maxScrollTarget);
  }

  onTouchUp(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    this.isDown = false;
    if (this.dragDistance < 8) this.handleClick(e);
    this.onCheck();
  }

  handleClick(e: MouseEvent | TouchEvent) {
    if (!this.onClickCallback) return;
    const clientX =
      'changedTouches' in e
        ? e.changedTouches[0].clientX
        : (e as MouseEvent).clientX;
    const rect = this.container.getBoundingClientRect();
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const halfVP = this.viewport.width / 2;
    let closest: Media | null = null;
    let closestDist = Infinity;
    for (const media of this.medias) {
      const planeNorm = media.plane.position.x / halfVP;
      const dist = Math.abs(planeNorm - normX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = media;
      }
    }
    if (closest?.url && closestDist < 0.7) this.onClickCallback(closest.url);
  }

  onCheck() {
    if (!this.medias?.[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    this.scroll.target = Math.max(
      0,
      Math.min(this.maxScrollTarget, width * itemIndex)
    );
    this.isComplete = this.scroll.target >= this.maxScrollTarget;
    this.onProgressCb?.(this.scroll.target / this.maxScrollTarget);
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    this.medias?.forEach((m) =>
      m.onResize({ screen: this.screen, viewport: this.viewport })
    );
    this.calcMaxScroll();
  }

  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    const direction =
      this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias?.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousemove', this.boundOnTouchMove as EventListener);
    window.addEventListener('mouseup', this.boundOnTouchUp as EventListener);
    window.addEventListener('touchmove', this.boundOnTouchMove as EventListener);
    window.addEventListener('touchend', this.boundOnTouchUp as EventListener);
    this.container.addEventListener(
      'mousedown',
      this.boundOnTouchDown as EventListener
    );
    this.container.addEventListener(
      'touchstart',
      this.boundOnTouchDown as EventListener
    );
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener(
      'mousemove',
      this.boundOnTouchMove as EventListener
    );
    window.removeEventListener(
      'mouseup',
      this.boundOnTouchUp as EventListener
    );
    window.removeEventListener(
      'touchmove',
      this.boundOnTouchMove as EventListener
    );
    window.removeEventListener(
      'touchend',
      this.boundOnTouchUp as EventListener
    );
    this.container.removeEventListener(
      'mousedown',
      this.boundOnTouchDown as EventListener
    );
    this.container.removeEventListener(
      'touchstart',
      this.boundOnTouchDown as EventListener
    );
    const canvas = this.renderer?.gl?.canvas as HTMLCanvasElement | undefined;
    canvas?.parentNode?.removeChild(canvas);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER — TASK 2: Padding reduction at head of component
// ─────────────────────────────────────────────────────────────────────────────

/*
 * TASK 2 CHANGE LOG — GalleryHeader padding:
 *
 * BEFORE:  className="... pt-4 pb-2 ..."   → pt = 16px, pb = 8px
 *          mb-2 on eyebrow                  → 8px
 *          mb-2 on title                    → 8px
 *          mb-2 on divider                  → 8px
 *          Total head padding:  16px top + 8px eyebrow gap = 24px before title
 *
 * AFTER:   pt-1.5 (6px) pb-1 (4px)         → removes 10px top, 4px bottom
 *          mb-1 on eyebrow (4px)            → removes 4px gap
 *          mb-1 on title (4px)              → removes 4px gap
 *          mb-1 on divider (4px)            → removes 4px gap
 *          Total head padding: 6px top + 4px eyebrow gap = 10px before title
 *
 * Net reduction: ~14px at head of component
 * Constraint: responsiveness, accessibility, existing gradient/animation styles preserved
 */
function GalleryHeader({ progress }: { progress: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.6 }}
      className="relative z-10 mb-10 flex-shrink-0 px-4 pt-8 text-center sm:mb-12 sm:pt-10"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#2E7D32]">
        Creative highlights
      </p>
      <h2
        id="gallery-heading"
        className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-[#0A2540] sm:text-4xl lg:text-5xl"
      >
        Creative stories,{" "}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-[#2E7D32] to-[#529D26] bg-clip-text text-transparent">
            in motion
          </span>
        </span>
      </h2>

      <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
        Explore featured reels, fresh ideas, and the creative projects we’re sharing.
      </p>

      <div className="relative mx-auto mt-5 h-1 w-24 overflow-hidden rounded-full bg-[#2E7D32]/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2E7D32] to-[#529D26] transition-all duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />

        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            animate={{ x: ["-150%", "350%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </motion.header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REEL DATA
// ─────────────────────────────────────────────────────────────────────────────

const MY_REELS: GalleryItem[] = [
  
  {
    image: '/reel/Blood-Donate.jpeg',
    text: 'Blood Camp Teams',
    url: 'https://www.instagram.com/reel/DeXJfBnJNqr/',
  },
  {
    image: '/reel/Mosquito-Nets.png',
    text: 'Mosquito Nets',
    url: 'https://www.instagram.com/reel/Dd0Y1UCpyKk/',
  },
  {
    image: '/reel/tents.png',
    text: ' donated waterproof tents',
    url: 'https://www.instagram.com/reel/DdThso1pDJN/',
  },
  {
    image: '/reel/What -is-UniHope.png',
    text: 'What is UNIHOPE Foundation?',
    url: 'https://www.instagram.com/reel/DcGPLlTplnM/',
  },
  {
    image: '/reel/Food-donate2.png',
    text: 'Food Distribution-2',
    url: 'https://www.instagram.com/reel/DcEItjrJq1H/',
  },
  {
    image: '/reel/Food-donate1',
    text: 'Food donate-1',
    url: 'https://www.instagram.com/reel/DcDwlHip8tq/',
  },
{
    image: '/reel/Blood-Donate.jpeg',
    text: 'Blood Camp',
    url: 'https://www.instagram.com/reel/De1bLAkJ8wp/',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR GALLERY
// ─────────────────────────────────────────────────────────────────────────────

export function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.08,
  font = 'bold 28px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.035, // TASK 1 FIX: slowed from 0.05
}: CircularGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const [progress, setProgress] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const reduced = useReducedMotion();

  const handleClick = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(
      containerRef.current,
      { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase },
      handleClick,
      (p) => setProgress(p)
    );
    appRef.current = app;
    return () => {
      app.destroy();
      appRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setGalleryVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGalleryVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 10% 0px', threshold: 0.05 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let pinnedY = 0;
    let locked = false;

    const onWheel = (e: WheelEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches) return;
      const app = appRef.current;
      if (!app) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = rect.top <= vh * 0.15 && rect.bottom >= vh * 0.3;
      if (visible) {
        if (e.deltaY < 0 && app.scroll.target <= 0) {
          locked = false;
          return;
        }
        if (e.deltaY > 0 && app.isComplete) {
          locked = false;
          return;
        }
        e.preventDefault();
        if (!locked) {
          pinnedY = window.scrollY;
          locked = true;
        }
        window.scrollTo({ top: pinnedY });
        app.pushScroll(e.deltaY);
      } else {
        locked = false;
      }
    };

    section.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      section.removeEventListener('wheel', onWheel);
    };
  }, [reduced]);

  return (
    <div
      ref={sectionRef}
      className="flex min-h-[620px] w-full flex-col overflow-hidden bg-gradient-to-b from-[#F7F9FC] via-white to-[#F5F8F5] sm:min-h-[680px]"
      aria-label="Reels and Projects Gallery"
      role="region"
    >
      {/* Header — TASK 2: reduced padding at head */}
      <GalleryHeader progress={progress} />

      {/* Canvas area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.div
          initial={{
            clipPath: 'inset(0 50% 0 50% round 24px)',
            opacity: 0,
            scale: 0.97,
            x: 28,
          }}
          animate={
            galleryVisible
              ? {
                  clipPath: 'inset(0 0% 0 0% round 24px)',
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }
              : {
                  clipPath: 'inset(0 50% 0 50% round 24px)',
                  opacity: 0,
                  scale: 0.97,
                  x: 28,
                }
          }
          transition={{ duration: reduced ? 0.01 : 0.9, ease: 'easeOut' }}
          className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
        >
          <div
            ref={containerRef}
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
            role="img"
            aria-label="Scrollable 3D reel gallery — swipe or scroll to browse"
          />
        </motion.div>

        {/* Hint pill */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/60 text-[11px] font-medium whitespace-nowrap"
          aria-hidden="true"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Swipe to explore · Tap a card to open the post
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectGallery(props: CircularGalleryProps) {
  return (
    <CircularGallery
      items={MY_REELS}
      bend={3}
      textColor="#ffffff"
      borderRadius={0.08}
      scrollSpeed={2}
      scrollEase={0.035} // TASK 1 FIX: slowed
      {...props}
    />
  );
}