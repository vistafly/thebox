# GSAP ScrollTrigger Immersive Effects - Implementation Instructions

## Overview
Implement immersive scroll-based animations using GSAP ScrollTrigger for PNG cutout images (person with transparent background). These effects should create a cinematic, engaging experience as users scroll through the page.

## Prerequisites

### Required Dependencies
```html
<!-- GSAP Core -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

<!-- ScrollTrigger Plugin -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

Or via npm:
```bash
npm install gsap
```

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

---

## Effect 1: Parallax Depth Reveal

Creates a layered parallax effect where the cutout image appears to emerge from the background.

### HTML Structure
```html
<section class="parallax-reveal" style="height: 200vh; position: relative; overflow: hidden;">
  <div class="parallax-bg" style="position: absolute; inset: 0; background: linear-gradient(135deg, #1a1a2e, #16213e);"></div>
  <div class="parallax-mid" style="position: absolute; inset: 0; opacity: 0.3;">
    <!-- Optional texture/pattern layer -->
  </div>
  <img 
    src="your-cutout-image.png" 
    class="parallax-subject" 
    alt="Subject"
    style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); max-height: 80vh; object-fit: contain;"
  />
  <div class="parallax-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5);"></div>
</section>
```

### JavaScript Implementation
```javascript
gsap.registerPlugin(ScrollTrigger);

// Parallax Depth Reveal
const parallaxReveal = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.parallax-reveal',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  // Background moves slower (parallax depth)
  tl.to('.parallax-bg', {
    y: '-20%',
    scale: 1.1,
    ease: 'none'
  }, 0);

  // Subject image emerges and scales
  tl.fromTo('.parallax-subject', 
    { 
      y: '30%', 
      scale: 0.8, 
      opacity: 0,
      filter: 'blur(10px)'
    },
    { 
      y: '0%', 
      scale: 1, 
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power2.out'
    }, 0
  );

  // Overlay fades out to reveal subject
  tl.to('.parallax-overlay', {
    opacity: 0,
    ease: 'power1.out'
  }, 0);
};

parallaxReveal();
```

---

## Effect 2: Cinematic Split Screen Reveal

The image is revealed through an animated split/curtain effect.

### HTML Structure
```html
<section class="split-reveal" style="height: 150vh; position: relative;">
  <div class="split-container" style="position: sticky; top: 0; height: 100vh; overflow: hidden;">
    
    <!-- Subject behind the curtains -->
    <img 
      src="your-cutout-image.png" 
      class="split-subject"
      alt="Subject"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-height: 90vh; z-index: 1;"
    />
    
    <!-- Left curtain -->
    <div class="curtain curtain-left" style="position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: #0f0f0f; z-index: 2;"></div>
    
    <!-- Right curtain -->
    <div class="curtain curtain-right" style="position: absolute; top: 0; right: 0; width: 50%; height: 100%; background: #0f0f0f; z-index: 2;"></div>
    
  </div>
</section>
```

### JavaScript Implementation
```javascript
const splitReveal = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.split-reveal',
      start: 'top top',
      end: '+=100%',
      scrub: 0.5,
      pin: '.split-container'
    }
  });

  // Open curtains
  tl.to('.curtain-left', {
    xPercent: -100,
    ease: 'power2.inOut'
  }, 0);

  tl.to('.curtain-right', {
    xPercent: 100,
    ease: 'power2.inOut'
  }, 0);

  // Subject scales up slightly as revealed
  tl.fromTo('.split-subject',
    { scale: 0.9, opacity: 0.7 },
    { scale: 1, opacity: 1, ease: 'power1.out' },
    0
  );
};

splitReveal();
```

---

## Effect 3: 3D Perspective Scroll

Creates a 3D perspective effect where the image appears to rotate and move in 3D space.

### HTML Structure
```html
<section class="perspective-section" style="height: 300vh; perspective: 1000px;">
  <div class="perspective-container" style="position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d;">
    <img 
      src="your-cutout-image.png" 
      class="perspective-subject"
      alt="Subject"
      style="max-height: 70vh; transform-style: preserve-3d;"
    />
  </div>
