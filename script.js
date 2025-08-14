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
    
    // Vinyl animation
    initVinylAnimation();
    
    // Music player
    initMusicPlayer();
    
    // Waveform canvas
    initWaveform();
    
    // Scroll animations
    initScrollAnimations();
    
    // Smooth scrolling
    initSmoothScrolling();
    
    // Interactive elements
    initInteractiveElements();
    
    // Form interactions
    initFormInteractions();
    
    // Floating visualizer
    initFloatingVisualizer();
});

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

// Hero Animations
function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate title lines
    tl.from('.title-line', {
        y: '100%',
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2
    })
    .from('.hero-subtitle', {
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
    .from('.hero-visual', {
        opacity: 0,
        x: 50,
        duration: 1,
        ease: 'power2.out'
    }, '-=0.8')
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
    initFloatingVisualizer();
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

// Mobile menu toggle (if needed)
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}