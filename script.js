/**
 * Animated Metrics Landing Page
 * 
 * This script handles the animated counting effect for metric values.
 * Numbers animate when they enter the viewport using Intersection Observer.
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeMetricAnimations();
    // Initialize Auto-Progress Tabs
    initializeAutoTabs();
});

/**
 * Initialize the metric animations using Intersection Observer
 */
function initializeMetricAnimations() {
    const metricElements = document.querySelectorAll('.metric-value');

    // Configure Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateMetric(entry.target);
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all metric elements
    metricElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Animate a single metric value from 0 to its target value
 * @param {HTMLElement} element - The metric value element to animate
 */
function animateMetric(element) {
    const targetValue = parseInt(element.dataset.value, 10);
    const suffix = element.dataset.suffix || '';
    const isLarge = element.dataset.isLarge === 'true';
    const duration = isLarge ? 2000 : 1500; // Longer duration for larger numbers
    const startTime = performance.now();

    // Easing function: easeOutExpo for smooth deceleration
    const easeOutExpo = (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.floor(easedProgress * targetValue);

        // Format number with commas for large values
        const formattedValue = isLarge
            ? currentValue.toLocaleString('en-US')
            : currentValue;

        element.textContent = formattedValue + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            // Ensure final value is exact
            const finalValue = isLarge
                ? targetValue.toLocaleString('en-US')
                : targetValue;
            element.textContent = finalValue + suffix;
            element.classList.remove('animating');
        }
    }

    element.classList.add('animating');
    requestAnimationFrame(updateValue);
}

/**
 * Auto-Progress Tabs Logic
 */
function initializeAutoTabs() {
    const tabs = document.querySelectorAll('.tab-item');
    const contentItems = document.querySelectorAll('.content-item');
    const progressBars = document.querySelectorAll('.progress-bar');

    if (!tabs.length) return;

    let currentTab = 0;
    let startTime = null;
    let isPaused = false;
    let animationFrameId = null;
    const DURATION = 8000; // 8 seconds per tab

    function switchTab(index) {
        // Reset previous tab
        tabs[currentTab].classList.remove('active');
        tabs[currentTab].setAttribute('aria-selected', 'false');
        contentItems[currentTab].classList.remove('active');
        progressBars[currentTab].style.width = '0%';

        // Activate new tab
        currentTab = index;
        tabs[currentTab].classList.add('active');
        tabs[currentTab].setAttribute('aria-selected', 'true');
        contentItems[currentTab].classList.add('active');

        // Reset timing
        startTime = null;
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        if (!isPaused) {
            const elapsed = timestamp - startTime;
            // Calculate progress (0 to 1)
            const progress = Math.min(elapsed / DURATION, 1);

            // Update current tab's progress bar
            // We use requestAnimationFrame so we need to set the width directly
            progressBars[currentTab].style.width = `${progress * 100}%`;

            if (progress >= 1) {
                // Time's up, switch to next tab
                const nextTab = (currentTab + 1) % tabs.length;
                switchTab(nextTab);
                // Reset start time for next tab
                startTime = timestamp;
            }
        } else {
            // If paused, we adjust startTime so when we unpause, 
            // the elapsed time resumes from where it left off
            // effectively "sliding" the start time forward
            const currentProgress = parseFloat(progressBars[currentTab].style.width) / 100;
            startTime = timestamp - (currentProgress * DURATION);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            switchTab(index);
            // Reset progress bar of the clicked tab to 0 immediately
            progressBars[currentTab].style.width = '0%';
            startTime = null;
        });

        // Pause on hover
        tab.addEventListener('mouseenter', () => isPaused = true);
        tab.addEventListener('mouseleave', () => isPaused = false);
    });

    // Also pause if hovering over content
    const contentContainer = document.querySelector('.content-display');
    if (contentContainer) {
        contentContainer.addEventListener('mouseenter', () => isPaused = true);
        contentContainer.addEventListener('mouseleave', () => isPaused = false);
    }

    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);
}