</section>
```

### JavaScript Implementation
```javascript
const perspectiveScroll = () => {
  gsap.set('.perspective-subject', {
    transformPerspective: 1000,
    transformOrigin: 'center center'
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.perspective-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    }
  });

  // Phase 1: Rotate in from left
  tl.fromTo('.perspective-subject',
    { rotationY: -45, x: -200, opacity: 0, scale: 0.7 },
    { rotationY: 0, x: 0, opacity: 1, scale: 1, duration: 1 }
  );

  // Phase 2: Hold center
  tl.to('.perspective-subject', {
    rotationY: 0,
    duration: 0.5
  });

  // Phase 3: Rotate out to right
  tl.to('.perspective-subject', {
    rotationY: 45,
    x: 200,
    opacity: 0,
    scale: 0.7,
    duration: 1
  });
};

perspectiveScroll();
```

---

## Effect 4: Dramatic Scale & Pin

The subject dramatically scales from small to full-screen as user scrolls, then pins.

### HTML Structure
```html
<section class="scale-pin-section" style="height: 250vh;">
  <div class="scale-container" style="position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden;">
    <img 
      src="your-cutout-image.png" 
      class="scale-subject"
      alt="Subject"
      style="max-width: 100%; max-height: 100vh; object-fit: contain;"
    />
    
    <!-- Text overlay that appears -->
    <div class="scale-text" style="position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%); color: white; text-align: center; opacity: 0;">
      <h2 style="font-size: 3rem; font-weight: bold;">YOUR HEADLINE</h2>
      <p style="font-size: 1.2rem;">Supporting text appears here</p>
    </div>
  </div>
</section>
```

### JavaScript Implementation
```javascript
const scalePinEffect = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.scale-pin-section',
      start: 'top top',
      end: '+=150%',
      scrub: 1,
      pin: '.scale-container',
      anticipatePin: 1
    }
  });

  // Subject scales from tiny to full
  tl.fromTo('.scale-subject',
    { 
      scale: 0.1, 
      opacity: 0,
      y: 100,
      filter: 'brightness(2) blur(20px)'
    },
    { 
      scale: 1, 
      opacity: 1,
      y: 0,
      filter: 'brightness(1) blur(0px)',
      duration: 2,
      ease: 'power2.out'
    }
  );

  // Text fades in after subject settles
  tl.to('.scale-text', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power1.out'
  }, '-=0.3');
};

scalePinEffect();
```

---

## Effect 5: Horizontal Scroll Showcase

Subject moves horizontally across the screen with different poses/angles.

### HTML Structure
```html
<section class="horizontal-section" style="height: 400vh;">
  <div class="horizontal-container" style="position: sticky; top: 0; height: 100vh; overflow: hidden;">
    <div class="horizontal-track" style="display: flex; align-items: center; height: 100%; width: 400vw;">
      
      <div class="panel" style="width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <img src="your-cutout-image.png" class="panel-subject" alt="Subject" style="max-height: 80vh;"/>
      </div>
      
      <div class="panel" style="width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #1a1a2e;">
        <div class="panel-content" style="text-align: center; color: white;">
          <h2>Section Title</h2>
          <p>Description text here</p>
        </div>
      </div>
      
      <div class="panel" style="width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <img src="your-cutout-image-2.png" class="panel-subject" alt="Subject" style="max-height: 80vh;"/>
      </div>
      
      <div class="panel" style="width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #16213e;">
        <div class="panel-content" style="text-align: center; color: white;">
          <h2>Final Section</h2>
        </div>
      </div>
      
    </div>
  </div>
</section>
```

### JavaScript Implementation
```javascript
const horizontalScroll = () => {
  const track = document.querySelector('.horizontal-track');
  const panels = gsap.utils.toArray('.panel');

  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: '.horizontal-section',
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      scrub: 1,
      pin: '.horizontal-container',
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // Animate each panel's subject
  panels.forEach((panel, i) => {
    const subject = panel.querySelector('.panel-subject');
    if (subject) {
      gsap.fromTo(subject,
        { x: 100, opacity: 0, rotation: 5 },
        {
          x: 0,
          opacity: 1,
          rotation: 0,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: gsap.getById('horizontal'),
            start: 'left center',
            end: 'center center',
            scrub: true
          }
        }
      );
    }
  });
};

