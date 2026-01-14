/**
 * CLEARTHINK - Frontend Application
 */

// DOM Elements
const decisionInput = document.getElementById('decision-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const useCasesSection = document.getElementById('use-cases');
const loadingSection = document.getElementById('loading-section');
const loadingAgent = document.getElementById('loading-agent');
const loadingHint = document.getElementById('loading-hint');
const progressFill = document.getElementById('progress-fill');
const resultsSection = document.getElementById('results-section');
const agentResults = document.getElementById('agent-results');
const newAnalysisBtn = document.getElementById('new-analysis-btn');

// Agent info for display
const agentInfo = {
    'Problem Framing': {
        hint: 'Clarifying your decision into a clear problem statement...',
        description: 'Transforms messy input into structured problem definition'
    },
    'Option Generator': {
        hint: 'Generating realistic options with honest trade-offs...',
        description: 'Creates actionable options with pros and cons'
    },
    'Assumption Detector': {
        hint: 'Finding hidden assumptions in your thinking...',
        description: 'Identifies facts, beliefs, and fears affecting your decision'
    },
    'Second-Order Thinking': {
        hint: 'Exploring what happens next in each scenario...',
        description: 'Analyzes consequences of success and failure'
    },
    'Bias Detection': {
        hint: 'Checking for cognitive biases...',
        description: 'Detects and gently explains thinking biases'
    },
    'Decision Summary': {
        hint: 'Synthesizing everything into clear guidance...',
        description: 'Final recommendation with confidence level and next steps'
    }
};

// Character count update
decisionInput.addEventListener('input', () => {
    charCount.textContent = decisionInput.value.length;
});

// Use case click handlers
document.querySelectorAll('.use-case-item').forEach(item => {
    item.addEventListener('click', () => {
        const example = item.dataset.example;
        decisionInput.value = example;
        charCount.textContent = example.length;
        decisionInput.focus();
    });
});

// Analyze button click
analyzeBtn.addEventListener('click', startAnalysis);

// New analysis button
newAnalysisBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    useCasesSection.classList.remove('hidden');
    decisionInput.value = '';
    charCount.textContent = '0';
    agentResults.innerHTML = '';
    decisionInput.focus();
});

// Main analysis function
async function startAnalysis() {
    const decision = decisionInput.value.trim();

    if (!decision) {
        shakeElement(decisionInput);
        return;
    }

    // Hide use cases, show loading
    useCasesSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    analyzeBtn.disabled = true;

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ decision }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }

        const results = await response.json();
        displayResults(results);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    } finally {
        loadingSection.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
}

// Simulate progress during analysis
let progressInterval;

function startProgress() {
    let progress = 0;
    const agents = Object.keys(agentInfo);
    let agentIndex = 0;

    progressInterval = setInterval(() => {
        progress += 2;
        if (progress > 95) progress = 95;

        progressFill.style.width = `${progress}%`;

        // Cycle through agents during loading
        if (progress % 15 === 0 && agentIndex < agents.length) {
            const agent = agents[agentIndex];
            loadingAgent.textContent = `🧠 ${agent}`;
            loadingHint.textContent = agentInfo[agent].hint;
            agentIndex++;
        }
    }, 200);
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
    }
}

// Display results
function displayResults(results) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    agentResults.innerHTML = '';

    results.agents.forEach((agent, index) => {
        const card = createAgentCard(agent, index);
        agentResults.appendChild(card);
    });
}

// Create agent result card
function createAgentCard(agent, index) {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.agent = agent.agent;

    // Auto-expand the last card (Decision Summary)
    if (index === 5) {
        card.classList.add('expanded');
    }

    const info = agentInfo[agent.agent] || { description: '' };

    card.innerHTML = `
        <div class="agent-header">
            <div class="agent-emoji">${agent.emoji}</div>
            <div class="agent-info">
                <div class="agent-name">${agent.agent}</div>
                <div class="agent-status">${info.description}</div>
            </div>
            <div class="agent-toggle">▼</div>
        </div>
        <div class="agent-content">
            <div class="agent-body">
                <div class="agent-result">${formatMarkdown(agent.result)}</div>
            </div>
        </div>
    `;

    // Toggle expand/collapse
    const header = card.querySelector('.agent-header');
    header.addEventListener('click', () => {
        card.classList.toggle('expanded');
    });

    return card;
}

// Simple markdown formatting
function formatMarkdown(text) {
    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

// Shake animation for invalid input
function shakeElement(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'shake 0.5s ease';

    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Add shake animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Show error message
function showError(message) {
    loadingSection.classList.add('hidden');

    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #C62828;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
        useCasesSection.classList.remove('hidden');
    }, 4000);
}

// Slide down animation for errors
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(errorStyle);

// Start progress simulation when loading
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'loading-section') {
            if (!mutation.target.classList.contains('hidden')) {
                startProgress();
            } else {
                stopProgress();
            }
        }
    });
});

observer.observe(loadingSection, { attributes: true, attributeFilter: ['class'] });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    decisionInput.focus();
});
