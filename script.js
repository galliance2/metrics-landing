/**
 * Animated Metrics Landing Page
 * 
 * This script handles the animated counting effect for metric values.
 * Numbers animate when they enter the viewport using Intersection Observer.
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeMetricAnimations();
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
 * Optional: Re-trigger animations on scroll if needed
 * This can be uncommented to allow re-animation when scrolling back up
 */
/*
function enableReplayOnScroll() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < lastScrollTop && scrollTop === 0) {
            // Scrolled back to top, reinitialize
            initializeMetricAnimations();
        }
        
        lastScrollTop = scrollTop;
    });
}
*/