horizontalScroll();
```

---

## Effect 6: Floating/Levitation Effect

Subject appears to float and bob gently while pinned, with particle effects around it.

### HTML Structure
```html
<section class="float-section" style="height: 200vh; background: linear-gradient(to bottom, #0f0f23, #1a1a3e);">
  <div class="float-container" style="position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden;">
    
    <!-- Glow effect behind subject -->
    <div class="subject-glow" style="position: absolute; width: 50vw; height: 50vh; background: radial-gradient(circle, rgba(100,100,255,0.3) 0%, transparent 70%); filter: blur(40px);"></div>
    
    <!-- Main subject -->
    <img 
      src="your-cutout-image.png" 
      class="float-subject"
      alt="Subject"
      style="position: relative; max-height: 75vh; z-index: 2;"
    />
    
    <!-- Shadow beneath -->
    <div class="subject-shadow" style="position: absolute; bottom: 10%; width: 200px; height: 20px; background: rgba(0,0,0,0.5); border-radius: 50%; filter: blur(15px);"></div>
    
  </div>
</section>
```

### JavaScript Implementation
```javascript
const floatEffect = () => {
  // Continuous floating animation (not scroll-based)
  gsap.to('.float-subject', {
    y: -20,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  // Shadow scales with float
  gsap.to('.subject-shadow', {
    scale: 0.8,
    opacity: 0.3,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  // Scroll-triggered reveal
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.float-section',
      start: 'top center',
      end: 'center center',
      scrub: 1
    }
  });

  tl.fromTo('.float-subject',
    { scale: 0.5, opacity: 0, y: 100 },
    { scale: 1, opacity: 1, y: 0 }
  );

  tl.fromTo('.subject-glow',
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1 },
    '<'
  );

  // Glow pulsing
  gsap.to('.subject-glow', {
    scale: 1.1,
    opacity: 0.8,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

floatEffect();
```

---

## Effect 7: Scroll-Driven Color/Filter Transitions

Subject's appearance changes (color grade, filters) as user scrolls through different "moods."

### HTML Structure
```html
<section class="color-transition" style="height: 400vh;">
  <div class="color-container" style="position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center;">
    
    <div class="color-bg" style="position: absolute; inset: 0; background: #000;"></div>
    
    <img 
      src="your-cutout-image.png" 
      class="color-subject"
      alt="Subject"
      style="position: relative; max-height: 80vh; z-index: 2;"
    />
    
    <!-- Mood labels -->
    <div class="mood-label" style="position: absolute; bottom: 15%; font-size: 2rem; color: white; opacity: 0;">
      <span class="mood-text">INTENSITY</span>
    </div>
    
  </div>
</section>
```

### JavaScript Implementation
```javascript
const colorTransition = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.color-transition',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: '.color-container'
    }
  });

  // Phase 1: Normal → High Contrast
  tl.to('.color-subject', {
    filter: 'contrast(1.5) saturate(1.3)',
    duration: 1
  });
  tl.to('.color-bg', {
    background: '#1a0a0a',
    duration: 1
  }, '<');

  // Phase 2: High Contrast → Desaturated/Moody
  tl.to('.color-subject', {
    filter: 'contrast(1.2) saturate(0.3) brightness(0.8)',
    duration: 1
  });
  tl.to('.color-bg', {
    background: '#0a0a1a',
    duration: 1
  }, '<');

  // Phase 3: Moody → Warm/Golden
  tl.to('.color-subject', {
    filter: 'contrast(1.1) saturate(1.5) sepia(0.3) brightness(1.1)',
    duration: 1
  });
  tl.to('.color-bg', {
    background: '#1a1500',
    duration: 1
  }, '<');

  // Phase 4: Return to normal
  tl.to('.color-subject', {
    filter: 'contrast(1) saturate(1) sepia(0) brightness(1)',
    duration: 1
  });
  tl.to('.color-bg', {
    background: '#000',
    duration: 1
  }, '<');
};

colorTransition();
```

---

## Effect 8: Text Integration with Subject

Text elements animate in coordination with the subject image.

### HTML Structure
```html
<section class="text-integration" style="height: 300vh;">
  <div class="text-container" style="position: sticky; top: 0; height: 100vh; display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: 0 5%;">
    
    <div class="text-content" style="color: white;">
      <h1 class="title-line-1" style="font-size: 4rem; font-weight: 900; transform: translateX(-100%); opacity: 0;">THE</h1>
      <h1 class="title-line-2" style="font-size: 5rem; font-weight: 900; transform: translateX(-100%); opacity: 0;">ARTIST</h1>
      <p class="description" style="font-size: 1.2rem; margin-top: 2rem; opacity: 0; transform: translateY(30px);">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
      </p>
    </div>
    
    <div class="subject-wrapper" style="display: flex; justify-content: center; align-items: center;">
      <img 
        src="your-cutout-image.png" 
        class="integrated-subject"
        alt="Subject"
        style="max-height: 80vh; transform: scale(0.8); opacity: 0;"
      />
    </div>
    
  </div>
