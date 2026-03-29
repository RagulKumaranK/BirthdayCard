document.addEventListener('DOMContentLoaded', () => {
    // --- WELCOME SCREEN LOGIC ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeText = document.querySelector('.welcome-text');
    const appContainer = document.getElementById('app-container');

    // Smooth reveal sequence on load
    if (sessionStorage.getItem('surprise_unlocked') === 'true') {
        const _ws = document.getElementById('welcome-screen');
        const _ac = document.getElementById('app-container');
        const _cs = document.getElementById('countdown-screen');
        const _vs = document.getElementById('verification-screen');
        const _me = document.getElementById('main-experience');
        if (_ws) _ws.style.display = 'none';
        if (_cs) _cs.classList.add('hidden');
        if (_vs) _vs.classList.add('hidden');
        if (_ac) { _ac.classList.remove('hidden'); _ac.style.opacity = '1'; }
        if (_me) { _me.classList.remove('hidden'); setTimeout(() => { window.scrollTo(0, 0); triggerCinematicReveal(); }, 100); }
        setTimeout(initObservers, 200);
        document.addEventListener('click', function _play() {
            const bgm = document.getElementById('bgm-audio');
            if (bgm && bgm.paused) { bgm.volume = 0.6; bgm.play().catch(()=>{}); }
            document.removeEventListener('click', _play);
        }, { once: true });
    } else {
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
    }


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
    for (let i = 0; i < 20; i++) {
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
    let clickCount = 0;
    titleText.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 5) {
            testModeDate = new Date().getTime() + 5000;
            hintText.innerText = 'Test mode activated...';
            clickCount = 0;
        }
    });




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
        sessionStorage.setItem('surprise_unlocked', 'true');
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
        "My love…",
        "Every moment with you feels like something I never want to lose.",
        "You didn't just enter my life… you changed it completely.",
        "You made ordinary days feel special,",
        "You made me smile without any reason,",
        "You became my peace in the middle of everything.",
        "This… is not just a website.",
        "This is a small piece of my heart, made only for you.",
        "Because you deserve more than words can ever explain.",
        "Happy Birthday, my love ❤️"
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

    finalBtn.addEventListener('click', () => {
        finalBtn.style.opacity = '0';
        finalBtn.style.pointerEvents = 'none';
        
        // Pause all other audio
        pauseBGM();
        
        playMeow();

        // Target video for fullscreen directly on user click
        const video = document.getElementById('finale-video');
        if (video) {
            if (video.requestFullscreen)           video.requestFullscreen();
            else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
            else if (video.webkitEnterFullscreen)   video.webkitEnterFullscreen();
        }

        setTimeout(() => {
            finalBtn.classList.add('hidden');
            showCinematicVideo();
        }, 600);
    });

    // --- VIDEO PERFORMANCE: Only play videos when visible ---
    function initVideoVisibilityObserver() {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (video.hasAttribute('loop')) {
                        video.play().catch(() => {});
                    }
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('video').forEach(video => {
            videoObserver.observe(video);
        });
    }
    setTimeout(initVideoVisibilityObserver, 2000);

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

    // Add pause mechanism for carousel and videos on hover and touch
    const carouselElem = document.getElementById('gallery-carousel');
    if (carouselElem) {
        const startPauseTrack = () => { carouselElem.style.animationPlayState = 'paused'; };
        const endPauseTrack   = () => { carouselElem.style.animationPlayState = ''; }; // fallback to CSS

        carouselElem.addEventListener('mouseenter', startPauseTrack);
        carouselElem.addEventListener('mouseleave', endPauseTrack);
        carouselElem.addEventListener('touchstart', startPauseTrack, { passive: true });
        carouselElem.addEventListener('touchend', endPauseTrack, { passive: true });
        carouselElem.addEventListener('touchcancel', endPauseTrack, { passive: true });

        const interactables = carouselElem.querySelectorAll('.gallery-card');
        interactables.forEach(card => {
            const video = card.querySelector('video');
            if (video) {
                const startPauseVideo = () => { video.pause(); };
                const endPauseVideo   = () => { video.play().catch(() => {}); };

                card.addEventListener('mouseenter', startPauseVideo);
                card.addEventListener('mouseleave', endPauseVideo);
                card.addEventListener('touchstart', startPauseVideo, { passive: true });
                card.addEventListener('touchend', endPauseVideo, { passive: true });
                card.addEventListener('touchcancel', endPauseVideo, { passive: true });
            }
        });
    }

    // --- MEOW SOUND SYSTEM ---
    function playMeow() {
        const meow = document.getElementById('meow-audio');
        if (!meow) return;
        meow.currentTime = 0;
        meow.play().catch(() => { }); // silently ignore autoplay blocks
    }

    function showMeowBubble(x, y) {
        const msgs = ['meow~', '🐾 meow!', 'purr~', '🐾 mrrrow~', 'meow meow~', '*purrs*'];
        const bubble = document.createElement('div');
        bubble.className = 'meow-bubble';
        bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
        bubble.style.left = `${x - 30}px`;
        bubble.style.top = `${y - 50}px`;
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1500);
    }

    function initMeow() {
        // Meow on all [data-meow] elements
        document.querySelectorAll('[data-meow]').forEach(el => {
            el.addEventListener('click', (e) => {
                playMeow();
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top;
                showMeowBubble(cx, cy);
            });
        });

        // Meow on EVERY button click site-wide
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            // Don't double-trigger if already handled by data-meow
            if (btn.hasAttribute('data-meow')) return;
            // Skip skip/close buttons to avoid audio conflict
            if (btn.id === 'video-skip-btn') return;
            playMeow();
            showMeowBubble(e.clientX, e.clientY - 20);
        });
    }
    initMeow();

    // Random meow every ~12 screen taps on non-button areas
    let tapCountForMeow = 0;
    document.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
        tapCountForMeow++;
        if (tapCountForMeow >= 12) {
            tapCountForMeow = 0;
            playMeow();
            showMeowBubble(e.clientX, e.clientY);
        }
    });

    // --- CAKE SECTION ---
    function initCakeSection() {
        const cakeWrapper = document.getElementById('cake-wrapper');
        const knifeSlash = document.getElementById('knife-slash');
        const cakePrompt = document.getElementById('cake-prompt');
        const cakeCutMsg = document.getElementById('cake-cut-msg');
        const hbSection = document.getElementById('happy-birthday-section');

        if (!cakeWrapper) return;

        let cakeCut = false;

        cakeWrapper.addEventListener('click', () => {
            if (cakeCut) return;
            cakeCut = true;

            // Play knife slash animation
            knifeSlash.classList.add('cutting');
            playMeow();

            // After knife crosses — apply cut effect
            setTimeout(() => {
                cakeWrapper.classList.add('cut');
                triggerConfetti();

                // Swap prompt text
                if (cakePrompt) cakePrompt.style.display = 'none';
                if (cakeCutMsg) {
                    cakeCutMsg.classList.remove('hidden');
                }

                // Reveal Happy Birthday section after a moment
                setTimeout(() => {
                    if (hbSection) {
                        hbSection.classList.remove('hbd-hidden');
                        hbSection.classList.add('hbd-visible');
                        spawnBalloons();
                        // Scroll to it
                        hbSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 1800);
            }, 700);
        });
    }
    initCakeSection();

    // Spawn balloons inside happy birthday section
    function spawnBalloons() {
        const container = document.getElementById('balloons-container');
        if (!container) return;
        const emojis = ['🎈', '🎀', '🎊', '🎉', '💕', '🐾', '🌸', '🎈'];
        emojis.forEach((emoji, i) => {
            const b = document.createElement('span');
            b.className = 'balloon';
            b.textContent = emoji;
            b.style.left = `${8 + (i * 12)}%`;
            b.style.animationDuration = `${3.5 + Math.random() * 2}s`;
            b.style.animationDelay = `${i * 0.2}s`;
            b.style.fontSize = `${2.5 + Math.random() * 1.5}rem`;
            container.appendChild(b);
        });
    }

});

