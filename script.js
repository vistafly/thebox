// script.js

// Early preconnect to Google Maps domains for faster iframe loading
// This runs immediately before DOM is ready to warm up connections
(function() {
    const preconnectUrls = [
        'https://www.google.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com'
    ];
    preconnectUrls.forEach(url => {
        if (!document.querySelector(`link[href="${url}"][rel="preconnect"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            if (url.includes('gstatic')) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    });
})();

// Mobile detection utility for conditional GSAP configuration
const isMobile = {
    iOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    android: () => /Android/.test(navigator.userAgent),
    touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    any: function() { return this.iOS() || this.android() || this.touch() || window.innerWidth <= 768; }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP first (needed for ScrollTrigger checks)
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // FIX: Ensure scroll works on laptop trackpads
    // ScrollTrigger can interfere with native wheel scrolling on Windows laptops
    document.addEventListener('wheel', (e) => {
        const currentScrollY = window.scrollY;

        // Check if scroll happened naturally (next frame)
        requestAnimationFrame(() => {
            // Check if we're in an active pinned ScrollTrigger section
            // Include sections that are active (even if progress is 0) to catch entry transitions
            const activePinnedTrigger = ScrollTrigger.getAll().find(st =>
                st.pin && st.isActive
            );

            // If scroll position didn't change after wheel event AND we're not in a pinned section, force it
            if (window.scrollY === currentScrollY && !e.defaultPrevented && !activePinnedTrigger) {
                window.scrollBy(0, e.deltaY);
            }
        });
    }, { passive: true });

    // Configure ScrollTrigger
    // Note: normalizeScroll() is intentionally NOT used as it causes crashes on iOS Safari
    // with complex pinned horizontal scroll sections
    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });

    // Custom Cursor
    initCustomCursor();
    
    // Preloader
    initPreloader();
    
    // Header scroll effects
    initHeaderEffects();
    
    // Hero animations
    initHeroAnimations();
    
    // Music player
    initMusicPlayer();
    
    // Scroll animations
    initScrollAnimations();
    
    // Smooth scrolling
    initSmoothScrolling();
    
    // Interactive elements
    initInteractiveElements();
    
    // Form interactions
    initFormInteractions();

});

document.getElementById('current-year').textContent = new Date().getFullYear();

    
document.addEventListener('DOMContentLoaded', function() {
    initLogo3DEffect();
    initLogoMorph();
});

/**
 * Logo Morph Animation System
 * Smoothly morphs the hero logo into the navbar position on scroll
 * Uses GPU-accelerated properties (transform, opacity) only
 */
function initLogoMorph() {
    const logo = document.querySelector('.logo-desktop');
    const logoMobile = document.querySelector('.logo-mobile');
    const heroSection = document.getElementById('hero');
    const header = document.querySelector('.header');

    if (!logo || !heroSection) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Configuration
    const config = {
        scrollThreshold: 150, // pixels of scroll to complete morph (reduced for quicker transition)
        smoothing: 0.18, // interpolation factor for smooth movement (higher = more responsive)
        // Desktop end position (relative to viewport)
        desktop: {
            endX: 40, // pixels from left
            endY: 25, // pixels from top (in header)
            endScale: 0.15, // final scale factor
        },
        // Mobile end position
        mobile: {
            endX: 20, // pixels from left
            endY: 15, // pixels from top
            endScale: 0.24, // final scale factor (larger for mobile)
        },
        breakpoint: 1024, // px - below this uses mobile settings
    };

    // State
    let isMorphComplete = false;
    let startPosition = null;
    let currentConfig = null;

    // Smooth interpolation state (for buttery smooth animation)
    let currentX = 0;
    let currentY = 0;
    let currentScale = 1;
    let currentOpacity = 1;
    let animationFrameId = null;

    // Linear interpolation helper
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Smooth easing function (ease-in-out cubic for natural feel)
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Get current responsive config
    function getResponsiveConfig() {
        return window.innerWidth <= config.breakpoint ? config.mobile : config.desktop;
    }

    // Calculate start position (center of viewport)
    function calculateStartPosition() {
        const logoWidth = window.innerWidth <= 768 ? 250 : (window.innerWidth <= 1024 ? 300 : 500);
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 1,
            width: logoWidth
        };
    }

    // Calculate end position (in navbar)
    function calculateEndPosition() {
        const cfg = getResponsiveConfig();

        // Get the actual position of the logo-mobile element for accurate targeting
        if (logoMobile) {
            const logoMobileRect = logoMobile.getBoundingClientRect();
            // Target the center of where the nav logo appears
            return {
                x: logoMobileRect.left + logoMobileRect.width / 2,
                y: logoMobileRect.top + logoMobileRect.height / 2,
                scale: cfg.endScale
            };
        }

        // Fallback if logo-mobile not found
        const headerRect = header ? header.getBoundingClientRect() : { top: 0, height: 80 };
        return {
            x: cfg.endX + (startPosition.width * cfg.endScale) / 2,
            y: headerRect.top + cfg.endY + (startPosition.width * cfg.endScale) / 2,
            scale: cfg.endScale
        };
    }

    // Calculate target values based on scroll position
    function getTargetValues() {
        const scrollY = window.scrollY;
        startPosition = calculateStartPosition();
        const endPosition = calculateEndPosition();

        // Calculate progress (0 to 1) with smooth easing
        const rawProgress = Math.min(scrollY / config.scrollThreshold, 1);
        const easedProgress = prefersReducedMotion ? (rawProgress >= 0.5 ? 1 : 0) : easeInOutCubic(rawProgress);

        // Calculate target positions
        const targetX = lerp(0, endPosition.x - startPosition.x, easedProgress);
        const targetY = lerp(0, endPosition.y - startPosition.y, easedProgress);
        const targetScale = lerp(1, endPosition.scale, easedProgress);

        // Opacity fades out starting at 40% progress (earlier fade for smoother handoff)
        const targetOpacity = easedProgress > 0.4 ? lerp(1, 0, (easedProgress - 0.4) / 0.6) : 1;

        return { targetX, targetY, targetScale, targetOpacity, progress: rawProgress, easedProgress };
    }

    // Continuous animation loop for buttery smooth interpolation
    function animateLoop() {
        const { targetX, targetY, targetScale, targetOpacity, progress, easedProgress } = getTargetValues();

        // Smoothly interpolate current values towards targets
        const smoothingFactor = config.smoothing;
        currentX = lerp(currentX, targetX, smoothingFactor);
        currentY = lerp(currentY, targetY, smoothingFactor);
        currentScale = lerp(currentScale, targetScale, smoothingFactor);
        currentOpacity = lerp(currentOpacity, targetOpacity, smoothingFactor);

        // Snap to target when very close (prevents endless micro-animations)
        if (Math.abs(currentX - targetX) < 0.01) currentX = targetX;
        if (Math.abs(currentY - targetY) < 0.01) currentY = targetY;
        if (Math.abs(currentScale - targetScale) < 0.0001) currentScale = targetScale;
        if (Math.abs(currentOpacity - targetOpacity) < 0.001) currentOpacity = targetOpacity;

        // Determine morph state - show navbar logo earlier (at 50% progress) for smooth overlap
        const shouldShowNavLogo = easedProgress > 0.5;
        const isFullyMorphed = progress >= 1 && currentOpacity < 0.01;
        const isAtStart = progress === 0 && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1;

        if (isAtStart) {
            // At top - reset morph state but let 3D effect control transform
            if (logo.classList.contains('morphing') || logo.classList.contains('morphed')) {
                logo.classList.remove('morphing', 'morphed');
                if (logoMobile) logoMobile.classList.remove('visible');
                document.body.classList.remove('logo-morphed');
                logo.style.opacity = '';
                isMorphComplete = false;
            }
            // Don't set transform here - let initLogo3DEffect handle it
        } else if (isFullyMorphed) {
            // Morph complete
            if (!isMorphComplete) {
                isMorphComplete = true;
                logo.classList.remove('morphing');
                logo.classList.add('morphed');
                document.body.classList.add('logo-morphed');
                if (logoMobile) logoMobile.classList.add('visible');
            }
        } else {
            // Morphing in progress
            isMorphComplete = false;
            logo.classList.add('morphing');
            logo.classList.remove('morphed');

            // Show navbar logo early for smooth crossfade (prevents logo gap)
            if (shouldShowNavLogo) {
                if (logoMobile) logoMobile.classList.add('visible');
                document.body.classList.add('logo-morphed');
            } else {
                if (logoMobile) logoMobile.classList.remove('visible');
                document.body.classList.remove('logo-morphed');
            }

            // Apply smooth transform (GPU-accelerated)
            logo.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(${currentScale})`;
            logo.style.opacity = currentOpacity;
        }

        // Continue animation loop
        animationFrameId = requestAnimationFrame(animateLoop);
    }

    // Start/stop animation based on visibility
    function startAnimation() {
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateLoop);
        }
    }

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Handle resize - recalculate positions
    function handleResize() {
        startPosition = calculateStartPosition();
        currentConfig = getResponsiveConfig();
    }

    // Initialize positions
    startPosition = calculateStartPosition();
    currentConfig = getResponsiveConfig();

    // Initialize current values based on scroll position
    const initialValues = getTargetValues();
    currentX = initialValues.targetX;
    currentY = initialValues.targetY;
    currentScale = initialValues.targetScale;
    currentOpacity = initialValues.targetOpacity;

    // Resize listener
    window.addEventListener('resize', handleResize, { passive: true });

    // Use visibility API to pause animation when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    // Start the smooth animation loop
    startAnimation();
}


function initLogo3DEffect() {
    const logo = document.querySelector('.logo-desktop');
    const heroSection = document.getElementById('hero');
    if (!logo) return;

    // Configuration
    const config = {
        maxRotation: 20,
        perspective: 1000,
        smoothness: 0.1,              // Lower = smoother transitions
        floatAmplitude: 10,
        floatSpeed: 0.0015,
        precisionThreshold: 0.01,     // Snap to zero below this value
        swipeSensitivity: 0.8,        // How much swipe affects tilt (higher = more responsive)
        swipeDecay: 0.92,             // How fast swipe effect fades (lower = faster decay)
        tapThreshold: 10,             // Max movement (px) to count as tap vs swipe
        tapTimeThreshold: 200,        // Max duration (ms) to count as tap
        tapBounceScale: 1.08,         // Scale factor for tap bounce
        tapBounceDuration: 150        // Duration of tap bounce (ms)
    };

    // State
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let animationId = null;
    let isReady = false;

    // Touch/Swipe state
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let swipeVelocityX = 0;
    let swipeVelocityY = 0;
    let isTouching = false;
    let isTouchingLogo = false; // Track if touch started on logo (prevents scroll)

    // Tap bounce state
    let currentScale = 1;
    let targetScale = 1;

    // Utility: Round small values to zero to prevent floating-point precision errors
    function snapToZero(value) {
        return Math.abs(value) < config.precisionThreshold ? 0 : value;
    }

    // Utility: Round to 2 decimal places for clean transform values
    function roundValue(value) {
        return Math.round(value * 100) / 100;
    }

    // Utility: Clamp value between min and max
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Check if touch is within hero section
    function isInHeroSection(clientY) {
        if (!heroSection) return false; // Changed: return false if hero section not found
        const rect = heroSection.getBoundingClientRect();
        return clientY >= rect.top && clientY <= rect.bottom;
    }

    // Mouse move handler (desktop - uses position tracking)
    function handleMouseMove(e) {
        pointerX = e.clientX;
        pointerY = e.clientY;

        // Desktop: calculate rotation based on mouse position
        const normalizedX = (pointerX / window.innerWidth) * 2 - 1;
        const normalizedY = (pointerY / window.innerHeight) * 2 - 1;
        targetRotationY = normalizedX * config.maxRotation;
        targetRotationX = -normalizedY * config.maxRotation;
    }

    // Check if touch point is on the logo element
    function isTouchOnLogo(touch) {
        const logoRect = logo.getBoundingClientRect();
        // Add some padding for easier touch targeting
        const padding = 20;
        return (
            touch.clientX >= logoRect.left - padding &&
            touch.clientX <= logoRect.right + padding &&
            touch.clientY >= logoRect.top - padding &&
            touch.clientY <= logoRect.bottom + padding
        );
    }

    // Touch start - record initial position
    function handleTouchStart(e) {
        if (e.touches.length === 0) return;

        const touch = e.touches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        touchStartTime = Date.now();
        isTouching = true;

        // Check if touch started on the logo (prevents scroll while swiping)
        isTouchingLogo = isTouchOnLogo(touch);

        // Reset swipe velocity on new touch
        swipeVelocityX = 0;
        swipeVelocityY = 0;
    }

    // Touch move - calculate swipe direction and apply tilt
    function handleTouchMove(e) {
        if (!isTouching || e.touches.length === 0) return;

        const touch = e.touches[0];

        // Calculate movement delta (swipe direction)
        const deltaX = touch.clientX - lastTouchX;
        const deltaY = touch.clientY - lastTouchY;

        // Prevent scroll if user is touching and swiping the logo (any direction)
        // This allows the 3D tilt effect without page scrolling
        if (isTouchingLogo) {
            e.preventDefault();
        }

        // Update swipe velocity based on direction
        // Positive deltaX (swipe right) = tilt right (positive rotateY)
        // Positive deltaY (swipe down) = tilt forward (negative rotateX)
        swipeVelocityX += deltaX * config.swipeSensitivity;
        swipeVelocityY += deltaY * config.swipeSensitivity;

        // Clamp velocities to max rotation
        swipeVelocityX = clamp(swipeVelocityX, -config.maxRotation, config.maxRotation);
        swipeVelocityY = clamp(swipeVelocityY, -config.maxRotation, config.maxRotation);

        // Apply swipe direction to target rotation
        targetRotationY = swipeVelocityX;
        targetRotationX = -swipeVelocityY;

        // Store last position for next delta calculation
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    }

    // Touch end - detect tap or let swipe decay
    function handleTouchEnd(e) {
        if (!isTouching) return;

        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const totalMovementX = Math.abs(lastTouchX - touchStartX);
        const totalMovementY = Math.abs(lastTouchY - touchStartY);
        const totalMovement = Math.sqrt(totalMovementX * totalMovementX + totalMovementY * totalMovementY);

        // Detect tap: short duration + minimal movement
        if (touchDuration < config.tapTimeThreshold && totalMovement < config.tapThreshold) {
            triggerTapBounce();
        }

        isTouching = false;
        isTouchingLogo = false;
    }

    // Tap bounce effect
    function triggerTapBounce() {
        targetScale = config.tapBounceScale;

        // Return to normal after bounce
        setTimeout(() => {
            targetScale = 1;
        }, config.tapBounceDuration);
    }

    // Animation loop - synced to requestAnimationFrame
    function animate(time) {
        // Stop 3D effect if logo is morphing or morphed (morph animation controls transform)
        const isMorphing = logo.classList.contains('morphing') || logo.classList.contains('morphed') || document.body.classList.contains('logo-morphed');
        if (isMorphing) {
            // Reset 3D effect state but don't override morph transform
            currentRotationX = 0;
            currentRotationY = 0;
            targetRotationX = 0;
            targetRotationY = 0;
            swipeVelocityX = 0;
            swipeVelocityY = 0;
            currentScale = 1;
            targetScale = 1;
            animationId = requestAnimationFrame(animate);
            return;
        }

        // Decay swipe velocity when not touching (gradual return to center)
        if (!isTouching) {
            swipeVelocityX *= config.swipeDecay;
            swipeVelocityY *= config.swipeDecay;

            // Snap to zero when velocity is negligible
            if (Math.abs(swipeVelocityX) < config.precisionThreshold) swipeVelocityX = 0;
            if (Math.abs(swipeVelocityY) < config.precisionThreshold) swipeVelocityY = 0;

            // Update target rotation based on decaying velocity (mobile)
            // Only apply if we have swipe velocity (mobile interaction)
            if (swipeVelocityX !== 0 || swipeVelocityY !== 0) {
                targetRotationY = swipeVelocityX;
                targetRotationX = -swipeVelocityY;
            }
        }

        // Calculate floating animation
        const floatOffset = roundValue(Math.sin(time * config.floatSpeed) * config.floatAmplitude);

        // Smooth interpolation for rotation
        const deltaX = targetRotationX - currentRotationX;
        const deltaY = targetRotationY - currentRotationY;

        currentRotationX += deltaX * config.smoothness;
        currentRotationY += deltaY * config.smoothness;

        // Snap to target if difference is negligible
        currentRotationX = snapToZero(deltaX) === 0 ? targetRotationX : currentRotationX;
        currentRotationY = snapToZero(deltaY) === 0 ? targetRotationY : currentRotationY;

        // Smooth interpolation for scale (tap bounce)
        currentScale += (targetScale - currentScale) * 0.2;
        if (Math.abs(targetScale - currentScale) < 0.001) currentScale = targetScale;

        // Round final values
        const rotX = roundValue(currentRotationX);
        const rotY = roundValue(currentRotationY);
        const scale = roundValue(currentScale);

        // Apply transform with clean values
        logo.style.transform = `perspective(${config.perspective}px) translate(-50%, -50%) translateY(${floatOffset}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;

        animationId = requestAnimationFrame(animate);
    }

    // Initialize only after DOM is fully ready
    function start() {
        if (isReady) return;
        isReady = true;

        // Set initial safe transform
        logo.style.transform = 'translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';

        // Mouse events (desktop)
        document.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Touch events (mobile) - swipe direction based
        // Register touch events on hero section only to avoid blocking page scroll
        // Note: touchmove is non-passive to allow preventDefault when swiping the logo
        if (heroSection) {
            heroSection.addEventListener('touchstart', handleTouchStart, { passive: true });
            heroSection.addEventListener('touchmove', handleTouchMove, { passive: false });
            heroSection.addEventListener('touchend', handleTouchEnd, { passive: true });
            heroSection.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        }

        // Handle resize - reset to center position
        window.addEventListener('resize', () => {
            pointerX = window.innerWidth / 2;
            pointerY = window.innerHeight / 2;
            // Reset target rotation to center on resize
            targetRotationX = 0;
            targetRotationY = 0;
        }, { passive: true });

        // Start animation loop
        animationId = requestAnimationFrame(animate);
    }

    // Wait for full page load to prevent hard-load glitch
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
}

// Ultra-Responsive Custom Cursor
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return;

    // Configuration
    const config = {
        dotSize: 8,
        outlineSize: 32,
        hoverScale: 0.7,
        hoverDotSize: 12,
        hoverColor: 'var(--erin)',
        lerpSpeed: 0.2 // Lower = smoother but slower follow
    };

    // State
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let outlineX = mouseX;
    let outlineY = mouseY;
    let isHovering = false;
    let scale = 1;

    // Initialize sizes
    cursorDot.style.width = `${config.dotSize}px`;
    cursorDot.style.height = `${config.dotSize}px`;
    cursorOutline.style.width = `${config.outlineSize}px`;
    cursorOutline.style.height = `${config.outlineSize}px`;

    // Ultra-responsive mousemove handler
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate response for dot (no lag)
        cursorDot.style.transform = `translate(
            ${mouseX - config.dotSize/2}px, 
            ${mouseY - config.dotSize/2}px
        )`;
    });

    // Buttery smooth animation loop
    function animate() {
        // Smooth follow for outline
        outlineX = lerp(outlineX, mouseX, config.lerpSpeed);
        outlineY = lerp(outlineY, mouseY, config.lerpSpeed);
        
        // Apply transforms with perfect centering
        cursorOutline.style.transform = `translate(
            ${outlineX - config.outlineSize/2}px, 
            ${outlineY - config.outlineSize/2}px
        ) scale(${scale})`;

        requestAnimationFrame(animate);
    }

    // Linear interpolation helper
    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    // Start animation
    animate();

    // Hover effect management
    function handleHover() {
        isHovering = true;
        cursorDot.style.width = `${config.hoverDotSize}px`;
        cursorDot.style.height = `${config.hoverDotSize}px`;
        cursorOutline.style.borderColor = config.hoverColor;
        scale = config.hoverScale;
    }

    function handleLeave() {
        isHovering = false;
        cursorDot.style.width = `${config.dotSize}px`;
        cursorDot.style.height = `${config.dotSize}px`;
        cursorOutline.style.borderColor = 'rgba(97, 244, 87, 0.4)';
        scale = 1;
    }

    // Interactive elements
    const interactiveElements = document.querySelectorAll(
        'a, button, .member-card, .play-button, input, textarea, [data-cursor-hover]'
    );

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleHover);
        el.addEventListener('mouseleave', handleLeave);
    });

    // Click effect
    document.addEventListener('mousedown', () => {
        if (isHovering) scale = 0.9;
    });

    document.addEventListener('mouseup', () => {
        if (isHovering) scale = config.hoverScale;
    });

    // Window resize handler
    window.addEventListener('resize', () => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
    });
}

// Preloader
function initPreloader() {
    const loader = document.querySelector('.loader');
    const logoPath = document.querySelector('.logo-path');
    const logoText = document.querySelector('.logo-text');
    const progressFill = document.querySelector('.progress-fill');
    
    if (!loader) return;
    
    // Create animation timeline
    const tl = gsap.timeline();
    
    // Animate logo path
    tl.to(logoPath, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    })
    .to(logoText, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.5')
    .to(progressFill, {
        width: '100%',
        duration: 2,
        ease: 'power1.inOut'
    })
    .to(loader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            loader.style.display = 'none';
        }
    });
}

// Header Effects
function initHeaderEffects() {
    const header = document.querySelector('.header');
    
    ScrollTrigger.create({
        start: 'top -100',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: header }
    });
}

function initPreloader() {
    const loader = document.querySelector('.loader');
    const logoPath = document.querySelector('.logo-path');
    const logoText = document.querySelector('.logo-text');
    const progressFill = document.querySelector('.progress-fill');

    if (!loader) return;

    // Create animation timeline
    const tl = gsap.timeline();
    
    // Animate logo path
    tl.to(logoPath, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    })
    .to(logoText, {
        duration: 0.1,
        onStart: () => {
            // Start with the flicker animation
            logoText.classList.add('lit');
            
            // Add final glow enhancement when progress completes
            setTimeout(() => {
                logoText.classList.remove('lit');
                logoText.classList.add('final-glow');
                
                // Subtle continuous glow variation
                gsap.to(logoText, {
                    duration: 3,
                    filter: `
                        drop-shadow(0 0 7px rgba(255,255,255,1))
                        drop-shadow(0 0 15px rgba(255,255,255,0.8))
                        drop-shadow(0 0 22px rgba(255,255,255,0.4))`,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }, 1800); // Matches progress completion
        }
    }, '-=0.5')
    .to(progressFill, {
        width: '100%',
        duration: 2,
        ease: 'power1.inOut'
    })
    .to(loader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        delay: 0.3,
        onComplete: () => {
            loader.style.display = 'none';
            loader.style.pointerEvents = 'none';
            console.log('Loader hidden, pointer events disabled');
        }
    });
}

// Hero Animations
function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.5 });

    // Animate scroll indicator
    tl.from('.scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
    });

    // Parallax effect for hero background
    gsap.to('.bg-particles', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
}

 // Simple Slideshow Functionality
    document.addEventListener('DOMContentLoaded', function() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.slideshow-prev');
        const nextBtn = document.querySelector('.slideshow-next');
        let currentIndex = 0;
        let slideInterval;
        
        // Initialize slideshow
        function startSlideShow() {
            slideInterval = setInterval(nextSlide, 10000);
        }
        
        // Show specific slide
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            currentIndex = (index + slides.length) % slides.length;
            slides[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        }
        
        // Next slide
        function nextSlide() {
            showSlide(currentIndex + 1);
        }
        
        // Previous slide
        function prevSlide() {
            showSlide(currentIndex - 1);
        }
        
        // Event listeners
        prevBtn.addEventListener('click', function() {
            prevSlide();
            resetInterval();
        });
        
        nextBtn.addEventListener('click', function() {
            nextSlide();
            resetInterval();
        });
        
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                const slideIndex = parseInt(this.getAttribute('data-index'));
                showSlide(slideIndex);
                resetInterval();
            });
        });
        
        // Reset timer when user interacts
        function resetInterval() {
            clearInterval(slideInterval);
            startSlideShow();
        }
        
        // Start the slideshow
        startSlideShow();
    });

// Music Player
function initMusicPlayer() {
    const audio = new Audio();
    const playBtn = document.querySelector('.play-btn');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const volumeBtn = document.querySelector('.volume-btn');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeHigh = document.querySelector('.volume-high');
    const volumeLow = document.querySelector('.volume-low');
    const volumeMute = document.querySelector('.volume-mute');
    const progressSlider = document.querySelector('.progress-slider');
    const currentTimeDisplay = document.querySelector('.current-time');
    const totalTimeDisplay = document.querySelector('.total-time');
    const trackTitle = document.querySelector('.track-title');
    const trackArtist = document.querySelector('.track-artist');
    
    // Track list
    const tracks = [
        { title: "Throwback Party Mix", artist: "The Box", file: "audio/1.mp3" },
        { title: "Summer Vibes", artist: "The Box", file: "audio/2.mp3" },
        { title: "Neon Nights", artist: "The Box", file: "audio/3.mp3" }
    ];
    let currentTrackIndex = 0;
    let wasPlaying = false; // Track playback state before skipping
    
    // Initialize
    audio.volume = volumeSlider.value;
    loadTrack(currentTrackIndex);
    
    // Play/Pause
    playBtn.addEventListener('click', togglePlay);
    
    // Track navigation
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    
    // Volume control
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        updateVolumeIcons();
    });
    
    // Progress control
    progressSlider.addEventListener('input', (e) => {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('loadedmetadata', updateTotalTime);
    audio.addEventListener('play', updatePlayPauseIcons);
    audio.addEventListener('pause', updatePlayPauseIcons);
    
    function togglePlay() {
        if (audio.paused) {
            audio.play()
                .then(() => {
                    updatePlayPauseIcons();
                })
                .catch(error => {
                    console.error("Playback failed:", error);
                    alert("Please click play again to start audio");
                });
        } else {
            audio.pause();
            updatePlayPauseIcons();
        }
    }
    
    function loadTrack(index) {
        wasPlaying = !audio.paused; // Store current playback state
        if (wasPlaying) {
            audio.pause(); // Pause current track if playing
        }
        
        currentTrackIndex = index;
        const track = tracks[index];
        
        audio.src = track.file;
        audio.load();
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        progressSlider.value = 0;
        currentTimeDisplay.textContent = '0:00';
        
        // After metadata is loaded, resume playback if was playing
        audio.addEventListener('loadedmetadata', function handler() {
            audio.removeEventListener('loadedmetadata', handler);
            if (wasPlaying) {
                audio.play().catch(e => console.error("Autoplay failed:", e));
            }
            updatePlayPauseIcons(); // Ensure correct icon is shown
        }, { once: true });
    }
    
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
    }
    
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    }
    
    function toggleMute() {
        audio.muted = !audio.muted;
        updateVolumeIcons();
    }
    
    function updateVolumeIcons() {
        if (audio.muted || audio.volume === 0) {
            volumeHigh.style.display = 'none';
            volumeLow.style.display = 'none';
            volumeMute.style.display = 'block';
            volumeSlider.value = 0;
        } else if (audio.volume > 0.5) {
            volumeHigh.style.display = 'block';
            volumeLow.style.display = 'none';
            volumeMute.style.display = 'none';
        } else {
            volumeHigh.style.display = 'none';
            volumeLow.style.display = 'block';
            volumeMute.style.display = 'none';
        }
    }
    
    function updatePlayPauseIcons() {
        if (audio.paused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
    }
    
    function updateProgress() {
        if (!isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressSlider.value = progress;
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        }
    }
    
    function updateTotalTime() {
        if (!isNaN(audio.duration)) {
            totalTimeDisplay.textContent = formatTime(audio.duration);
        }
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Floating Visualizer (unchanged)
function initFloatingVisualizer() {
    const visualizer = document.querySelector('.visualizer-bars');
    if (!visualizer) return;
    
    // Create bars
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        visualizer.appendChild(bar);
    }
    
    // Animate bars
    function animateBars() {
        const bars = document.querySelectorAll('.visualizer-bars div');
        bars.forEach(bar => {
            gsap.to(bar, {
                height: Math.random() * 30 + 5,
                duration: 0.1,
                ease: 'power1.out'
            });
        });
        
        if (document.querySelector('.floating-visualizer.active')) {
            requestAnimationFrame(animateBars);
        }
    }
    
    // Start animation when music plays
    document.querySelector('.play-btn')?.addEventListener('click', function() {
        if (this.querySelector('.pause-icon').style.display === 'block') {
            animateBars();
        }
    });
}

// Scroll Animations (unchanged)
function initScrollAnimations() {
    // Section animations
    gsap.utils.toArray('.section').forEach((section, index) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
        
        tl.from(section.querySelector('.section-header'), {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
    
    // About text blocks
    gsap.utils.toArray('.text-block').forEach((block, index) => {
        gsap.from(block, {
            scrollTrigger: {
                trigger: block,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'power2.out'
        });
    });
    
    // Stats animation
    gsap.utils.toArray('.stat-item').forEach((stat, index) => {
        const number = stat.querySelector('.stat-number');
        const finalNumber = number.textContent;
        
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.7)'
        });
        
        // Animate numbers (except infinity symbol)
        if (finalNumber !== '∞' && !isNaN(finalNumber.replace('+', ''))) {
            number.textContent = '0';
            gsap.to({}, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 2,
                delay: index * 0.1 + 0.5,
                onUpdate: function() {
                    const progress = this.progress();
                    const currentNumber = Math.floor(progress * parseInt(finalNumber.replace('+', '')));
                    number.textContent = currentNumber + (finalNumber.includes('+') ? '+' : '');
                }
            });
        }
    });
    
    // Member cards
    gsap.utils.toArray('.member-card').forEach((card, index) => {
        gsap.fromTo(card,
            {
                y: 40,
                opacity: 0
            },
            {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                immediateRender: false
            }
        );
    });
    
    // Music player
    gsap.from('.music-player', {
        scrollTrigger: {
            trigger: '.music-player',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
}

    // Contact cards
    gsap.utils.toArray('.contact-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: index % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'power2.out'
        });
    });


// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');

            // Special handling for home/hero - always scroll to very top
            if (href === '#hero') {
                gsap.to(window, {
                    scrollTo: 0,
                    duration: 1.2,
                    ease: 'power2.inOut'
                });
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                // Get header height
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;

                // For other sections, position higher - increase offset
                const offset = 40 - headerHeight;

                // Calculate position
                const targetPosition = target.offsetTop + offset;
                const currentScroll = window.scrollY;
                const scrollDistance = Math.abs(targetPosition - currentScroll);

                // Check if scroll will pass through members section
                const membersSection = document.getElementById('members');

                if (membersSection) {
                    const membersStart = membersSection.offsetTop;
                    const membersEnd = membersStart + membersSection.offsetHeight;

                    // If scrolling through members section (either direction)
                    const willPassMembers = (currentScroll < membersEnd && targetPosition > membersStart) ||
                                           (currentScroll > membersStart && targetPosition < membersEnd);

                    if (willPassMembers) {
                        // Calculate duration based on distance for smooth, cinematic scroll
                        // Longer duration = smoother feel through members
                        const baseDuration = 1.5;
                        const extraDuration = Math.min(scrollDistance / 3000, 1.5);
                        const duration = baseDuration + extraDuration;

                        // Use GSAP scrollTo for buttery smooth scroll through members
                        gsap.to(window, {
                            scrollTo: targetPosition,
                            duration: duration,
                            ease: 'power1.inOut'
                        });
                        return;
                    }
                }

                // Standard smooth scroll for other cases
                gsap.to(window, {
                    scrollTo: targetPosition,
                    duration: 1,
                    ease: 'power2.inOut'
                });
            }
        });
    });
}

// Interactive Elements
function initInteractiveElements() {
    // Logo hover effect
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', () => {
            gsap.to('.logo-accent', {
                scaleX: 1,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
        
        logo.addEventListener('mouseleave', () => {
            gsap.to('.logo-accent', {
                scaleX: 0,
                duration: 0.4,
                ease: 'power2.in'
            });
        });
    }
    
    // Play button in hero
    const heroPlayBtn = document.querySelector('.play-button');
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', () => {
            gsap.to('.play-icon', {
                rotation: 360,
                duration: 0.6,
                ease: 'power2.out'
            });
            
            // Pulse effect
            gsap.fromTo('.play-button', 
                { scale: 1 },
                { 
                    scale: 1.1,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                }
            );
        });
    }
    
    // Member card interactions
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelector('.member-accent'), {
                width: '60px',
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelector('.member-accent'), {
                width: '0px',
                duration: 0.3,
                ease: 'power2.in'
            });
        });
    });
    
    // CTA button hover effect
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', () => {
            gsap.to('.cta-bg', {
                x: '0%',
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        ctaButton.addEventListener('mouseleave', () => {
            gsap.to('.cta-bg', {
                x: '-100%',
                duration: 0.4,
                ease: 'power2.in'
            });
        });
    }
    
    // Contact card hover effects
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelector('.contact-arrow'), {
                x: 5,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelector('.contact-arrow'), {
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// Form Interactions
function initFormInteractions() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        
        input.addEventListener('focus', () => {
            group.querySelector('label').style.color = 'var(--aqua)';
            gsap.to(group.querySelector('.form-line'), {
                width: '100%',
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                group.querySelector('label').style.color = 'var(--text-muted)';
                gsap.to(group.querySelector('.form-line'), {
                    width: '0%',
                    duration: 0.3,
                    ease: 'power2.in'
                });
            }
        });
    });
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully';
            
            // Reset form after delay
            setTimeout(() => {
                this.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="cta-text">Send Inquiry</span><div class="cta-bg"></div>';
                
                // Reset labels
                formGroups.forEach(group => {
                    const input = group.querySelector('input, textarea');
                    if (!input.value) {
                        group.querySelector('label').style.color = 'var(--text-muted)';
                        gsap.to(group.querySelector('.form-line'), {
                            width: '0%',
                            duration: 0.3,
                            ease: 'power2.in'
                        });
                    }
                });
            }, 3000);
        });
    }
}

// Utility Functions
function getRandomColor() {
    const colors = ['var(--erin)', 'var(--aqua)', 'var(--fuchsia)', 'var(--yellow)'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Intersection Observer for performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

// Observe elements for animations
document.querySelectorAll('.section, .member-card, .stat-item').forEach(el => {
    observer.observe(el);
});

// Resize handler
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Guaranteed Working Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    let scrollPosition = 0;
    
    if (!menuToggle || !nav) {
        console.error("Menu elements not found!");
        return;
    }

    menuToggle.addEventListener('click', function() {
        const isOpening = !nav.classList.contains('active');
        
        if (isOpening) {
            // Store scroll position before opening menu
            scrollPosition = window.scrollY;
            // Apply styles to prevent scrolling
            document.body.classList.add('menu-open');
            document.body.style.top = `-${scrollPosition}px`;
        } else {
            // Remove scroll prevention styles
            document.body.classList.remove('menu-open');
            // INSTANTLY restore scroll position (no smooth scrolling)
            document.body.style.top = '';
            document.documentElement.style.scrollBehavior = 'auto'; // Disable smooth scrolling
            window.scrollTo(0, scrollPosition);
            // Re-enable smooth scrolling after we're done
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = '';
            }, 0);
        }

        // Toggle menu classes
        this.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when clicking on links (mobile only)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const href = this.getAttribute('href');

                // Close menu and reset body
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.top = '';

                // Scroll to target after body is unfixed
                setTimeout(() => {
                    if (href === '#hero') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        const target = document.querySelector(href);
                        if (target) {
                            const header = document.querySelector('.header');
                            const headerHeight = header ? header.offsetHeight : 0;
                            const targetPosition = target.offsetTop + (40 - headerHeight);
                            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                        }
                    }
                }, 50);
            }
        });
    });
});

   // Tour Date Highlighting Functions (UNCHANGED)
function highlightUpcomingDates() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper function to parse time strings into Date objects
    function parseTime(hour, minute, period, baseDate) {
        let hours = parseInt(hour);
        const minutes = parseInt(minute);

        if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }

        const date = new Date(baseDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    let nextShow = null;
    let smallestTimeDiff = Infinity;
    let currentlyPlayingShow = null;
    
    // Remove all existing highlights
    document.querySelectorAll('.tour-date').forEach(dateElement => {
        dateElement.classList.remove('highlight', 'currently-playing', 'active');
    });
    
    // Process each tour date card
    document.querySelectorAll('.tour-date').forEach(dateElement => {
        const timeElement = dateElement.querySelector('time');
        const eventTimeElement = dateElement.querySelector('.event-time');
        
        if (!timeElement || !eventTimeElement) return;
        
        const datetime = timeElement.getAttribute('datetime');
        if (!datetime) return;
        
        // Parse event date
        const eventDate = new Date(datetime + 'T00:00:00');
        if (isNaN(eventDate.getTime())) return;
        
        // Parse event time
        const timeText = eventTimeElement.textContent.trim();
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        
        if (!timeMatch) return;
        
        const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;

        // Create start and end datetime objects
        const startDateTime = parseTime(startHour, startMin, startPeriod, eventDate);
        const endDateTime = parseTime(endHour, endMin, endPeriod, eventDate);
        
        // Check if show is currently happening
        if (now >= startDateTime && now <= endDateTime) {
            currentlyPlayingShow = dateElement;
        }
        
        // Check if show is in the future
        if (endDateTime > now) {
            const timeDiff = startDateTime - now;
            
            // Find the next upcoming show (closest to now but still in future)
            if (timeDiff < smallestTimeDiff) {
                smallestTimeDiff = timeDiff;
                nextShow = dateElement;
            }
        }
    });
    
    // Apply highlighting
    if (currentlyPlayingShow) {
        currentlyPlayingShow.classList.add('currently-playing', 'active');
        
        // Set timeout to switch when current show ends
        const eventTimeElement = currentlyPlayingShow.querySelector('.event-time');
        const timeText = eventTimeElement.textContent.trim();
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        
        if (timeMatch) {
            const [, , , , endHour, endMin, endPeriod] = timeMatch;
            const datetime = currentlyPlayingShow.querySelector('time').getAttribute('datetime');
            const eventDate = new Date(datetime + 'T00:00:00');
            const endDateTime = parseTime(endHour, endMin, endPeriod, eventDate);
            
            const timeUntilEnd = endDateTime - now;
            
            if (timeUntilEnd > 0) {
                setTimeout(highlightUpcomingDates, timeUntilEnd);
            }
        }
    } else if (nextShow) {
        nextShow.classList.add('highlight', 'active');
        
        // Set timeout to check again at show start time
        const timeElement = nextShow.querySelector('time');
        const eventTimeElement = nextShow.querySelector('.event-time');
        const datetime = timeElement.getAttribute('datetime');
        const eventDate = new Date(datetime + 'T00:00:00');
        const timeText = eventTimeElement.textContent.trim();
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        
        if (timeMatch) {
            const [startHour, startMin, startPeriod] = timeMatch.slice(1, 4);
            const startDateTime = parseTime(startHour, startMin, startPeriod, eventDate);
            const timeUntilStart = startDateTime - now;
            
            if (timeUntilStart > 0) {
                setTimeout(highlightUpcomingDates, timeUntilStart);
            }
        }
    } else {
        // No future shows, highlight most recent past show
        let mostRecentPast = null;
        let smallestPastDiff = Infinity;
        
        document.querySelectorAll('.tour-date').forEach(dateElement => {
            const timeElement = dateElement.querySelector('time');
            const eventTimeElement = dateElement.querySelector('.event-time');
            
            if (!timeElement || !eventTimeElement) return;
            
            const datetime = timeElement.getAttribute('datetime');
            if (!datetime) return;
            
            const eventDate = new Date(datetime + 'T00:00:00');
            if (isNaN(eventDate.getTime())) return;
            
            // Parse end time for comparison
            const timeText = eventTimeElement.textContent.trim();
            const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            
            if (timeMatch) {
                const [, , , , endHour, endMin, endPeriod] = timeMatch;
                const endDateTime = parseTime(endHour, endMin, endPeriod, eventDate);
                const timeDiff = now - endDateTime;
                
                if (timeDiff > 0 && timeDiff < smallestPastDiff) {
                    smallestPastDiff = timeDiff;
                    mostRecentPast = dateElement;
                }
            }
        });
        
        if (mostRecentPast) {
            mostRecentPast.classList.add('highlight', 'active');
        }
    }
}

// Optimized Tour Auto-Scroll Class
class TourAutoScroll {
    constructor() {
        this.tourGrid = document.querySelector('.tour-grid');
        this.tourSection = document.querySelector('.tour-section');
        this.tourCards = [];
        this.dotsContainer = null;
        this.dots = [];
        this.isActive = false;
        this.intervalId = null;
        this.currentIndex = 0;
        this.isPaused = false;
        this.lastUserAction = 0;
        this.hasInteracted = false;
        
        // Settings
        this.scrollSpeed = 3000; // 3 seconds
        this.pauseTime = 4000; // 4 seconds after user interaction
        this.mobileBreakpoint = 768; // Breakpoint for mobile
        
        this.init();
    }

    init() {
        // Find tour cards
        this.tourCards = Array.from(document.querySelectorAll('.tour-date'));

        if (!this.tourGrid || this.tourCards.length === 0) {
            return;
        }

        // Respect reduced motion preference - skip auto-scroll but keep manual dots
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Create dots container (always create for manual navigation)
        this.createDots();

        // Skip auto-scroll if user prefers reduced motion
        if (prefersReducedMotion) {
            return;
        }

        // Start on mobile only
        this.checkIfShouldRun();

        // Optimized resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.checkIfShouldRun(), 100);
        });

        // Add interaction listeners
        this.addTourListeners();
    }

    createDots() {
        // Create dots container
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'tour-dots';
        
        // Style the dots container (mobile only)
        Object.assign(this.dotsContainer.style, {
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '.5rem',
            padding: '0 0px',
            gap: '8px'
        });
        
        // Create dots
        this.tourCards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'tour-dot';
            dot.setAttribute('aria-label', `Go to card ${index + 1}`);
            dot.setAttribute('aria-current', 'false');
            
            // Style the dots
            Object.assign(dot.style, {
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                outline: 'none'
            });
            
            dot.addEventListener('click', () => {
                this.goToCard(index);
            });
            
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
        
        // Add dots container to the tour section
        if (this.tourSection) {
            this.tourSection.appendChild(this.dotsContainer);
        }
        
        // Update dot visibility based on screen size
        this.updateDotsVisibility();
    }

    updateDotsVisibility() {
        const isMobile = window.innerWidth <= this.mobileBreakpoint;
        if (this.dotsContainer) {
            this.dotsContainer.style.display = isMobile ? 'flex' : 'none';
        }
    }

    updateActiveDot() {
        this.dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                dot.style.transform = 'scale(1.2)';
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                dot.style.transform = 'scale(1)';
                dot.setAttribute('aria-current', 'false');
            }
        });
    }

    goToCard(index) {
        if (index < 0 || index >= this.tourCards.length) return;
        
        this.currentIndex = index;
        const targetCard = this.tourCards[this.currentIndex];
        
        if (!targetCard) return;
        
        // Scroll to center the card
        const cardCenter = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
        const gridCenter = this.tourGrid.offsetWidth / 2;
        const scrollTo = cardCenter - gridCenter;
        
        this.tourGrid.scrollTo({
            left: Math.max(0, scrollTo),
            behavior: 'smooth'
        });
        
        // Update interaction state
        this.lastUserAction = Date.now();
        this.hasInteracted = true;
        if (this.tourSection) {
            this.tourSection.classList.add('user-interacted');
        }
        
        // Update active dot
        this.updateActiveDot();
    }

    checkIfShouldRun() {
        const isMobile = window.innerWidth <= this.mobileBreakpoint;
        
        if (isMobile && !this.isActive) {
            this.start();
        } else if (!isMobile && this.isActive) {
            this.stop();
        }
        
        this.updateDotsVisibility();
    }

    start() {
        if (this.isActive || this.tourCards.length <= 1) return;
        
        this.isActive = true;
        
        // Only reset currentIndex if we haven't interacted yet
        if (!this.hasInteracted) {
            this.currentIndex = 0;
            this.goToCard(0); // Immediately show first card when starting
        }
        
        // Wait 2 seconds then start scrolling
        setTimeout(() => {
            if (this.isActive) {
                this.intervalId = setInterval(() => {
                    this.autoScroll();
                }, this.scrollSpeed);
            }
        }, 2000);
    }

    stop() {
        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    autoScroll() {
        if (this.isPaused || (Date.now() - this.lastUserAction < this.pauseTime)) {
            return;
        }

        // Move to next card
        this.currentIndex = (this.currentIndex + 1) % this.tourCards.length;
        const targetCard = this.tourCards[this.currentIndex];
        
        if (!targetCard) return;
        
        // Scroll to center the card
        const cardCenter = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
        const gridCenter = this.tourGrid.offsetWidth / 2;
        const scrollTo = cardCenter - gridCenter;
        
        this.tourGrid.scrollTo({
            left: Math.max(0, scrollTo),
            behavior: 'smooth'
        });
        
        // Update active dot
        this.updateActiveDot();
    }

    addTourListeners() {
        if (!this.tourGrid) return;

        const handleInteraction = () => {
            this.lastUserAction = Date.now();
            
            if (!this.hasInteracted && this.tourSection) {
                this.hasInteracted = true;
                this.tourSection.classList.add('user-interacted');
            }
            
            // When user interacts, find the current visible card
            this.updateCurrentIndex();
        };

        // Passive event listeners for better performance
        const passiveOptions = { passive: true };
        this.tourGrid.addEventListener('touchstart', handleInteraction, passiveOptions);
        this.tourGrid.addEventListener('touchmove', handleInteraction, passiveOptions);
        this.tourGrid.addEventListener('scroll', handleInteraction, passiveOptions);
        this.tourGrid.addEventListener('mousedown', handleInteraction);

        this.tourCards.forEach(card => {
            card.addEventListener('click', handleInteraction);
            card.addEventListener('touchstart', handleInteraction, passiveOptions);
        });

        // Pause on hover for desktop
        if (window.innerWidth > this.mobileBreakpoint) {
            this.tourGrid.addEventListener('mouseenter', () => this.pause());
            this.tourGrid.addEventListener('mouseleave', () => this.resume());
        }
    }

    updateCurrentIndex() {
        if (!this.tourGrid || this.tourCards.length === 0) return;
        
        // Find which card is currently most visible
        const gridRect = this.tourGrid.getBoundingClientRect();
        const gridCenter = gridRect.left + (gridRect.width / 2);
        
        let closestCardIndex = 0;
        let smallestDistance = Infinity;
        
        this.tourCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + (cardRect.width / 2);
            const distance = Math.abs(cardCenter - gridCenter);
            
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestCardIndex = index;
            }
        });
        
        this.currentIndex = closestCardIndex;
        this.updateActiveDot();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastUserAction = Date.now(); // Reset interaction time when resuming
    }
}

// Initialize Tour Functions
function initTourFunctions() {
    // Initialize date highlighting (unchanged)
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(highlightUpcomingDates, 100);
        setInterval(highlightUpcomingDates, 60000); // Check every minute
    });

    // Backup for window load (unchanged)
    window.addEventListener('load', function() {
        setTimeout(highlightUpcomingDates, 100);
    });

    // Initialize the tour auto-scroll with performance optimization
    if (document.querySelector('.tour-grid')) {
        // Use requestIdleCallback if available for better performance
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                window.tourScroller = new TourAutoScroll();
            }, { timeout: 1000 });
        } else {
            // Fallback for browsers that don't support requestIdleCallback
            setTimeout(() => {
                window.tourScroller = new TourAutoScroll();
            }, 300);
        }
    }
}

// Call the initialization function
if (document.readyState !== 'loading') {
    initTourFunctions();
} else {
    document.addEventListener('DOMContentLoaded', initTourFunctions);
}

// ==================== //
// MEMBERS HORIZONTAL SCROLL SHOWCASE
// ==================== //
(function initMembersShowcase() {
    const section = document.getElementById('members');
    if (!section || !section.classList.contains('band-showcase-section')) return;

    const track = section.querySelector('.band-showcase-track');
    if (!track) return;

    const wrapper = section.querySelector('.band-showcase-wrapper');
    if (!wrapper) return;

    const panels = track.querySelectorAll('.showcase-panel');

    function setupShowcase() {
        // Toggle members background visibility
        const membersBackground = document.querySelector('.members-background');
        if (membersBackground) {
            ScrollTrigger.create({
                trigger: '#members',
                start: 'top bottom',
                end: 'bottom top',
                onEnter: () => membersBackground.classList.add('active'),
                onLeave: () => membersBackground.classList.remove('active'),
                onEnterBack: () => membersBackground.classList.add('active'),
                onLeaveBack: () => membersBackground.classList.remove('active')
            });
        }

        // Calculate total scroll distance
        const scrollAmount = track.scrollWidth - window.innerWidth;

        // ScrollTrigger with pin
        gsap.to(track, {
            x: -scrollAmount,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                pin: wrapper,
                pinSpacing: false,
                invalidateOnRefresh: true,
                id: 'members-horizontal'
            }
        });

        // Set all panels visible
        panels.forEach((panel) => {
            const artist = panel.querySelector('.showcase-artist');
            const info = panel.querySelector('.showcase-member-info');
            if (artist) gsap.set(artist, { opacity: 1, scale: 1 });
            if (info) gsap.set(info, { opacity: 1 });
        });

        // Capture current scroll position before refresh
        const currentScroll = window.scrollY;

        // Refresh and restore scroll position after setup
        requestAnimationFrame(() => {
            ScrollTrigger.refresh(true);
            if (currentScroll > 0) {
                window.scrollTo(0, currentScroll);
            }
        });

        // Handle resize and orientation changes
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 500);
        });
    }

    // Wait for page load and images
    if (document.readyState === 'complete') {
        setTimeout(setupShowcase, 300);
    } else {
        window.addEventListener('load', () => setTimeout(setupShowcase, 300));
    }
})();

// =============================================
// MAP LAZY LOADER - Performance optimization
// =============================================
class MapLazyLoader {
    constructor() {
        this.maps = document.querySelectorAll('.lazy-map');
        this.loadedMaps = new Set();
        this.loadingMaps = new Set();
        this.pendingQueue = [];
        this.observer = null;
        this.maxConcurrentLoads = 2; // Only load 2 maps at a time
        this.init();
    }

    init() {
        if (this.maps.length === 0) return;

        // Add loading placeholders to all map containers
        this.maps.forEach(map => this.addLoadingPlaceholder(map));

        // Check for slow connection - defer loading more aggressively
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.saveData || connection.effectiveType === '2g');

        // Reduce concurrent loads on slow connections
        if (isSlowConnection) {
            this.maxConcurrentLoads = 1;
        }

        if ('IntersectionObserver' in window) {
            const options = {
                root: null, // Use viewport instead of tour-grid for better detection
                rootMargin: isSlowConnection ? '50px' : '150px',
                threshold: 0.01
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.loadedMaps.has(entry.target) && !this.loadingMaps.has(entry.target)) {
                        this.queueMap(entry.target);
                    }
                });
            }, options);

            this.maps.forEach(map => this.observer.observe(map));
        } else {
            // Fallback: staggered loading for browsers without IntersectionObserver
            this.maps.forEach((map, index) => {
                setTimeout(() => this.queueMap(map), index * 800);
            });
        }
    }

    addLoadingPlaceholder(iframe) {
        const container = iframe.closest('.venue-map-container');
        if (!container || container.querySelector('.map-loading-placeholder')) return;

        const placeholder = document.createElement('div');
        placeholder.className = 'map-loading-placeholder';
        placeholder.innerHTML = `
            <div class="map-loading-spinner"></div>
            <span class="map-loading-text">Loading map...</span>
        `;
        container.appendChild(placeholder);
    }

    removeLoadingPlaceholder(iframe) {
        const container = iframe.closest('.venue-map-container');
        if (!container) return;

        const placeholder = container.querySelector('.map-loading-placeholder');
        if (placeholder) {
            placeholder.classList.add('fade-out');
            setTimeout(() => placeholder.remove(), 300);
        }
    }

    queueMap(iframe) {
        if (this.loadedMaps.has(iframe) || this.loadingMaps.has(iframe)) return;

        if (!this.pendingQueue.includes(iframe)) {
            this.pendingQueue.push(iframe);
        }

        this.processQueue();
    }

    processQueue() {
        while (this.loadingMaps.size < this.maxConcurrentLoads && this.pendingQueue.length > 0) {
            const iframe = this.pendingQueue.shift();
            if (iframe && !this.loadedMaps.has(iframe) && !this.loadingMaps.has(iframe)) {
                this.loadMap(iframe);
            }
        }
    }

    loadMap(iframe) {
        if (this.loadedMaps.has(iframe) || this.loadingMaps.has(iframe)) return;

        const src = iframe.dataset.src;
        if (!src) return;

        this.loadingMaps.add(iframe);

        // Set up load handlers before setting src
        const onLoad = () => {
            this.loadingMaps.delete(iframe);
            this.loadedMaps.add(iframe);
            this.removeLoadingPlaceholder(iframe);
            iframe.classList.add('loaded');

            if (this.observer) {
                this.observer.unobserve(iframe);
            }

            // Process next map in queue
            this.processQueue();

            // Clean up listeners
            iframe.removeEventListener('load', onLoad);
            iframe.removeEventListener('error', onError);
        };

        const onError = () => {
            this.loadingMaps.delete(iframe);
            this.removeLoadingPlaceholder(iframe);

            // Add error state to container
            const container = iframe.closest('.venue-map-container');
            if (container) {
                container.classList.add('map-error');
                container.innerHTML = `
                    <div class="map-error-message">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Map unavailable</span>
                    </div>
                `;
            }

            // Process next map in queue
            this.processQueue();

            iframe.removeEventListener('load', onLoad);
            iframe.removeEventListener('error', onError);
        };

        iframe.addEventListener('load', onLoad);
        iframe.addEventListener('error', onError);

        // Use requestIdleCallback for better performance if available
        const loadFn = () => { iframe.src = src; };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadFn, { timeout: 1000 });
        } else {
            setTimeout(loadFn, 0);
        }
    }

    // Called during splash screen to warm up Google Maps connection
    static preconnect() {
        // These are already in HTML, but we can verify they exist
        const preconnectUrls = [
            'https://www.google.com',
            'https://maps.googleapis.com',
            'https://maps.gstatic.com'
        ];

        preconnectUrls.forEach(url => {
            if (!document.querySelector(`link[href="${url}"][rel="preconnect"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = url;
                document.head.appendChild(link);
            }
        });
    }
}