</section>
```

### JavaScript Implementation
```javascript
const textIntegration = () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.text-integration',
      start: 'top top',
      end: '+=200%',
      scrub: 1,
      pin: '.text-container'
    }
  });

  // Subject enters
  tl.to('.integrated-subject', {
    scale: 1,
    opacity: 1,
    duration: 1,
    ease: 'power2.out'
  });

  // Title line 1 slides in
  tl.to('.title-line-1', {
    x: 0,
    opacity: 1,
    duration: 0.5
  }, '-=0.5');

  // Title line 2 slides in
  tl.to('.title-line-2', {
    x: 0,
    opacity: 1,
    duration: 0.5
  }, '-=0.3');

  // Description fades in
  tl.to('.description', {
    y: 0,
    opacity: 1,
    duration: 0.5
  }, '-=0.2');

  // Hold for reading
  tl.to({}, { duration: 1 });

  // Everything exits
  tl.to('.text-content > *', {
    opacity: 0,
    x: -50,
    stagger: 0.1,
    duration: 0.5
  });

  tl.to('.integrated-subject', {
    scale: 1.1,
    opacity: 0,
    duration: 0.5
  }, '<');
};

textIntegration();
```

---

## Utility Functions

### Smooth Scroll Integration
```javascript
// Optional: Add smooth scrolling behavior
ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true
});

// Normalize scroll behavior on mobile
ScrollTrigger.normalizeScroll(true);
```

### Responsive Breakpoints
```javascript
// Use matchMedia for responsive animations
ScrollTrigger.matchMedia({
  // Desktop
  "(min-width: 969px)": function() {
    // Desktop-specific animations
  },
  
  // Tablet
  "(min-width: 600px) and (max-width: 968px)": function() {
    // Tablet-specific animations
  },
  
  // Mobile
  "(max-width: 599px)": function() {
    // Mobile-specific animations (simplified)
  }
});
```

### Performance Tips
```javascript
// Batch similar ScrollTriggers for performance
ScrollTrigger.batch('.batch-element', {
  onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15 }),
  onLeave: batch => gsap.to(batch, { opacity: 0, y: 100 }),
  start: 'top 80%'
});

// Clean up on component unmount (React/Vue)
// return () => ScrollTrigger.getAll().forEach(t => t.kill());
```

---

## Implementation Checklist

1. [ ] Include GSAP and ScrollTrigger via CDN or npm
2. [ ] Register ScrollTrigger plugin: `gsap.registerPlugin(ScrollTrigger)`
3. [ ] Set up HTML structure with proper positioning (sticky, relative, absolute)
4. [ ] Ensure images have `max-height: XXvh` for responsive sizing
5. [ ] Use `markers: true` during development for debugging
6. [ ] Test on mobile devices with `ScrollTrigger.normalizeScroll()`
7. [ ] Implement `matchMedia` for responsive breakpoints
8. [ ] Add `will-change: transform` CSS for better performance on animated elements
9. [ ] Test with `anticipatePin: 1` to prevent flashing on fast scrolls

---

## Common Issues & Solutions

### Issue: Pinned element jumps/flashes
**Solution:** Add `anticipatePin: 1` to ScrollTrigger config

### Issue: Animations don't work on mobile
**Solution:** Use `ScrollTrigger.normalizeScroll(true)` and test touch events

### Issue: Wrong start/end positions after resize
**Solution:** Call `ScrollTrigger.refresh()` after dynamic content loads

### Issue: Multiple ScrollTriggers conflict
**Solution:** Use `refreshPriority` to control order of calculations

---

## Quick Start Template

```javascript
// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  
  // Enable debug markers during development
  // ScrollTrigger.defaults({ markers: true });
  
  // Initialize your effects
  parallaxReveal();
  // splitReveal();
  // perspectiveScroll();
  // scalePinEffect();
  // horizontalScroll();
  // floatEffect();
  // colorTransition();
  // textIntegration();
  
  // Refresh ScrollTrigger after all assets load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});
```