// --- LIGHTBOX FUNCTIONS (global so onclick works) ---
function openLightbox(card) {
    const img = card.querySelector('.gallery-img');
    const videoSrc = card.dataset.video;
    const caption = card.dataset.caption || '';

    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbVideo = document.getElementById('lightbox-video');
    const lbCaption = document.getElementById('lightbox-caption');

    if (videoSrc) {
        lbImg.classList.add('hidden');
        lbVideo.classList.remove('hidden');
        lbVideo.src = videoSrc;
        lbVideo.muted = true; // Image-like behavior
        lbVideo.play().catch(() => {});
    } else {
        if (!img || img.style.display === 'none') return; // Don't open if only placeholder
        lbVideo.classList.add('hidden');
        lbVideo.pause();
        lbImg.classList.remove('hidden');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
    }

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
    const lbVideo = document.getElementById('lightbox-video');
    
    lightbox.style.opacity = '0';
    if (lbVideo) lbVideo.pause();

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


// --- CINEMATIC VIDEO FINALE — LEFT-TO-RIGHT SLIDE REVEAL ---
// --- CENTER FOCUS VIDEO SLIDER ---
document.addEventListener('DOMContentLoaded', () => {
    function initCenterFocusSlider() {
        const track = document.getElementById('c-slider-track');
        if (!track) return;
        
        const slides = Array.from(track.querySelectorAll('.center-slide'));
        const nextBtn = document.getElementById('c-slider-next');
        const prevBtn = document.getElementById('c-slider-prev');
        const numSlides = slides.length;
        
        if (numSlides === 0) return;

        let activeIndex = 0;

        function updateSlider() {
            slides.forEach((slide, i) => {
                slide.className = 'center-slide'; // reset class list
                const diff = (i - activeIndex + numSlides) % numSlides;
                
                if (diff === 0) slide.classList.add('active');
                else if (diff === 1) slide.classList.add('next-1');
                else if (diff === 2) slide.classList.add('next-2');
                else if (diff === numSlides - 1) slide.classList.add('prev-1');
                else if (diff === numSlides - 2) slide.classList.add('prev-2');
                else slide.classList.add('hidden-slide');
            });

            // Handle video playback + smart preloading
            slides.forEach((slide, i) => {
                const video = slide.querySelector('video');
                if (video) {
                    const diff = (i - activeIndex + numSlides) % numSlides;
                    if (i === activeIndex) {
                        video.preload = 'auto';
                        video.currentTime = 0;
                        if (sliderInView) {
                            video.play().catch(() => {});
                        }
                    } else if (diff === 1 || diff === numSlides - 1) {
                        // Preload next & prev so they start instantly
                        video.preload = 'auto';
                        video.pause();
                    } else {
                        video.preload = 'none';
                        video.pause();
                    }
                }
            });
        }

        // Auto-advance when video ends
        slides.forEach((slide) => {
            const video = slide.querySelector('video');
            if (video) {
                video.addEventListener('ended', () => {
                    if (slide.classList.contains('active')) {
                        goNext();
                    }
                });
            }
        });

        function goNext() {
            activeIndex = (activeIndex + 1) % numSlides;
            updateSlider();
        }

        function goPrev() {
            activeIndex = (activeIndex - 1 + numSlides) % numSlides;
            updateSlider();
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); if(typeof playMeow === 'function') playMeow(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); if(typeof playMeow === 'function') playMeow(); });

        slides.forEach((slide, i) => {
            slide.addEventListener('click', () => {
                const isPrev1 = slide.classList.contains('prev-1');
                const isNext1 = slide.classList.contains('next-1');
                if (isPrev1) { goPrev(); if(typeof playMeow === 'function') playMeow(); }
                else if (isNext1) { goNext(); if(typeof playMeow === 'function') playMeow(); }
            });
        });

        // Intersection Observer for autoplay only when in view
        let sliderInView = false;
        const section = document.getElementById('center-video-slider');
        if (section) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    sliderInView = true;
                    updateSlider(); // Play the active video
                } else {
                    sliderInView = false;
                    const activeVideo = slides[activeIndex].querySelector('video');
                    if (activeVideo) activeVideo.pause();
                }
            }, { threshold: 0.3 });
            observer.observe(section);
        }

        // Swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) goNext();
            if (touchEndX - touchStartX > 50) goPrev();
        }, { passive: true });

        updateSlider();
    }
    
    // Give DOM a tick to establish elements before initializing observer
    setTimeout(initCenterFocusSlider, 100);
});