// =============================================
// TOUR CALENDAR FUNCTIONALITY
// =============================================

class TourCalendar {
    constructor() {
        this.currentDate = new Date();
        this.tourDates = [];
        this.calendarView = document.querySelector('.tour-calendar-view');
        this.listView = document.querySelector('.tour-grid');
        this.monthYearElement = document.querySelector('.calendar-month-year');
        this.calendarDaysElement = document.querySelector('.calendar-days');
        this.prevMonthBtn = document.querySelector('.prev-month');
        this.nextMonthBtn = document.querySelector('.next-month');
        this.viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
        this.popup = document.getElementById('calendar-popup');
        this.activeDay = null;
        this.closeTimer = null;

        // Booking modal elements
        this.bookingModal = null;
        this.modalState = {
            currentStep: 1,
            selectedDate: null,
            selectedDuration: null,
            selectedTime: null,
            timeSlots: []
        };

        this.init();
    }

    init() {
        if (!this.calendarView || !this.listView) {
            console.error('Calendar or list view elements not found');
            return;
        }

        // Extract tour dates from the DOM
        this.extractTourDates();

        // Set up event listeners
        this.setupEventListeners();

        // Render initial calendar (but keep it hidden)
        this.renderCalendar();

        // Initialize booking modal
        this.initBookingModal();
    }

