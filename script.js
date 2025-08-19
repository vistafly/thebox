// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

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
    const heroSection = document.getElementById('hero');
    const logo = document.querySelector('.logo-desktop');
    
    if (!heroSection || !logo) return;

    // Check if user already scrolled past hero
    const isHeroPassed = localStorage.getItem('heroPassed') === 'true';
    if (isHeroPassed) {
        document.body.classList.add('hero-passed');
    }

    // Track scroll position
    let lastScrollY = window.scrollY;
    
    // More reliable scroll handler - adjusted to hide later
    function checkScroll() {
        const currentScroll = window.scrollY;
        
        // Hide logo if scrolled more than 150px down (increased from 20px)
        const shouldHide = currentScroll > 150;
        
        document.body.classList.toggle('hero-passed', shouldHide);
        localStorage.setItem('heroPassed', shouldHide ? 'true' : 'false');
        
        lastScrollY = currentScroll;
    }

    // Throttle scroll events for better performance
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

    // Use both scroll event and IntersectionObserver
    window.addEventListener('scroll', throttle(checkScroll, 50));
    
    // Adjusted IntersectionObserver to trigger later
    const observer = new IntersectionObserver((entries) => {
        const heroEntry = entries[0];
        // Changed to 0.7 (from 0.9) to trigger later
        const isVisible = heroEntry.intersectionRatio > 0.7;
        document.body.classList.toggle('hero-passed', !isVisible);
    }, {
        threshold: 0.7, // Changed from 0.9 to trigger later
        rootMargin: '-100px 0px 0px 0px' // Increased from -20px
    });

    observer.observe(heroSection);
    
    // Initial check
    checkScroll();
});


function initLogo3DEffect() {
    const logo = document.querySelector('.logo-desktop');
    if (!logo) return;

    // Configuration
    const config = {
        maxRotation: 20,
        perspective: 1000,
        movementFactor: 0.03,
        smoothness: 0.5,
        floatAmplitude: 10,
        floatSpeed: 0.0015
    };

    // State
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let floatOffset = 0;
    let lastTime = 0;

    // Mouse move handler
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Calculate target rotations
    function calculateTargetRotations() {
        const normalizedX = (mouseX / window.innerWidth) * 2 - 1;
        const normalizedY = (mouseY / window.innerHeight) * 2 - 1;
        
        targetRotationY = normalizedX * config.maxRotation;
        targetRotationX = -normalizedY * config.maxRotation;
    }

    // Animation loop
    function animate(time) {
        if (!lastTime) lastTime = time;
        const deltaTime = time - lastTime;
        lastTime = time;

        // Skip animation if logo is hidden
        if (document.body.classList.contains('hero-passed')) {
            logo.style.transform = '';
            requestAnimationFrame(animate);
            return;
        }

        floatOffset = Math.sin(time * config.floatSpeed) * config.floatAmplitude;
        currentRotationX += (targetRotationX - currentRotationX) * config.smoothness;
        currentRotationY += (targetRotationY - currentRotationY) * config.smoothness;

        logo.style.transform = `
            perspective(${config.perspective}px)
            translate(-50%, -50%)
            translateY(${floatOffset}px)
            rotateX(${currentRotationX}deg)
            rotateY(${currentRotationY}deg)
        `;
        
        requestAnimationFrame(animate);
    }

    // Initialize
    document.addEventListener('mousemove', handleMouseMove);
    setInterval(calculateTargetRotations, 16);
    requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
    });
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

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    const scrollThreshold = 10; // Increased threshold for better UX
    const mobileBreakpoint = 768;
    
    function handleScroll() {
        if (window.innerWidth > mobileBreakpoint) {
            header.classList.remove('header--hidden', 'header--revealed');
            return;
        }
        
        const currentScroll = window.pageYOffset;
        
        // Skip minimal scroll movements
        if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;
        
        if (currentScroll > lastScroll && currentScroll > 50) {
            // Scrolling DOWN
            header.classList.add('header--hidden');
            header.classList.remove('header--revealed');
        } else {
            // Scrolling UP or at top
            header.classList.remove('header--hidden');
            if (currentScroll > 10) {
                header.classList.add('header--revealed');
            } else {
                header.classList.remove('header--revealed');
            }
        }
        
        lastScroll = currentScroll;
    }
    
    // Debounced resize handler
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > mobileBreakpoint) {
                header.classList.remove('header--hidden', 'header--revealed');
            }
        }, 100);
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
});

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
        }
    });
}

// Hero Animations
function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate title lines
    tl.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.5')
    .from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.3')
    .from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.3')
    .from('.scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.3');
    
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
document.addEventListener('DOMContentLoaded', function() {
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
});

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
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power2.out'
        });
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMusicPlayer();
    initScrollAnimations();
});
    
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
    
    // CTA button
    gsap.from('.cta-button', {
        scrollTrigger: {
            trigger: '.cta-button',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    });


// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: target,
                        offsetY: 100
                    },
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

   // Tour Date Highlighting Functions (UNCHANGED)
function highlightUpcomingDates() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
        
        // Create dots container
        this.createDots();
        
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

    // Close menu when clicking on links (mobile only)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
                // INSTANTLY restore scroll position for link clicks too
                document.body.style.top = '';
                document.documentElement.style.scrollBehavior = 'auto';
                window.scrollTo(0, scrollPosition);
                setTimeout(() => {
                    document.documentElement.style.scrollBehavior = '';
                }, 0);
            }
        });
    });
});