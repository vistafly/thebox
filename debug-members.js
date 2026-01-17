// Debug script for members section vertical shift issue
// Run this in browser console, scroll through members section, then call downloadDebugLog()

window.debugLog = [];
window.debugStartTime = Date.now();

const track = document.querySelector('.band-showcase-track');
const wrapper = document.querySelector('.band-showcase-wrapper');
const lastPanel = document.querySelector('.showcase-panel:last-child');
const lastArtist = lastPanel?.querySelector('.showcase-artist');
const firstPanel = document.querySelector('.showcase-panel:first-child');

function captureState(event = 'manual') {
    const scrollY = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const entry = {
        time: Date.now() - window.debugStartTime,
        event,
        scroll: {
            y: scrollY,
            maxY: docHeight - viewportHeight,
            progress: (scrollY / (docHeight - viewportHeight) * 100).toFixed(2) + '%'
        },
        viewport: {
            width: viewportWidth,
            height: viewportHeight,
            scrollbarVisible: document.documentElement.scrollHeight > window.innerHeight
        }
    };

    if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperStyle = getComputedStyle(wrapper);
        entry.wrapper = {
            top: wrapperRect.top,
            left: wrapperRect.left,
            width: wrapperRect.width,
            height: wrapperRect.height,
            position: wrapperStyle.position,
            transform: wrapperStyle.transform
        };
    }

    if (track) {
        const trackRect = track.getBoundingClientRect();
        const trackStyle = getComputedStyle(track);
        entry.track = {
            top: trackRect.top,
            left: trackRect.left,
            width: trackRect.width,
            transform: trackStyle.transform
        };
    }

    if (lastPanel) {
        const panelRect = lastPanel.getBoundingClientRect();
        entry.lastPanel = {
            top: panelRect.top,
            left: panelRect.left,
            width: panelRect.width,
            height: panelRect.height,
            visible: panelRect.left < viewportWidth && panelRect.right > 0
        };
    }

    if (lastArtist) {
        const artistRect = lastArtist.getBoundingClientRect();
        entry.lastArtist = {
            top: artistRect.top,
            bottom: artistRect.bottom,
            centerY: (artistRect.top + artistRect.bottom) / 2,
            viewportCenterOffset: ((artistRect.top + artistRect.bottom) / 2) - (viewportHeight / 2)
        };
    }

    if (firstPanel) {
        const firstRect = firstPanel.getBoundingClientRect();
        const firstArtist = firstPanel.querySelector('.showcase-artist');
        entry.firstPanel = {
            top: firstRect.top,
            left: firstRect.left
        };
        if (firstArtist) {
            const firstArtistRect = firstArtist.getBoundingClientRect();
            entry.firstArtist = {
                top: firstArtistRect.top,
                centerY: (firstArtistRect.top + firstArtistRect.bottom) / 2,
                viewportCenterOffset: ((firstArtistRect.top + firstArtistRect.bottom) / 2) - (viewportHeight / 2)
            };
        }
    }

    // Check for pin-spacer (GSAP creates this)
    const pinSpacer = document.querySelector('.pin-spacer');
    if (pinSpacer) {
        const spacerRect = pinSpacer.getBoundingClientRect();
        entry.pinSpacer = {
            top: spacerRect.top,
            height: spacerRect.height
        };
    }

    // GSAP ScrollTrigger info if available
    if (window.ScrollTrigger) {
        const triggers = ScrollTrigger.getAll();
        const membersTrigger = triggers.find(t => t.trigger?.id === 'members' || t.pin?.classList?.contains('band-showcase-wrapper'));
        if (membersTrigger) {
            entry.scrollTrigger = {
                progress: membersTrigger.progress,
                isActive: membersTrigger.isActive,
                direction: membersTrigger.direction
            };
        }
    }

    window.debugLog.push(entry);

    // Detect significant Y shifts
    if (window.debugLog.length > 1) {
        const prev = window.debugLog[window.debugLog.length - 2];
        if (prev.lastArtist && entry.lastArtist) {
            const yShift = entry.lastArtist.centerY - prev.lastArtist.centerY;
            if (Math.abs(yShift) > 5) {
                console.warn(`[DEBUG] Vertical shift detected: ${yShift.toFixed(1)}px at scroll ${scrollY}`);
                entry.shiftDetected = yShift;
            }
        }
    }

    return entry;
}

// Capture on scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => captureState('scroll'), 16);
}, { passive: true });

// Capture on resize
window.addEventListener('resize', () => captureState('resize'));

// Initial capture
captureState('init');

// Get CSS info
window.getCSSDebugInfo = function() {
    const html = document.documentElement;
    const htmlStyle = getComputedStyle(html);
    const panel = document.querySelector('.showcase-panel');
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const wrapperEl = document.querySelector('.band-showcase-wrapper');
    const wrapperStyle = wrapperEl ? getComputedStyle(wrapperEl) : null;

    return {
        html: {
            overflowX: htmlStyle.overflowX,
            overflowY: htmlStyle.overflowY,
            scrollbarGutter: htmlStyle.scrollbarGutter
        },
        panel: panelStyle ? {
            width: panelStyle.width,
            height: panelStyle.height,
            display: panelStyle.display,
            alignItems: panelStyle.alignItems,
            justifyContent: panelStyle.justifyContent,
            position: panelStyle.position
        } : null,
        wrapper: wrapperStyle ? {
            position: wrapperStyle.position,
            display: wrapperStyle.display,
            alignItems: wrapperStyle.alignItems,
            height: wrapperStyle.height
        } : null,
        userAgent: navigator.userAgent.substring(0, 100),
        screenWidth: screen.width,
        innerWidth: window.innerWidth
    };
};

// Get debug output - call this and copy from console
window.getDebugOutput = function() {
    const cssInfo = getCSSDebugInfo();
    const shiftsOnly = window.debugLog.filter(e => e.shiftDetected);

    // Get last 5 entries with minimal data
    const last5 = window.debugLog.slice(-5).map(e => ({
        scrollY: e.scroll.y,
        progress: e.scroll.progress,
        wrapperTop: e.wrapper?.top,
        trackTop: e.track?.top,
        lastArtistCenterY: e.lastArtist?.centerY,
        stProgress: e.scrollTrigger?.progress
    }));

    const output = {
        cssInfo,
        totalEntries: window.debugLog.length,
        shiftsDetected: shiftsOnly.length,
        shifts: shiftsOnly.slice(-5).map(e => ({
            scrollY: e.scroll.y,
            shift: Math.round(e.shiftDetected),
            artistY: Math.round(e.lastArtist?.centerY),
            stProgress: e.scrollTrigger?.progress?.toFixed(3)
        })),
        last5
    };

    const json = JSON.stringify(output, null, 2);
    console.log('=== COPY BELOW ===');
    console.log(json);
    console.log('=== COPY ABOVE ===');

    navigator.clipboard?.writeText(json).then(() => console.log('Copied to clipboard!')).catch(() => {});
    return output;
};

// Alias
window.downloadDebugLog = window.getDebugOutput;

console.log('%c[DEBUG ACTIVE]', 'background: #ff0; color: #000; padding: 4px 8px;',
    'Scroll through the members section, especially at first/last member boundaries.',
    'When done, run: downloadDebugLog()');