    extractTourDates() {
        const tourDateCards = document.querySelectorAll('.tour-date');
        this.tourDates = [];

        tourDateCards.forEach(card => {
            const timeElement = card.querySelector('time');
            const venueElement = card.querySelector('.venue-header h3');
            const venuePromoElement = card.querySelector('.venue-promo');
            const venueDescElement = card.querySelector('.venue-desc');
            const eventTimeElement = card.querySelector('.event-time');
            const eventAgeElement = card.querySelector('.event-age');
            const addressElement = card.querySelector('.venue-address');

            if (timeElement && venueElement) {
                const datetime = timeElement.getAttribute('datetime');
                const venue = venueElement.textContent.trim();
                const venuePromo = venuePromoElement ? venuePromoElement.textContent.trim() : '';
                const venueDesc = venueDescElement ? venueDescElement.textContent.trim() : '';
                const time = eventTimeElement ? eventTimeElement.textContent.trim() : 'TBD';
                const age = eventAgeElement ? eventAgeElement.textContent.trim() : '';
                const address = addressElement ? addressElement.textContent.trim() : '';

                if (datetime) {
                    this.tourDates.push({
                        date: new Date(datetime + 'T00:00:00'),
                        venue: venue,
                        venuePromo: venuePromo,
                        venueDesc: venueDesc,
                        time: time,
                        age: age,
                        address: address,
                        element: card
                    });
                }
            }
        });

        console.log('Extracted tour dates:', this.tourDates);
    }