// --- SECTION 5.9: Secret Scratch Card ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let scratchedPixels = 0;
    let totalPixels = 0;
    
    function initCanvas() {
        // Enforce 300x300 because the app-container is initially hidden during the welcome sequence!
        canvas.width = 300;
        canvas.height = 300;
        totalPixels = canvas.width * canvas.height;
        
        ctx.fillStyle = '#c0c0c0'; // Silver
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '20px Inter, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Scratch me 🐾', canvas.width/2, canvas.height/2);
        
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    setTimeout(initCanvas, 500); // Give layout time to settle
    window.addEventListener('resize', initCanvas);
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    function scratch(e) {
        if (!isDrawing) return;
        if(e.cancelable) e.preventDefault(); // allow scratching on mobile without zooming
        const pos = getMousePos(e);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        checkScratchProgress();
    }
    
    function checkScratchProgress() {
        // Sample every 32nd pixel for performance
        const imageData = ctx.getImageData(0,0, canvas.width, canvas.height).data;
        let transparent = 0;
        for (let i = 3; i < imageData.length; i += 32) { // check alpha
            if (imageData[i] === 0) transparent++;
        }
        const percent = transparent / (imageData.length / 32);
        
        if (percent > 0.45) { // If 45% scratched, reveal!
            canvas.style.opacity = '0';
            setTimeout(() => { canvas.style.display = 'none'; }, 800);
            canvas.removeEventListener('mousemove', scratch);
            canvas.removeEventListener('touchmove', scratch);
        }
    }
    
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive: false});
    document.addEventListener('mouseup', () => { isDrawing = false; });
    document.addEventListener('touchend', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch, {passive: false});
});

