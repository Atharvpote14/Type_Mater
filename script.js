// Typing Test Data
const testTexts = {
    easy: [
        "The cat sat on the mat. It was a nice day outside.",
        "I like to read books. Books are fun and interesting.",
        "The sun is bright today. It makes me feel happy.",
        "My dog likes to play. We go to the park often.",
        "I eat breakfast every morning. It helps me start the day.",
        "The car is red. It goes very fast down the road.",
        "I love my family. They are kind and helpful to me.",
        "School teaches us many things. Learning is important for everyone.",
        "Food tastes good when you are hungry. I like pizza best.",
        "Friends make life better. Good friends help you when needed."
    ],
    medium: [
        "Customer service is important for any business. Good communication helps build trust and keeps customers happy. Always listen carefully to what people need.",
        "The internet has changed how we work and live. People can now connect with others around the world instantly. This makes communication faster and easier.",
        "Reading books helps you learn new things. Each story teaches something different. Books can take you to places you have never been before.",
        "Music brings people together. It can make you feel happy or sad. Many people enjoy listening to music while they work or relax.",
        "Nature is beautiful and peaceful. Spending time outside can help you feel better. Fresh air and sunshine are good for your health.",
        "Learning new skills takes time and practice. The more you practice, the better you become. Don't give up when things get difficult.",
        "Exercise helps keep your body strong and healthy. Even a short walk each day can make a big difference. Your body will thank you.",
        "Technology makes many tasks easier to complete. Computers and phones help us stay organized. They also help us stay in touch with friends."
    ],
    hard: [
        "The intricate mechanisms of quantum computing represent a paradigm shift in computational methodology, fundamentally altering our understanding of information processing and cryptographic security protocols.",
        "Philosophical discourse surrounding existentialism delves into the profound complexities of human consciousness, exploring the intricate relationship between individual autonomy and societal constructs.",
        "Meteorological phenomena demonstrate the extraordinary complexity of atmospheric dynamics, where subtle variations in temperature and pressure can generate catastrophic weather patterns across vast geographical regions.",
        "Neuroscientific research continues to unravel the enigmatic mysteries of cognitive function, revealing the sophisticated neural networks that govern perception, memory, and decision-making processes.",
        "Literary analysis requires meticulous examination of narrative structure, thematic development, and stylistic techniques employed by authors to convey profound insights into the human condition."
    ]
};

// Game State
let currentText = '';
let currentIndex = 0;
let startTime = null;
let timerInterval = null;
let timeLeft = 60;
let testActive = false;
let errors = 0;
let totalTyped = 0;
let correctTyped = 0;

