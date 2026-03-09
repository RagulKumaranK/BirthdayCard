document.addEventListener('DOMContentLoaded', () => {
    // --- WELCOME SCREEN LOGIC ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeText = document.querySelector('.welcome-text');
    const appContainer = document.getElementById('app-container');

    // Smooth reveal sequence on load
    setTimeout(() => {
        if (welcomeText) welcomeText.style.opacity = '1';
    }, 500);

    setTimeout(() => {
        if (welcomeText) welcomeText.style.opacity = '0';

        setTimeout(() => {
            if (welcomeScreen) welcomeScreen.style.opacity = '0';

            setTimeout(() => {
                if (welcomeScreen) welcomeScreen.style.display = 'none';
                if (appContainer) {
                    appContainer.classList.remove('hidden');
                    // Small delay to allow display:block to apply before changing opacity
                    setTimeout(() => {
                        appContainer.style.opacity = '1';
                    }, 50);
                }

                // Trigger any initial observers that are now visible
                initObservers();
            }, 2000); // 2 seconds for welcome screen to fade out completely
        }, 1500); // wait before fading out welcome background
    }, 4000); // Time to read welcome text


    // --- CANVAS PARTICLE SYSTEM ---
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class HeartParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height; // start below screen or anywhere
            this.size = Math.random() * 2 + 1; // 1 to 3px
            this.speedY = Math.random() * 0.5 + 0.1; // slow rising
            this.speedX = (Math.random() - 0.5) * 0.5; // slight horizontal drift
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = `rgba(255, 117, 143, ${this.opacity})`;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;

            // drift back and forth slightly
            this.x += Math.sin(Date.now() * 0.001 + this.speedY * 10) * 0.2;

            if (this.y < -10) {
                this.y = height + 10;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    class ClickHeartParticle extends HeartParticle {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 2; // slightly larger
            this.speedY = Math.random() * 1.5 + 1; // faster upward movement
            this.speedX = (Math.random() - 0.5) * 1.5; // more spread
            this.opacity = 1;
            this.color = `rgba(255, 77, 109, ${this.opacity})`;
            this.life = 1.0;
            this.decay = Math.random() * 0.015 + 0.01; // fade out speed
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.life -= this.decay;
            this.opacity = Math.max(0, this.life);
            this.color = `rgba(255, 77, 109, ${this.opacity})`;

            // horizontal drift
            this.x += Math.sin(Date.now() * 0.005) * 0.5;
        }

        draw() {
            if (this.opacity <= 0) return;
            super.draw();
        }
    }

    let clickHearts = [];

    // Screen Tap Floating Hearts
    document.addEventListener('click', (e) => {
        // Prevent if clicking inputs or buttons so we don't interfere
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

        for (let i = 0; i < 6; i++) {
            clickHearts.push(new ClickHeartParticle(e.clientX, e.clientY));
        }
    });

    class ConfettiParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 3;
            // Explosive burst pattern
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 15 + 5;
            this.speedX = Math.cos(angle) * velocity;
            this.speedY = Math.sin(angle) * velocity - 5; // extra upward boost
            this.gravity = 0.3;
            this.drag = 0.95;
            this.opacity = 1;

            const colors = ['#ff4d6d', '#ff758f', '#ffb3c6', '#ffffff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // Random rotation
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
        }

        update() {
            this.speedX *= this.drag;
            this.speedY *= this.drag;
            this.speedY += this.gravity;

            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Fade out after falling
            if (this.y > height * 0.5) {
                this.opacity -= 0.01;
            }
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    // Initialize floating hearts
    for (let i = 0; i < 50; i++) {
        // distribute initially
        let p = new HeartParticle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    let confetti = [];

    function triggerConfetti() {
        const centerX = width / 2;
        const centerY = height / 2;
        for (let i = 0; i < 150; i++) {
            confetti.push(new ConfettiParticle(centerX, centerY));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Remove dead confetti
        confetti = confetti.filter(c => c.opacity > 0);
        confetti.forEach(c => {
            c.update();
            c.draw();
        });

        // Update and draw click hearts
        clickHearts = clickHearts.filter(h => h.opacity > 0);
        clickHearts.forEach(h => {
            h.update();
            h.draw();
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- COUNTDOWN LOGIC ---
    // Set to March 30, 2026, 00:00:00 local time
    // For easiest local testing without actually spoofing system time, 
    // let's set it to 10 seconds from "now" if we want to test immediately.
    // However, the prompt specifies EXACTLY March 30, 12:00 AM. 
    // I will write the actual logic and add a small backdoor for the user to test by clicking the title.

    const targetDate = new Date('2026-03-30T00:00:00').getTime();
    let testModeDate = null; // Will be set if backdoor clicked

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const unlockBtn = document.getElementById('unlock-btn');
    const hintText = document.getElementById('unlock-hint-text');
    const titleText = document.querySelector('#countdown-screen .script-title');

    let countdownInterval;

    // Backdoor for testing: clicking the title 5 times quickly sets time to 5 seconds from now





    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const activeTargetDate = testModeDate || targetDate;
        let distance = activeTargetDate - now;

        if (distance <= 0) {
            clearInterval(countdownInterval);
            handleUnlockMoment();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = formatTime(days);
        hoursEl.innerText = formatTime(hours);
        minutesEl.innerText = formatTime(minutes);
        secondsEl.innerText = formatTime(seconds);
    }

    function handleUnlockMoment() {
        // Countdown reached zero
        daysEl.innerText = '00';
        hoursEl.innerText = '00';
        minutesEl.innerText = '00';
        secondsEl.innerText = '00';

        // Animate Button Unlock
        unlockBtn.classList.remove('locked');
        unlockBtn.removeAttribute('disabled');
        unlockBtn.querySelector('.btn-text').innerText = 'Open Your Surprise';

        hintText.style.opacity = '0';
        setTimeout(() => {
            hintText.innerText = 'The wait is over...';
            hintText.style.opacity = '1';
        }, 500);

        // Add a gentle glow to the button
        unlockBtn.style.animation = 'pulse-btn 2s infinite alternate';
    }

    // Initialize
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Button Click Logic
    unlockBtn.addEventListener('click', () => {
        if (!unlockBtn.classList.contains('locked')) {
            startVerification();
        }
    });

    function startVerification() {
        const countdownScreen = document.getElementById('countdown-screen');
        const verificationScreen = document.getElementById('verification-screen');

        // Cinematic transition
        countdownScreen.style.opacity = '0';
        countdownScreen.style.transform = 'scale(0.95)';
        countdownScreen.style.pointerEvents = 'none';

        // Trigger background confetti specifically for this unlock (celebrate the button click!)
        triggerConfetti();

        setTimeout(() => {
            countdownScreen.classList.add('hidden');
            verificationScreen.classList.remove('hidden');

            // Fade in verification screen gracefully
            setTimeout(() => {
                verificationScreen.style.opacity = '1';
                document.getElementById('answer-1').focus();
            }, 50);

        }, 1500); // Wait for fade out
    }

    // --- VERIFICATION LOGIC ---
    const nextBtn = document.getElementById('verify-next-btn');
    const unlockFinalBtn = document.getElementById('verify-unlock-btn');

    nextBtn.addEventListener('click', () => {
        const input1 = document.getElementById('answer-1');
        if (input1.value.trim().length >= 2) {
            // "Correct" Answer - Move to next question
            const q1 = document.getElementById('question-1-container');
            const q2 = document.getElementById('question-2-container');

            q1.classList.remove('active-q');

            setTimeout(() => {
                q1.classList.add('hidden');
                q2.classList.remove('hidden');

                setTimeout(() => {
                    q2.classList.add('active-q');
                    document.getElementById('answer-2').focus();
                }, 50);
            }, 800);

        } else {
            // "Wrong" Answer indication (shake)
            input1.style.animation = 'shake 0.5s ease';
            setTimeout(() => input1.style.animation = '', 500);
        }
    });

    unlockFinalBtn.addEventListener('click', () => {
        const input2 = document.getElementById('answer-2');
        if (input2.value.trim().length >= 2) {
            // "Correct" Answer - Unlock Main Surprise
            startExperience();
        } else {
            // "Wrong" Answer indication
            input2.style.animation = 'shake 0.5s ease';
            setTimeout(() => input2.style.animation = '', 500);
        }
    });

    // Add simple CSS shake animation dynamically for errors
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    function startExperience() {
        const verificationScreen = document.getElementById('verification-screen');
        const mainExperience = document.getElementById('main-experience');

        // Cinematic transition out of verification
        verificationScreen.style.opacity = '0';
        verificationScreen.style.transform = 'scale(0.95)';
        verificationScreen.style.pointerEvents = 'none';

        // Play BGM
        const bgm = document.getElementById('bgm-audio');
        if (bgm) {
            bgm.volume = 0; // Start at 0
            bgm.play().then(() => {
                // Fade in audio
                let vol = 0;
                const fadeAudio = setInterval(() => {
                    if (vol < 0.6) {
                        vol += 0.05;
                        bgm.volume = vol;
                    } else {
                        clearInterval(fadeAudio);
                    }
                }, 200);
            }).catch(e => console.log('Audio autoplay prevented:', e));
        }

        setTimeout(() => {
            verificationScreen.classList.add('hidden');
            mainExperience.classList.remove('hidden');

            // Scroll to top
            window.scrollTo(0, 0);

            // Re-trigger scroll observer here if possible
            initObservers();

            // Trigger IMMEDIATELY on entry
            triggerCinematicReveal();
        }, 1500); // Wait for fade out
    }

    function triggerCinematicReveal() {
        // Step 1: Immediately start photo reveal
        const bgPhoto = document.querySelector('.cinematic-photo');
        if (bgPhoto) bgPhoto.classList.add('reveal-active');

        // Step 2: Simultaneously show title with a bold fade-in
        const title = document.getElementById('hero-title');
        if (title) {
            title.classList.remove('hidden-initially');
            title.style.opacity = '0';
            title.style.transform = 'scale(0.85) translateY(30px)';
            title.style.transition = 'opacity 2s ease-out, transform 2s ease-out';

            // Trigger reflow first
            title.getBoundingClientRect();

            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'scale(1) translateY(0)';
            }, 300); // tiny delay to let CSS settle
        }

        // Step 3: Show the typing message after the title lands
        setTimeout(() => {
            const msgBoxContainer = document.getElementById('hero-message-container');
            if (msgBoxContainer) {
                msgBoxContainer.classList.add('reveal-active');
                if (!msgBoxContainer.classList.contains('typed')) {
                    msgBoxContainer.classList.add('typed');
                    typeMessage();
                }
            }
        }, 2500); // Show message 2.5s after entering
    }

    // --- SCROLL OBSERVER ---
    function initObservers() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');

                    // Special logic for Secret Message Reveal
                    if (entry.target.classList.contains('secret-message-container') && !entry.target.dataset.revealed) {
                        entry.target.dataset.revealed = 'true';

                        setTimeout(() => {
                            const heartfelt = entry.target.querySelector('.secret-heartfelt-text');
                            if (heartfelt) {
                                heartfelt.classList.remove('hidden-initially');
                                heartfelt.style.opacity = '1';
                            }

                            setTimeout(() => {
                                const btn = document.getElementById('final-btn');
                                if (btn) {
                                    btn.classList.remove('hidden-initially');
                                    btn.style.opacity = '1';
                                }
                            }, 2500); // Show button after heart felt message
                        }, 2000); // Delay before showing heartfelt text
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-observe], .experience-section').forEach(el => {
            observer.observe(el);
        });

        // Separate observer for the new cinematic memory-reveal rows
        const memoryRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('in-view')) {
                    entry.target.classList.add('in-view');
                    memoryRevealObserver.unobserve(entry.target); // Only trigger once
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('[data-memory-reveal]').forEach(el => {
            memoryRevealObserver.observe(el);
        });
    }

    // --- TYPING MESSAGE ---
    // Use a real array of lines — much simpler and bug-free
    const loveMessageLines = [
        " ",
        " ",
        "My love Every moment with you feels like a dream I never want to wake up from You have brought so much light, so much joy, and so much beauty into my life I created this just for you, because you deserve the world.",
        "Happy Birthday. ❤️"
    ];

    function typeMessage() {
        const msgBox = document.getElementById('love-message-box');
        msgBox.innerHTML = '';

        let lineIndex = 0;
        let charIndex = 0;

        function typeChar() {
            if (lineIndex >= loveMessageLines.length) {
                msgBox.classList.add('typing-done');
                return;
            }

            const currentLine = loveMessageLines[lineIndex];

            if (charIndex < currentLine.length) {
                msgBox.innerHTML += currentLine.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 40); // Typing speed
            } else {
                // End of current line → add a line break and move to next line
                msgBox.innerHTML += '<br><br>';
                lineIndex++;
                charIndex = 0;
                setTimeout(typeChar, 400); // Pause between lines
            }
        }

        setTimeout(typeChar, 1000); // Delay before typing starts
    }

    // --- FINAL SURPRISE ---
    const finalBtn = document.getElementById('final-btn');
    const finalReveal = document.getElementById('final-reveal-content');

    finalBtn.addEventListener('click', () => {
        finalBtn.style.opacity = '0';
        finalBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            finalBtn.classList.add('hidden');
            finalReveal.classList.remove('hidden');

            // Add more hearts for final scene
            for (let i = 0; i < 100; i++) {
                let p = new HeartParticle();
                p.y = height + Math.random() * height; // spread them out below
                p.speedY = Math.random() * 2 + 1; // faster
                p.size = Math.random() * 4 + 2; // bigger
                particles.push(p);
            }

            // Darken background deeply
            document.body.style.background = '#000000';
            document.body.style.backgroundColor = '#000000';

            const glow = document.querySelector('.ambient-glow');
            if (glow) glow.style.opacity = '0';

            const stars = document.querySelector('.stars-container');
            if (stars) stars.style.opacity = '0';

        }, 1000);
    });

    // --- GALLERY: Duplicate cards for seamless infinite scroll ---
    function initGalleryCarousel() {
        const carousel = document.getElementById('gallery-carousel');
        if (!carousel) return;

        // Clone all existing cards and append them so the loop is seamless
        const cards = Array.from(carousel.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            carousel.appendChild(clone);
        });
    }
    initGalleryCarousel();

});

// --- LIGHTBOX FUNCTIONS (global so onclick works) ---
function openLightbox(card) {
    const img = card.querySelector('.gallery-img');
    const caption = card.dataset.caption || '';

    if (!img || img.style.display === 'none') return; // Don't open if only placeholder

    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCaption = document.getElementById('lightbox-caption');

    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = caption;

    lightbox.style.display = 'flex';
    // Force reflow so transition runs
    lightbox.getBoundingClientRect();
    lightbox.style.opacity = '1';
    lightbox.classList.add('active');

    // Stop carousel when lightbox is open
    const carousel = document.getElementById('gallery-carousel');
    if (carousel) carousel.style.animationPlayState = 'paused';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.opacity = '0';

    setTimeout(() => {
        lightbox.classList.remove('active');
        lightbox.style.display = 'none';

        // Resume carousel
        const carousel = document.getElementById('gallery-carousel');
        if (carousel) carousel.style.animationPlayState = 'running';
    }, 400);
}

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});