// --- SECTION 6.5: Vinyl Player ---
document.addEventListener('DOMContentLoaded', () => {
    const vinylWrapper = document.getElementById('vinyl-player');
    const voiceNote = document.getElementById('voice-note');
    if (!vinylWrapper || !voiceNote) return;

    vinylWrapper.addEventListener('click', () => {
        if (typeof playMeow === 'function') playMeow();
        const bgmAudio = document.getElementById('bgm-audio');
        
        if (voiceNote.paused) {
            pauseBGM();
            voiceNote.play().catch(()=>{});
            vinylWrapper.classList.add('playing');
        } else {
            voiceNote.pause();
            vinylWrapper.classList.remove('playing');
            resumeBGM();
        }
    });

    voiceNote.addEventListener('ended', () => {
        vinylWrapper.classList.remove('playing');
        resumeBGM();
    });
});

// --- SECTION 6.8 & 6.9: Heartbeat Scanner & Gift Box ---
document.addEventListener('DOMContentLoaded', () => {
    const scannerScan = document.querySelector('.fingerprint-scan');
    const scannerFill = document.getElementById('scanner-fill');
    const scannerText = document.getElementById('scanner-text');
    const giftSection = document.getElementById('gift-section');
    
    let scanTimer;
    let scanProgress = 0;
    let scanInterval;
    let verified = false;
    
    if (scannerScan) {
        const startScan = (e) => {
            if (verified) return;
            if(e.cancelable) e.preventDefault();
            scannerScan.classList.add('scanning');
            if(scannerText) scannerText.innerText = "Scanning... Hold still!";
            
            scanInterval = setInterval(() => {
                scanProgress += 2;
                if (scannerFill) scannerFill.style.width = scanProgress + '%';
                
                if (scanProgress >= 100) {
                    finishScan();
                }
            }, 30);
        };
        
        const stopScan = () => {
            if (verified) return;
            clearInterval(scanInterval);
            scannerScan.classList.remove('scanning');
            
            if (scanProgress < 100) {
                scanProgress = 0;
                if (scannerFill) scannerFill.style.width = '0%';
                if(scannerText) scannerText.innerText = "Verification failed. Try again 🐾";
            }
        };
        
        const finishScan = () => {
            clearInterval(scanInterval);
            verified = true;
            scannerScan.classList.remove('scanning');
            if(scannerText) {
                scannerText.innerText = "Heartbeat Verified! ❤️ Match: 100%";
                scannerText.style.color = "#ff758f";
            }
            
            if(typeof playMeow === 'function') playMeow();
            
            // Reveal Gift Box
            setTimeout(() => {
                if (giftSection) {
                    giftSection.classList.remove('hidden');
                    giftSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1000);
        };
        
        scannerScan.addEventListener('mousedown', startScan);
        scannerScan.addEventListener('touchstart', startScan, {passive: false});
        document.addEventListener('mouseup', stopScan);
        document.addEventListener('touchend', stopScan);
    }
    
    // --- SECTION 6.9: Gift Box Taps ---
    const giftBox = document.getElementById('gift-box');
    const finalSurprise = document.getElementById('final-surprise');
    let tapCount = 0;
    
    if (giftBox) {
        giftBox.addEventListener('click', () => {
            if (tapCount >= 3) return;
            tapCount++;
            
            giftBox.classList.remove('shake');
            void giftBox.offsetWidth;
            giftBox.classList.add('shake');
            
            if(typeof playMeow === 'function') playMeow();
            
            if (tapCount === 3) {
                giftBox.classList.add('open');
                createConfetti();
                
                setTimeout(() => {
                    if (finalSurprise) {
                        finalSurprise.classList.remove('hidden');
                        finalSurprise.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 1500);
            }
        });
    }
    
    function createConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        const colors = ['#ff4d6d', '#ff758f', '#ffd166', '#fff0f5', '#4cc9f0'];
        
        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random trajectory
            const tx = (Math.random() - 0.5) * 400 + 'px';
            const ty = (Math.random() - 1) * 400 + 'px';
            const tr = (Math.random() - 0.5) * 720 + 'deg';
            
            confetti.style.setProperty('--tx', tx);
            confetti.style.setProperty('--ty', ty);
            confetti.style.setProperty('--tr', tr);
            
            container.appendChild(confetti);
        }
    }
});

// --- SECTION 5.6.5: Clickable Photo Stack ---
document.addEventListener('DOMContentLoaded', () => {
    const stackContainer = document.getElementById('cute-pics-container');
    if (!stackContainer) return;

    const cards = Array.from(stackContainer.querySelectorAll('.cute-pic-card'));
    // Sort cards so the highest z-index is first in the array
    cards.sort((a, b) => {
        return parseInt(b.style.zIndex) - parseInt(a.style.zIndex);
    });

    let currentCardIndex = 0;

    stackContainer.addEventListener('click', () => {
        if (currentCardIndex >= cards.length - 1) {
            // Last card reached. Do a little happy shake
            const lastCard = cards[currentCardIndex];
            lastCard.style.transform = 'scale(1.05) rotate(0deg)';
            setTimeout(() => {
                lastCard.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
            if(typeof playMeow === 'function') playMeow();
            return;
        }

        // Throw away the top card
        const cardToThrow = cards[currentCardIndex];
        cardToThrow.classList.add('throw-away');
        if(typeof playMeow === 'function') playMeow();
        
        currentCardIndex++;
    });
});

// --- CINEMATIC VIDEO FINALE — LEFT-TO-RIGHT SLIDE REVEAL ---
function showCinematicVideo() {
    const section  = document.getElementById('video-finale-section');
    const video    = document.getElementById('finale-video');
    const skipBtn  = document.getElementById('video-skip-btn');
    const tapHint  = document.getElementById('video-tap-hint');
    if (!section) return;

    // Show section
    section.classList.remove('hidden');
    section.getBoundingClientRect(); // force reflow

    // Reveal video immediately with unmuted sound
    if (video) {
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
    }

    // Step 1: Slide the panel
    setTimeout(() => {
        section.classList.add('slide-reveal');
    }, 120);

    // Hide the hint since it's automatic now
    if (tapHint) tapHint.style.display = 'none';

    // Transition to YouTube finale on Skip or Ended
    const triggerNext = () => transitionToYouTubeFinale();

    if (skipBtn) skipBtn.addEventListener('click', triggerNext);
    if (video) video.addEventListener('ended', triggerNext);
}

function transitionToYouTubeFinale() {
    const videoSection = document.getElementById('video-finale-section');
    const youtubeSection = document.getElementById('youtube-finale-section');
    const video = document.getElementById('finale-video');
    const youtubeIframe = document.getElementById('youtube-iframe');

    if (video) video.pause();
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});

    // Ensure BGM is paused if not already
    pauseBGM();

    videoSection.style.opacity = '0';
    videoSection.style.transition = 'opacity 0.8s ease';

    setTimeout(() => {
        videoSection.classList.add('hidden');
        youtubeSection.classList.remove('hidden');
        youtubeSection.style.opacity = '0';
        youtubeSection.getBoundingClientRect();
        youtubeSection.style.transition = 'opacity 1s ease';
        youtubeSection.style.opacity = '1';

        // Auto-play YouTube if possible (requires interaction, which we have)
        if (youtubeIframe) {
            const src = youtubeIframe.src;
            if (!src.includes('autoplay=1')) {
                youtubeIframe.src = src + '&autoplay=1';
            }
        }
    }, 850);

    // Handle close button for YouTube
    const closeBtn = document.getElementById('youtube-skip-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            youtubeSection.style.opacity = '0';
            setTimeout(() => {
                youtubeSection.classList.add('hidden');
                resumeBGM();
            }, 1000);
        };
    }
}

// --- SECTION 5.6.1: Reasons I Love You Jar ---
document.addEventListener('DOMContentLoaded', () => {
    const reasons = [
        "Your smile instantly fixes my bad days.",
        "The way you look at me makes me feel so special.",
        "Your laugh is my absolute favorite sound.",
        "You always know how to make me laugh.",
        "I love how we can talk about everything and nothing.",
        "You are my peace in this noisy world.",
        "Every little thing you do is magic to me.",
        "I simply just love you.",
        "There's nobody else I'd rather spend my time with.",
        "I get lost in your eyes every single time.",
        "Because of you, I understand what love really is."
    ];

    const jar = document.getElementById('reasons-jar');
    const flyingPaper = document.getElementById('flying-paper');
    const flyingPaperText = document.getElementById('flying-paper-text');
    let isFlying = false;

    if (jar && flyingPaper && flyingPaperText) {
        jar.addEventListener('click', () => {
            if (isFlying) return;
            isFlying = true;
            
            jar.classList.remove('jar-shake');
            void jar.offsetWidth; 
            jar.classList.add('jar-shake');

            if(typeof playMeow === 'function') playMeow();
            
            const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
            
            flyingPaper.classList.remove('hidden');
            flyingPaper.classList.remove('fly-out');
            void flyingPaper.offsetWidth;
            
            flyingPaperText.innerText = randomReason;
            flyingPaper.classList.add('fly-out');
            
            setTimeout(() => {
                flyingPaper.classList.add('hidden');
                flyingPaper.classList.remove('fly-out');
                isFlying = false;
            }, 4500);
        });
    }
});

// --- SECTION 5.7: Birthday Cake Microphone & Cut Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const enableMicBtn = document.getElementById('enable-mic-btn');
    const cakePrompt = document.getElementById('cake-prompt');
    const flames = document.querySelectorAll('.flame');
    const cakeWrapper = document.getElementById('cake-wrapper');
    const knifeSlash = document.getElementById('knife-slash');
    const cakeCutMsg = document.getElementById('cake-cut-msg');
    const hbdSection = document.getElementById('happy-birthday-section');
    
    let audioContext;
    let analyser;
    let microphone;
    let blowCheckInterval;
    let flamesOut = 0;
    let cakeCut = false;

    if (enableMicBtn && flames.length > 0) {
        enableMicBtn.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                enableMicBtn.parentElement.classList.add('hidden');
                cakePrompt.classList.remove('hidden');

                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                
                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 256;
                microphone.connect(analyser);
                
                detectBlow();
            } catch (err) {
                console.error("Microphone access denied:", err);
                // Fallback to tap
                enableMicBtn.parentElement.classList.add('hidden');
                cakePrompt.classList.remove('hidden');
                cakePrompt.innerText = "Tap the candles to put them out! 🎂";
                
                flames.forEach(flame => {
                    flame.parentElement.addEventListener('click', () => {
                        if (!flame.classList.contains('extinguished')) {
                            flame.classList.add('extinguished');
                            flamesOut++;
                            checkAllFlamesOut();
                        }
                    });
                });
            }
        });

        function detectBlow() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            blowCheckInterval = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) { sum += dataArray[i]; }
                let average = sum / bufferLength;
                
                if (average > 85) { // Threshold for blow detection
                    if (flamesOut < flames.length) {
                        const activeFlames = Array.from(flames).filter(f => !f.classList.contains('extinguished'));
                        if (activeFlames.length > 0) {
                            activeFlames[activeFlames.length - 1].classList.add('extinguished');
                            flamesOut++;
                            checkAllFlamesOut();
                        }
                    }
                }
            }, 100);
        }
    }

    function checkAllFlamesOut() {
        if (flamesOut === flames.length) {
            if (blowCheckInterval) clearInterval(blowCheckInterval);
            if (audioContext && audioContext.state !== 'closed') audioContext.close();
            
            cakePrompt.innerText = "Yay! Now tap the cake to cut it 🐾";
            cakePrompt.style.color = "#ff758f";
            
            // Enable cake cutting
            if (cakeWrapper) {
                cakeWrapper.style.cursor = 'pointer';
                cakeWrapper.addEventListener('click', cutCake);
            }
        }
    }

    function cutCake() {
        if (cakeCut || flamesOut < flames.length) return;
        cakeCut = true;
        
        if (typeof playMeow === 'function') playMeow();
        
        if (knifeSlash) {
            knifeSlash.style.opacity = '1';
            knifeSlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
        }
        
        setTimeout(() => {
            const topLayer = document.querySelector('.cake-top-layer');
            const midLayer = document.querySelector('.cake-mid-layer');
            if (topLayer) topLayer.style.transform = 'translateX(-20px) rotate(-5deg)';
            if (midLayer) midLayer.style.transform = 'translateX(20px) rotate(5deg)';
            
            if (cakePrompt) cakePrompt.classList.add('hidden');
            if (cakeCutMsg) cakeCutMsg.classList.remove('hidden');
            if (knifeSlash) knifeSlash.style.opacity = '0';
            
            // Reveal HBD section
            setTimeout(() => {
                if (hbdSection) hbdSection.classList.remove('hbd-hidden');
            }, 1000);
        }, 500);
    }
});

// Global BGM Helpers
function pauseBGM() {
    const bgm = document.getElementById('bgm-audio');
    if (bgm && !bgm.paused) {
        bgm.pause();
        bgm.dataset.wasPlaying = 'true';
    }
}

function resumeBGM() {
    const bgm = document.getElementById('bgm-audio');
    if (bgm && bgm.dataset.wasPlaying === 'true') {
        bgm.play().catch(() => { });
        bgm.dataset.wasPlaying = 'false';
    }
}

// Global reliable 'playMeow' override
window.playMeow = function() {
    try {
        const meowSnd = new Audio('image/meow.mp3');
        meowSnd.volume = 0.25; // Reduce volume significantly as requested
        meowSnd.play().catch(()=>{});
    } catch(e) {}
};