    setupEventListeners() {
        // View toggle buttons
        this.viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Month navigation
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeMonth(-1);
                this.closePopup();
            });
        }

        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeMonth(1);
                this.closePopup();
            });
        }

        // Close popup when clicking outside calendar days or popup
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.calendar-day') && !e.target.closest('.calendar-event-popup')) {
                this.closePopup();
            }
        });

        // Allow closing popup by clicking on calendar background/grid
        if (this.calendarView) {
            this.calendarView.addEventListener('click', (e) => {
                // Close if clicking on calendar background, but not on days or popup
                if (e.target === this.calendarView ||
                    e.target.classList.contains('calendar-grid') ||
                    e.target.classList.contains('calendar-days') ||
                    e.target.classList.contains('calendar-weekdays')) {
                    this.closePopup();
                }
            });
        }

        // Close popup with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePopup();
            }
        });
    }

    switchView(view) {
        // Update button states
        this.viewToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });

        // Get tour dots element (created by TourAutoScroll)
        const tourDots = document.querySelector('.tour-dots');

        // Show/hide views
        if (view === 'calendar') {
            this.calendarView.style.display = 'block';
            this.listView.style.display = 'none';
            if (tourDots) tourDots.style.display = 'none';
            this.renderCalendar();
        } else {
            this.calendarView.style.display = 'none';
            // Restore list view - remove inline style to use CSS defaults
            this.listView.style.display = '';
            // Restore tour dots visibility (CSS controls actual display based on screen size)
            if (tourDots) tourDots.style.display = '';
        }
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        if (!this.monthYearElement || !this.calendarDaysElement) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.monthYearElement.textContent = `${monthNames[month]} ${year}`;

        // Clear previous days
        this.calendarDaysElement.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElement(day, true);
            this.calendarDaysElement.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);

            const isToday = currentDate.getTime() === today.getTime();
            const events = this.getEventsForDate(currentDate);

            const dayElement = this.createDayElement(day, false, isToday, events, currentDate);
            this.calendarDaysElement.appendChild(dayElement);
        }

        // Add next month's leading days
        const totalCells = this.calendarDaysElement.children.length;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days

        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true);
            this.calendarDaysElement.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth = false, isToday = false, events = [], fullDate = null) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        if (isOtherMonth) {
            dayDiv.classList.add('other-month');
        }

        if (isToday) {
            dayDiv.classList.add('today');
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = fullDate && fullDate < today;

        if (events.length > 0) {
            // Day has existing bookings - NOT available
            dayDiv.classList.add('has-event');
        } else if (!isOtherMonth && !isPast) {
            // Day is available for booking (not other month, not in past, no events)
            dayDiv.classList.add('available-to-book');
        }

        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);

        // Event count and click handler for days WITH events
        if (events.length > 0) {
            const eventCount = document.createElement('div');
            eventCount.className = 'calendar-day-events';
            eventCount.textContent = events.length === 1 ? '1 show' : `${events.length} shows`;
            dayDiv.appendChild(eventCount);

            // Store events data
            dayDiv.dataset.events = JSON.stringify(events);

            // Click/tap to show popup (view only, no booking)
            dayDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPopup(dayDiv, events);
            });

            // Desktop hover to show popup
            dayDiv.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    this.cancelPopupClose();
                    this.showPopup(dayDiv, events);
                }
            });

            // Desktop mouse leave to schedule close
            dayDiv.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    this.schedulePopupClose();
                }
            });
        } else if (!isOtherMonth && !isPast) {
            // Available day - add "Available" label and booking click handler
            const availableLabel = document.createElement('div');
            availableLabel.className = 'calendar-day-available';
            availableLabel.textContent = 'Available';
            dayDiv.appendChild(availableLabel);

            // Store the date for booking
            if (fullDate) {
                dayDiv.dataset.date = fullDate.toISOString();
            }

            // Click to open booking modal
            dayDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openBookingModalForDate(fullDate);
            });
        }

        return dayDiv;
    }

    getEventsForDate(date) {
        return this.tourDates.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === date.getTime();
        });
    }

    showPopup(dayElement, events) {
        if (!this.popup || events.length === 0) return;

        // Clear previous content
        this.popup.innerHTML = '';

        // Build popup content (view only - these dates are already booked)
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'popup-event';

            // Venue name (display only)
            const venue = document.createElement('div');
            venue.className = 'popup-venue';
            venue.textContent = event.venue;
            eventDiv.appendChild(venue);

            // Event time and age on same line
            const timeAge = document.createElement('div');
            timeAge.className = 'popup-time-age';
            timeAge.innerHTML = `<i class="fas fa-clock"></i> ${event.time}`;
            if (event.age) {
                timeAge.innerHTML += ` <span class="popup-age-inline">${event.age}</span>`;
            }
            eventDiv.appendChild(timeAge);

            // Address (compact)
            if (event.address) {
                const address = document.createElement('div');
                address.className = 'popup-address';
                address.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.address}`;
                eventDiv.appendChild(address);
            }

            this.popup.appendChild(eventDiv);
        });

        // Position and show popup
        this.positionAndShowPopup(dayElement);
        this.activeDay = dayElement;

        // Setup popup hover listeners (keep popup open when hovering over it)
        if (!this.popup.hasAttribute('data-listeners-added')) {
            this.popup.addEventListener('mouseenter', () => {
                this.cancelPopupClose();
            });

            this.popup.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    this.schedulePopupClose();
                }
            });

            this.popup.setAttribute('data-listeners-added', 'true');
        }
    }

    positionAndShowPopup(dayElement) {
        const dayRect = dayElement.getBoundingClientRect();
        const padding = 10;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Show popup to measure
        this.popup.style.visibility = 'visible';
        this.popup.style.opacity = '1';

        // Get popup dimensions
        const popupRect = this.popup.getBoundingClientRect();
        const popupWidth = popupRect.width;
        const popupHeight = popupRect.height;

        // Calculate horizontal position (centered on day)
        let left = dayRect.left + (dayRect.width / 2) - (popupWidth / 2);

        // Keep within horizontal bounds
        if (left < padding) {
            left = padding;
        } else if (left + popupWidth > viewportWidth - padding) {
            left = viewportWidth - popupWidth - padding;
        }

        // Calculate vertical position (try above first)
        let top = dayRect.top - popupHeight - padding;

        // If doesn't fit above, position below
        if (top < padding) {
            top = dayRect.bottom + padding;
        }

        // Apply position
        this.popup.style.left = `${Math.max(padding, left)}px`;
        this.popup.style.top = `${Math.max(padding, top)}px`;
    }

    schedulePopupClose() {
        this.cancelPopupClose();
        this.closeTimer = setTimeout(() => {
            this.closePopup();
        }, 200); // Small delay to allow moving to popup
    }

    cancelPopupClose() {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }

    closePopup() {
        if (!this.popup) return;

        this.cancelPopupClose();
        this.popup.style.visibility = 'hidden';
        this.popup.style.opacity = '0';
        this.activeDay = null;
    }

    // =============================================
    // BOOKING MODAL FUNCTIONALITY
    // =============================================

    initBookingModal() {
        this.bookingModal = document.getElementById('tourBookingModal');
        if (!this.bookingModal) return;

        // Cache modal elements
        this.modalElements = {
            backdrop: this.bookingModal.querySelector('.tour-booking-modal-backdrop'),
            closeBtn: this.bookingModal.querySelector('.tour-booking-modal-close'),
            selectedDate: document.getElementById('modalSelectedDate'),
            progressSteps: this.bookingModal.querySelectorAll('.modal-booking-step'),
            step1: document.getElementById('modalStep1'),
            step2: document.getElementById('modalStep2'),
            step3: document.getElementById('modalStep3'),
            successState: document.getElementById('modalSuccessState'),
            durationBtns: this.bookingModal.querySelectorAll('.modal-duration-btn'),
            durationInput: document.getElementById('modalDurationInput'),
            timeslotSection: document.getElementById('modalTimeslotSection'),
            timeslotLoading: document.getElementById('modalTimeslotLoading'),
            timeslotGrid: document.getElementById('modalTimeslotGrid'),
            continueToContactBtn: document.getElementById('modalContinueToContact'),
            backToTimeBtn: document.getElementById('modalBackToTime'),
            continueToDetailsBtn: document.getElementById('modalContinueToDetails'),
            backToContactBtn: document.getElementById('modalBackToContact'),
            submitBtn: document.getElementById('modalSubmit'),
            closeSuccessBtn: document.getElementById('modalClose'),
            // Form inputs
            contactName: document.getElementById('modalContactName'),
            contactPhone: document.getElementById('modalContactPhone'),
            contactEmail: document.getElementById('modalContactEmail'),
            eventType: document.getElementById('modalEventType'),
            venueName: document.getElementById('modalVenueName'),
            venueAddress: document.getElementById('modalVenueAddress'),
            attendance: document.getElementById('modalAttendance'),
            budget: document.getElementById('modalBudget'),
            description: document.getElementById('modalDescription'),
            successDate: document.getElementById('modalSuccessDate')
        };

        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        const { backdrop, closeBtn, durationBtns, durationInput, continueToContactBtn,
                backToTimeBtn, continueToDetailsBtn, backToContactBtn, submitBtn, closeSuccessBtn } = this.modalElements;

        // Close modal
        backdrop?.addEventListener('click', () => this.closeBookingModal());
        closeBtn?.addEventListener('click', () => this.closeBookingModal());
        closeSuccessBtn?.addEventListener('click', () => this.closeBookingModal());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.bookingModal?.classList.contains('active')) {
                this.closeBookingModal();
            }
        });

        // Duration buttons
        durationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const duration = parseFloat(btn.dataset.duration);
                durationBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (durationInput) durationInput.value = '';
                this.handleModalDurationSelect(duration);
            });
        });

        // Duration input
        durationInput?.addEventListener('input', (e) => {
            const duration = parseFloat(e.target.value);
            durationBtns.forEach(b => b.classList.remove('selected'));
            if (duration >= 1 && duration <= 12) {
                this.handleModalDurationSelect(duration);
            } else {
                this.modalState.selectedDuration = null;
                this.modalElements.timeslotSection?.classList.add('hidden');
                this.updateModalContinueButton();
            }
        });

        // Navigation buttons
        continueToContactBtn?.addEventListener('click', () => this.goToModalStep(2));
        backToTimeBtn?.addEventListener('click', () => this.goToModalStep(1));
        continueToDetailsBtn?.addEventListener('click', () => {
            if (this.validateModalContactStep()) {
                this.goToModalStep(3);
            }
        });
        backToContactBtn?.addEventListener('click', () => this.goToModalStep(2));

        // Phone number formatting
        this.modalElements.contactPhone?.addEventListener('input', (e) => {
            e.target.value = this.formatPhoneNumber(e.target.value);
        });

        // Submit button
        submitBtn?.addEventListener('click', () => this.handleModalSubmit());

        // DEBUG: Ctrl+Shift+D to auto-fill modal form - REMOVE FOR PRODUCTION
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D' && this.bookingModal?.classList.contains('active')) {
                e.preventDefault();
                this.debugFillModalForm();
            }
        });
    }

    // DEBUG: Auto-fill modal with test data - REMOVE FOR PRODUCTION
    debugFillModalForm() {
        if (!this.modalElements) return;

        // Set a date if not already set
        if (!this.modalState.selectedDate) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            this.modalState.selectedDate = nextWeek;
            if (this.modalElements.selectedDate) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                this.modalElements.selectedDate.textContent = nextWeek.toLocaleDateString('en-US', options);
            }
        }

        // Select duration (2 hours)
        this.modalState.selectedDuration = 2;
        if (this.modalElements.durationBtns) {
            this.modalElements.durationBtns.forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.duration === '2') btn.classList.add('selected');
            });
        }

        // Generate and select a time slot
        this.modalState.timeSlots = this.generateTimeSlots(2);
        this.modalState.selectedTime = { hour: 19, minute: 0 }; // 7:00 PM
        if (this.modalElements.timeslotSection) this.modalElements.timeslotSection.classList.remove('hidden');
        this.renderModalTimeSlots();
        // Mark the 7 PM slot as selected
        setTimeout(() => {
            const grid = this.modalElements.timeslotGrid;
            if (grid) {
                grid.querySelectorAll('.modal-timeslot-btn').forEach(btn => {
                    if (btn.textContent === '7:00 PM') btn.classList.add('selected');
                });
            }
        }, 50);

        this.updateModalContinueButton();

        // Fill contact info
        if (this.modalElements.contactName) this.modalElements.contactName.value = 'Test User';
        if (this.modalElements.contactPhone) this.modalElements.contactPhone.value = '(555) 123-4567';
        if (this.modalElements.contactEmail) this.modalElements.contactEmail.value = 'test@example.com';

        // Fill event details
        if (this.modalElements.eventType) this.modalElements.eventType.value = 'Private Party';
        if (this.modalElements.venueName) this.modalElements.venueName.value = 'Test Venue';
        if (this.modalElements.venueAddress) this.modalElements.venueAddress.value = '123 Test Street, Fresno, CA 93701';
        if (this.modalElements.attendance) this.modalElements.attendance.value = '100';
        if (this.modalElements.budget) this.modalElements.budget.value = '$1,000 - $2,500';
        if (this.modalElements.description) this.modalElements.description.value = 'This is a test booking for debugging purposes. Please ignore this submission.';

        console.log('🐛 Debug: Modal form auto-filled with test data');
    }
    // END DEBUG

    openBookingModalForDate(date) {
        if (!this.bookingModal || !this.modalElements || !date) return;

        // Close any open popup
        this.closePopup();

        // Reset modal state
        this.resetModalState();

        // Set the selected date
        this.modalState.selectedDate = date;

        // Format and display the date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        if (this.modalElements.selectedDate) {
            this.modalElements.selectedDate.textContent = formattedDate;
        }

        // Show modal
        this.bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first interactive element
        setTimeout(() => {
            if (this.modalElements.durationBtns && this.modalElements.durationBtns[0]) {
                this.modalElements.durationBtns[0].focus();
            }
        }, 100);
    }

    closeBookingModal() {
        if (!this.bookingModal) return;

        this.bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    resetModalState() {
        this.modalState = {
            currentStep: 1,
            selectedDate: null,
            selectedDuration: null,
            selectedTime: null,
            timeSlots: []
        };

        if (!this.modalElements) return;

        // Reset UI
        this.goToModalStep(1);
        if (this.modalElements.durationBtns) {
            this.modalElements.durationBtns.forEach(b => b.classList.remove('selected'));
        }
        if (this.modalElements.durationInput) this.modalElements.durationInput.value = '';
        if (this.modalElements.timeslotSection) this.modalElements.timeslotSection.classList.add('hidden');
        if (this.modalElements.timeslotGrid) this.modalElements.timeslotGrid.innerHTML = '';
        this.updateModalContinueButton();

        // Clear form inputs
        const inputs = ['contactName', 'contactPhone', 'contactEmail', 'eventType',
                        'venueName', 'venueAddress', 'attendance', 'budget', 'description'];
        inputs.forEach(key => {
            if (this.modalElements[key]) this.modalElements[key].value = '';
        });

        // Clear error messages
        if (this.bookingModal) {
            this.bookingModal.querySelectorAll('.modal-error-message').forEach(el => el.textContent = '');
            this.bookingModal.querySelectorAll('.modal-form-input.error').forEach(el => el.classList.remove('error'));
        }

        // Hide success state, show step 1
        if (this.modalElements.successState) this.modalElements.successState.classList.remove('active');
        if (this.modalElements.step1) this.modalElements.step1.classList.add('active');
    }

    handleModalDurationSelect(duration) {
        this.modalState.selectedDuration = duration;
        this.fetchModalTimeSlots();
    }

    async fetchModalTimeSlots() {
        const { selectedDate, selectedDuration } = this.modalState;
        if (!selectedDate || !selectedDuration || !this.modalElements) return;

        // Show timeslot section with loading
        if (this.modalElements.timeslotSection) this.modalElements.timeslotSection.classList.remove('hidden');
        if (this.modalElements.timeslotLoading) {
            this.modalElements.timeslotLoading.classList.remove('hidden');
            this.modalElements.timeslotLoading.textContent = 'Loading available times...';
        }
        if (this.modalElements.timeslotGrid) this.modalElements.timeslotGrid.innerHTML = '';

        try {
            // Format date as YYYY-MM-DD
            const dateStr = selectedDate.toISOString().split('T')[0];

            // Fetch real availability from API
            const response = await fetch(`/api/availability?date=${dateStr}&duration=${selectedDuration}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch availability');
            }

            // Convert API slots to modal format
            this.modalState.timeSlots = data.slots.map(slot => {
                const [hour, minute] = slot.start.split(':').map(Number);
                return {
                    hour,
                    minute,
                    available: slot.available
                };
            });
        } catch (error) {
            console.error('Error fetching availability:', error);
            // Fall back to generating slots locally (all available) if API fails
            this.modalState.timeSlots = this.generateTimeSlots(selectedDuration);
        }

        if (this.modalElements.timeslotLoading) this.modalElements.timeslotLoading.classList.add('hidden');
        this.renderModalTimeSlots();
    }

    generateTimeSlots(duration) {
        // Fallback: generate slots locally (used if API fails)
        const slots = [];
        const startHour = 7; // 7 AM
        const endHour = 24; // 12 AM (midnight)

        for (let hour = startHour; hour <= endHour - duration; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const endTime = hour + duration + (minute / 60);
                if (endTime <= endHour) {
                    slots.push({
                        hour,
                        minute,
                        available: true // Fallback assumes all available
                    });
                }
            }
        }
        return slots;
    }

    renderModalTimeSlots() {
        const grid = this.modalElements.timeslotGrid;
        if (!grid) return;

        grid.innerHTML = '';
        this.modalState.timeSlots.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'modal-timeslot-btn';
            btn.textContent = this.formatTime(slot.hour, slot.minute);
            btn.disabled = !slot.available;

            if (slot.available) {
                btn.addEventListener('click', () => {
                    grid.querySelectorAll('.modal-timeslot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.modalState.selectedTime = { hour: slot.hour, minute: slot.minute };
                    this.updateModalContinueButton();
                });
            }

            grid.appendChild(btn);
        });
    }

    formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    }

    formatPhoneNumber(value) {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            let formatted = '';
            if (match[1]) formatted = `(${match[1]}`;
            if (match[1]?.length === 3) formatted += ') ';
            if (match[2]) formatted += match[2];
            if (match[2]?.length === 3 && match[3]) formatted += '-';
            if (match[3]) formatted += match[3];
            return formatted;
        }
        return value;
    }

    updateModalContinueButton() {
        if (!this.modalElements) return;
        const { selectedDuration, selectedTime } = this.modalState;
        const btn = this.modalElements.continueToContactBtn;
        if (btn) {
            btn.disabled = !(selectedDuration && selectedTime);
        }
    }

    goToModalStep(step) {
        this.modalState.currentStep = step;

        if (!this.modalElements) return;

        // Update progress steps
        if (this.modalElements.progressSteps) {
            this.modalElements.progressSteps.forEach(stepEl => {
                const stepNum = parseInt(stepEl.dataset.step);
                stepEl.classList.toggle('active', stepNum <= step);
            });
        }

        // Show/hide step content
        [this.modalElements.step1, this.modalElements.step2, this.modalElements.step3, this.modalElements.successState]
            .forEach(el => { if (el) el.classList.remove('active'); });

        if (step === 1 && this.modalElements.step1) this.modalElements.step1.classList.add('active');
        else if (step === 2 && this.modalElements.step2) this.modalElements.step2.classList.add('active');
        else if (step === 3 && this.modalElements.step3) this.modalElements.step3.classList.add('active');
    }

    validateModalContactStep() {
        if (!this.modalElements) return false;
        const { contactName, contactPhone, contactEmail } = this.modalElements;
        const name = contactName ? contactName.value.trim() : '';
        const phone = contactPhone ? contactPhone.value.trim() : '';
        const email = contactEmail ? contactEmail.value.trim() : '';

        let isValid = true;

        // Clear previous errors
        this.bookingModal.querySelectorAll('.modal-error-message').forEach(el => el.textContent = '');
        this.bookingModal.querySelectorAll('.modal-form-input.error').forEach(el => el.classList.remove('error'));

        // Name is required
        if (!name && contactName) {
            contactName.classList.add('error');
            const errorEl = contactName.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Name is required';
            isValid = false;
        }

        // At least one contact method required
        if (!phone && !email && contactPhone) {
            const errorEl = contactPhone.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Provide phone or email';
            isValid = false;
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && contactEmail) {
            contactEmail.classList.add('error');
            const errorEl = contactEmail.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Invalid email format';
            isValid = false;
        }

        return isValid;
    }

    validateModalDetailsStep() {
        if (!this.modalElements) return false;
        const { eventType, venueName, venueAddress, description } = this.modalElements;
        let isValid = true;

        // Clear previous errors
        [eventType, venueName, venueAddress, description].forEach(el => {
            if (el) {
                el.classList.remove('error');
                const errorEl = el.parentElement.querySelector('.modal-error-message');
                if (errorEl) errorEl.textContent = '';
            }
        });

        if (eventType && !eventType.value) {
            eventType.classList.add('error');
            const errorEl = eventType.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Event type is required';
            isValid = false;
        }

        if (venueName && !venueName.value.trim()) {
            venueName.classList.add('error');
            const errorEl = venueName.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Venue name is required';
            isValid = false;
        }

        if (venueAddress && (!venueAddress.value.trim() || venueAddress.value.trim().length < 10)) {
            venueAddress.classList.add('error');
            const errorEl = venueAddress.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Enter full venue address';
            isValid = false;
        }

        if (description && (!description.value.trim() || description.value.trim().length < 20)) {
            description.classList.add('error');
            const errorEl = description.parentElement.querySelector('.modal-error-message');
            if (errorEl) errorEl.textContent = 'Provide more event details (20+ chars)';
            isValid = false;
        }

        return isValid;
    }

    async handleModalSubmit() {
        if (!this.validateModalDetailsStep()) return;

        const { submitBtn } = this.modalElements;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        // Build booking data
        const { selectedDate, selectedDuration, selectedTime } = this.modalState;
        // Convert time to 24-hour format (HH:MM) for API compatibility
        const time24h = `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')}`;
        const bookingData = {
            date: selectedDate?.toISOString().split('T')[0],
            duration: selectedDuration,
            time: time24h,
            contactName: this.modalElements.contactName?.value.trim(),
            contactPhone: this.modalElements.contactPhone?.value.trim(),
            contactEmail: this.modalElements.contactEmail?.value.trim(),
            eventType: this.modalElements.eventType?.value,
            venueName: this.modalElements.venueName?.value.trim(),
            venueAddress: this.modalElements.venueAddress?.value.trim(),
            expectedAttendance: this.modalElements.attendance?.value || null,
            budgetRange: this.modalElements.budget?.value || null,
            eventDescription: this.modalElements.description?.value.trim(),
            source: 'tour-calendar'
        };

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 409) {
                    alert('This time slot is no longer available. Please select a different time.');
                } else if (response.status === 400 && result.details) {
                    const errorMessages = Object.values(result.details).join('\n');
                    alert(`Validation error:\n${errorMessages}`);
                } else {
                    alert(result.error || 'Failed to submit booking. Please try again.');
                }
                return;
            }

            this.showModalSuccess();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to submit booking. Please check your connection and try again.');
            return;
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Booking Request';
            }
        }
    }

    showModalSuccess() {
        // Update success message with date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = this.modalState.selectedDate?.toLocaleDateString('en-US', options);
        if (this.modalElements.successDate) {
            this.modalElements.successDate.textContent = formattedDate || 'your selected date';
        }

        // Hide all steps, show success
        [this.modalElements.step1, this.modalElements.step2, this.modalElements.step3]
            .forEach(el => el?.classList.remove('active'));
        this.modalElements.successState?.classList.add('active');

        // Update progress to show all complete
        this.modalElements.progressSteps?.forEach(stepEl => stepEl.classList.add('active'));
    }
}

// Initialize tour calendar
function initTourCalendar() {
    // Wait for tour dates to be loaded
    if (document.querySelectorAll('.tour-date').length > 0) {
        new TourCalendar();
    } else {
        // Retry after a short delay if tour dates aren't loaded yet
        setTimeout(initTourCalendar, 500);
    }
}

// Initialize map lazy loader and tour calendar
function initTourFeatures() {
    // Initialize map lazy loader
    new MapLazyLoader();

    // Initialize tour calendar with a small delay to ensure DOM is ready
    setTimeout(initTourCalendar, 100);
}

// Handle initialization - works whether DOMContentLoaded has fired or not
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTourFeatures);
} else {
    // DOM already loaded, run immediately
    initTourFeatures();
}