// DOM Elements
const startTestBtn = document.getElementById('startTestBtn');
const resetBtn = document.getElementById('resetBtn');
const textDisplay = document.getElementById('textDisplay');
const textContent = document.querySelector('.text-content');
const userInput = document.getElementById('userInput');
const difficultySelect = document.getElementById('difficultySelect');
const timeDisplay = document.getElementById('timeDisplay');
const wpmDisplay = document.getElementById('wpmDisplay');
const cpmDisplay = document.getElementById('cpmDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsModal = document.getElementById('resultsModal');
const closeModal = document.getElementById('closeModal');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const shareBtn = document.getElementById('shareBtn');

// Result Elements
const finalWpm = document.getElementById('finalWpm');
const finalCpm = document.getElementById('finalCpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalErrors = document.getElementById('finalErrors');

// Initialize
function init() {
    loadNewText();
    setupEventListeners();
    
    // Enable input field from the start for immediate typing
    userInput.disabled = false;
    userInput.focus();
}

function loadNewText() {
    const difficulty = difficultySelect.value;
    const texts = testTexts[difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    currentText = texts[randomIndex];
    displayText();
    
    // Add fade animation
    textDisplay.style.opacity = '0';
    setTimeout(() => {
        textDisplay.style.transition = 'opacity 0.3s ease';
        textDisplay.style.opacity = '1';
    }, 50);
}

function displayText() {
    textContent.textContent = currentText;
}

function setupEventListeners() {
    // Start test button
    startTestBtn.addEventListener('click', () => {
        startTest();
        smoothScrollToTypingArea();
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetTest);
    
    // Difficulty change
    difficultySelect.addEventListener('change', () => {
        if (!testActive) {
            loadNewText();
            // Add visual feedback
            difficultySelect.style.transform = 'scale(1.05)';
            setTimeout(() => {
                difficultySelect.style.transform = 'scale(1)';
            }, 200);
        }
    });
    
    // Input handling
    userInput.addEventListener('input', handleInput);
    userInput.addEventListener('keydown', handleKeydown);
    userInput.addEventListener('paste', (e) => {
        e.preventDefault();
        showNotification('Pasting is disabled during the test!', 'warning');
    });
    
    // Modal controls
    closeModal.addEventListener('click', closeModalHandler);
    
    // Close modal on outside click
    resultsModal.addEventListener('click', (e) => {
        if (e.target === resultsModal) {
            closeModalHandler();
        }
    });
    
    tryAgainBtn.addEventListener('click', () => {
        resultsModal.classList.remove('show');
        setTimeout(() => {
            resetTest();
            smoothScrollToTypingArea();
        }, 300);
    });
    
    shareBtn.addEventListener('click', shareResults);
    
    // Click to start typing
    textDisplay.addEventListener('click', () => {
        if (!testActive) {
            startTest();
            smoothScrollToTypingArea();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
    
    // Navigation links
    setupNavigation();
    
    // Stats card interactions
    setupStatsInteractions();
    
    // Auto-focus input when test starts
    userInput.addEventListener('focus', () => {
        if (testActive) {
            textDisplay.classList.add('active');
        }
    });
    
    userInput.addEventListener('blur', () => {
        textDisplay.classList.remove('active');
    });
}

function startTest() {
    testActive = true;
    startTime = Date.now();
    timeLeft = 60;
    errors = 0;
    totalTyped = userInput.value.length || 0; // Keep any typed characters
    correctTyped = 0;
    currentIndex = 0;
    
    // Input is already enabled and focused when user starts typing
    // Don't clear the input if user has already started typing
    if (userInput.value.length === 0) {
        userInput.value = '';
    }
    userInput.focus();
    
    // Hide start button
    startTestBtn.style.display = 'none';
    textDisplay.classList.add('active');
    
    // Reset time display color
    timeDisplay.style.color = '';
    timeDisplay.style.animation = '';
    
    // Start timer
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();
        
        // Visual feedback when time is running low
        if (timeLeft <= 10) {
            timeDisplay.style.color = 'var(--error-color)';
            timeDisplay.style.animation = 'pulse 1s infinite';
        }
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
    
    updateStats();
    showNotification('Test started! Good luck! 🚀', 'success');
}

function handleInput() {
    // Auto-start test if user starts typing
    if (!testActive && userInput.value.length > 0) {
        startTest();
        return; // Let the next input event handle the actual typing
    }
    
    if (!testActive) return;
    
    const typedText = userInput.value;
    totalTyped = typedText.length;
    
    // Calculate stats
    let correct = 0;
    let errorCount = 0;
    
    for (let i = 0; i < typedText.length; i++) {
        if (i < currentText.length) {
            if (typedText[i] === currentText[i]) {
                correct++;
            } else {
                errorCount++;
            }
        } else {
            errorCount++;
        }
    }
    
    correctTyped = correct;
    errors = errorCount;
    
    // Check if text is complete
    if (typedText.length >= currentText.length) {
        endTest();
    }
    
    updateStats();
    updateProgress();
    highlightText();
}

function handleKeydown(e) {
    if (e.key === 'Escape') {
        if (testActive) {
            if (confirm('Are you sure you want to reset the test?')) {
                resetTest();
            }
        } else {
            resetTest();
        }
    }
    
    // Prevent backspace from going back in browser
    if (e.key === 'Backspace' && !testActive) {
        e.preventDefault();
    }
    
    // Tab key handling
    if (e.key === 'Tab' && testActive) {
        e.preventDefault();
    }
}

function updateStats() {
    if (!testActive || !startTime) return;
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    
    if (elapsedSeconds > 0) {
        const wpm = Math.round((correctTyped / 5) / elapsedMinutes);
        const cpm = Math.round(correctTyped / elapsedMinutes);
        const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
        
        // Animate number changes
        animateNumber(wpmDisplay, wpm);
        animateNumber(cpmDisplay, cpm);
        animateNumber(accuracyDisplay, accuracy, '%');
        
        // Color coding for accuracy
        if (accuracy >= 95) {
            accuracyDisplay.style.color = 'var(--success-color)';
        } else if (accuracy >= 80) {
            accuracyDisplay.style.color = 'var(--warning-color)';
        } else {
            accuracyDisplay.style.color = 'var(--error-color)';
        }
    }
}

function updateTimeDisplay() {
    timeDisplay.textContent = timeLeft;
    // Add pulse animation
    timeDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        timeDisplay.style.transform = 'scale(1)';
    }, 200);
}

function animateNumber(element, newValue, suffix = '') {
    const oldValue = parseInt(element.textContent) || 0;
    if (oldValue !== newValue) {
        element.style.transform = 'scale(1.2)';
        element.style.color = 'var(--primary-color)';
        setTimeout(() => {
            element.textContent = newValue + suffix;
            element.style.transform = 'scale(1)';
            setTimeout(() => {
                element.style.color = '';
            }, 300);
        }, 150);
    }
}

function updateProgress() {
    const progress = Math.min((totalTyped / currentText.length) * 100, 100);
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
}

function highlightText() {
    const typedText = userInput.value;
    let highlightedHTML = '';
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    for (let i = 0; i < currentText.length; i++) {
        const char = escapeHtml(currentText[i]);
        
        if (i < typedText.length) {
            if (typedText[i] === currentText[i]) {
                highlightedHTML += `<span class="correct">${char}</span>`;
            } else {
                highlightedHTML += `<span class="incorrect">${char}</span>`;
            }
        } else if (i === typedText.length) {
            highlightedHTML += `<span class="current">${char}</span>`;
        } else {
            highlightedHTML += char;
        }
    }
    
    textContent.innerHTML = highlightedHTML;
    
    // Auto-scroll to current character if needed
    const currentSpan = textContent.querySelector('.current');
    if (currentSpan) {
        currentSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function endTest() {
    testActive = false;
    clearInterval(timerInterval);
    userInput.disabled = true;
    textDisplay.classList.remove('active');
    
    // Reset time display color
    timeDisplay.style.color = '';
    timeDisplay.style.animation = '';
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const finalWpmValue = elapsedMinutes > 0 ? Math.round((correctTyped / 5) / elapsedMinutes) : 0;
    const finalCpmValue = elapsedMinutes > 0 ? Math.round(correctTyped / elapsedMinutes) : 0;
    const finalAccuracyValue = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 0;
    
    // Create celebration effect
    createCelebration();
    
    // Update modal with animation
    setTimeout(() => {
        finalWpm.textContent = '0';
        finalCpm.textContent = '0';
        finalAccuracy.textContent = '0%';
        finalErrors.textContent = '0';
        
        // Animate numbers
        animateToValue(finalWpm, finalWpmValue, 1000);
        animateToValue(finalCpm, finalCpmValue, 1000);
        animateToValue(finalAccuracy, finalAccuracyValue, 1000, '%');
        animateToValue(finalErrors, errors, 1000);
        
        resultsModal.classList.add('show');
    }, 500);
    
    // Show congratulatory message
    if (finalWpmValue > 60) {
        showNotification('Excellent typing speed! 🎉', 'success');
    } else if (finalWpmValue > 40) {
        showNotification('Good job! Keep practicing! 💪', 'success');
    } else {
        showNotification('Test completed! Practice makes perfect! 📚', 'info');
    }
}

function animateToValue(element, targetValue, duration, suffix = '') {
    const startValue = parseInt(element.textContent) || 0;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function createCelebration() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4ade80', '#fbbf24'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 20);
    }
}

function resetTest() {
    testActive = false;
    clearInterval(timerInterval);
    
    // Reset state
    timeLeft = 60;
    errors = 0;
    totalTyped = 0;
    correctTyped = 0;
    currentIndex = 0;
    startTime = null;
    
    // Reset UI - enable input for immediate typing
    userInput.value = '';
    userInput.disabled = false; // Enable input for immediate typing
    textDisplay.classList.remove('active');
    
    // Show start button with animation
    startTestBtn.style.display = 'flex';
    startTestBtn.style.opacity = '0';
    startTestBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        startTestBtn.style.opacity = '1';
        startTestBtn.style.transform = 'scale(1)';
    }, 50);
    
    // Reset displays
    timeDisplay.textContent = '60';
    timeDisplay.style.color = '';
    timeDisplay.style.animation = '';
    wpmDisplay.textContent = '0';
    cpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    accuracyDisplay.style.color = '';
    
    // Reset progress with animation
    progressFill.style.transition = 'width 0.5s ease';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Reset text highlight
    textContent.textContent = currentText;
    
    // Hide modal
    resultsModal.classList.remove('show');
    
    // Load new text
    loadNewText();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function shareResults() {
    const wpm = finalWpm.textContent;
    const accuracy = finalAccuracy.textContent;
    
    const shareText = `I just scored ${wpm} WPM with ${accuracy} accuracy on TypeMaster! 🚀 Can you beat my score?`;
    
    if (navigator.share) {
        navigator.share({
            title: 'TypeMaster Results',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showNotification('Results shared! 🎉', 'success');
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Results copied to clipboard! 📋', 'success');
    }).catch(() => {
        showNotification('Failed to copy. Please try again.', 'error');
    });
}

// Additional Interactive Functions
function smoothScrollToTypingArea() {
    const typingArea = document.querySelector('.typing-area');
    if (typingArea) {
        typingArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function handleGlobalKeydown(e) {
    // Ctrl/Cmd + Enter to start test
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!testActive) {
            startTest();
            smoothScrollToTypingArea();
        }
    }
    
    // Space to start (when not in input)
    if (e.key === ' ' && e.target !== userInput && !testActive) {
        e.preventDefault();
        startTest();
        smoothScrollToTypingArea();
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#') {
                // Smooth scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function setupStatsInteractions() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

function animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : type === 'warning' ? '#fbbf24' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function closeModalHandler() {
    resultsModal.classList.remove('show');
}

// Add notification animations to CSS dynamically
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Enhanced Interactive Features

// Initialize the app
init();
