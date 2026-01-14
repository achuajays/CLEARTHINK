/**
 * CLEARTHINK - Frontend Application v2.0
 * Features: Dark mode, Copy/Export, History, Streaming, Keyboard shortcuts
 */

// ============================================
// DOM Elements
// ============================================
const decisionInput = document.getElementById('decision-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const useCasesSection = document.getElementById('use-cases');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const showHistoryLink = document.getElementById('show-history-link');
const loadingSection = document.getElementById('loading-section');
const loadingAgent = document.getElementById('loading-agent');
const loadingHint = document.getElementById('loading-hint');
const progressFill = document.getElementById('progress-fill');
const resultsSection = document.getElementById('results-section');
const agentResults = document.getElementById('agent-results');
const newAnalysisBtn = document.getElementById('new-analysis-btn');
const themeToggle = document.getElementById('theme-toggle');
const exportMdBtn = document.getElementById('export-md-btn');
const copyAllBtn = document.getElementById('copy-all-btn');
const followupInput = document.getElementById('followup-input');
const followupBtn = document.getElementById('followup-btn');
const toastContainer = document.getElementById('toast-container');

// ============================================
// State
// ============================================
let currentResults = null;
let currentDecision = '';

// Agent info for display
const agentInfo = {
    'Problem Framing': {
        hint: 'Clarifying your decision into a clear problem statement...',
        description: 'Transforms messy input into structured problem definition',
        step: 1
    },
    'Option Generator': {
        hint: 'Generating realistic options with honest trade-offs...',
        description: 'Creates actionable options with pros and cons',
        step: 2
    },
    'Assumption Detector': {
        hint: 'Finding hidden assumptions in your thinking...',
        description: 'Identifies facts, beliefs, and fears affecting your decision',
        step: 3
    },
    'Second-Order Thinking': {
        hint: 'Exploring what happens next in each scenario...',
        description: 'Analyzes consequences of success and failure',
        step: 4
    },
    'Bias Detection': {
        hint: 'Checking for cognitive biases...',
        description: 'Detects and gently explains thinking biases',
        step: 5
    },
    'Decision Summary': {
        hint: 'Synthesizing everything into clear guidance...',
        description: 'Final recommendation with confidence level and next steps',
        step: 6
    }
};

// ============================================
// Theme Management
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('clearthink-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('clearthink-theme', newTheme);
    showToast(`${newTheme === 'dark' ? '🌙' : '☀️'} Switched to ${newTheme} mode`, 'success');
}

themeToggle.addEventListener('click', toggleTheme);

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// History Management
// ============================================
function getHistory() {
    const history = localStorage.getItem('clearthink-history');
    return history ? JSON.parse(history) : [];
}

function saveToHistory(decision, results) {
    const history = getHistory();
    const entry = {
        id: Date.now(),
        decision: decision.substring(0, 100),
        timestamp: new Date().toISOString(),
        results: results
    };
    history.unshift(entry);
    // Keep only last 10
    if (history.length > 10) history.pop();
    localStorage.setItem('clearthink-history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
    }

    historyList.innerHTML = history.map(entry => `
        <div class="history-item" data-id="${entry.id}">
            ${entry.decision}${entry.decision.length >= 100 ? '...' : ''}
        </div>
    `).join('');

    // Add click handlers
    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const entry = history.find(h => h.id === id);
            if (entry && entry.results) {
                currentDecision = entry.decision;
                currentResults = entry.results;
                displayResults(entry.results);
                historySection.classList.add('hidden');
                useCasesSection.classList.add('hidden');
            }
        });
    });
}

function clearHistory() {
    localStorage.removeItem('clearthink-history');
    historySection.classList.add('hidden');
    showToast('History cleared', 'success');
}

clearHistoryBtn?.addEventListener('click', clearHistory);

showHistoryLink?.addEventListener('click', (e) => {
    e.preventDefault();
    const history = getHistory();
    if (history.length > 0) {
        historySection.classList.toggle('hidden');
        renderHistory();
    } else {
        showToast('No history yet', 'success');
    }
});

// ============================================
// Character Count
// ============================================
decisionInput.addEventListener('input', () => {
    charCount.textContent = decisionInput.value.length;
});

// ============================================
// Use Case Click Handlers
// ============================================
document.querySelectorAll('.use-case-item').forEach(item => {
    item.addEventListener('click', () => {
        const example = item.dataset.example;
        decisionInput.value = example;
        charCount.textContent = example.length;
        decisionInput.focus();
    });
});

// ============================================
// Keyboard Shortcuts
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to analyze
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!analyzeBtn.disabled) {
            startAnalysis();
        }
    }

    // Escape to reset
    if (e.key === 'Escape') {
        if (!resultsSection.classList.contains('hidden')) {
            resetToHome();
        }
    }
});

// ============================================
// Main Analysis Function
// ============================================
analyzeBtn.addEventListener('click', startAnalysis);

async function startAnalysis() {
    const decision = decisionInput.value.trim();

    if (!decision) {
        shakeElement(decisionInput);
        return;
    }

    currentDecision = decision;

    // Hide use cases, show loading
    useCasesSection.classList.add('hidden');
    historySection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    analyzeBtn.disabled = true;

    // Reset agent steps
    document.querySelectorAll('.agent-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

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
        currentResults = results;
        saveToHistory(decision, results);
        displayResults(results);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    } finally {
        loadingSection.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
}

// ============================================
// Progress Animation
// ============================================
let progressInterval;

function startProgress() {
    let progress = 0;
    const agents = Object.keys(agentInfo);
    let agentIndex = 0;

    progressInterval = setInterval(() => {
        progress += 1.5;
        if (progress > 95) progress = 95;

        progressFill.style.width = `${progress}%`;

        // Update agent steps
        const currentStep = Math.floor(progress / 16) + 1;
        document.querySelectorAll('.agent-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum < currentStep) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            }
        });

        // Cycle through agents during loading
        if (progress % 16 < 1.5 && agentIndex < agents.length) {
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
        document.querySelectorAll('.agent-step').forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
    }
}

// ============================================
// Display Results
// ============================================
function displayResults(results) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    agentResults.innerHTML = '';

    results.agents.forEach((agent, index) => {
        const card = createAgentCard(agent, index);
        agentResults.appendChild(card);
    });
}

// ============================================
// Create Agent Card
// ============================================
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
            <div class="agent-actions">
                <button class="copy-btn" data-agent="${agent.agent}" title="Copy this section">📋</button>
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
    header.addEventListener('click', (e) => {
        if (!e.target.closest('.copy-btn')) {
            card.classList.toggle('expanded');
        }
    });

    // Copy button
    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(agent.result, copyBtn);
    });

    return card;
}

// ============================================
// Copy & Export Functions
// ============================================
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.textContent = '✓';
        showToast('Copied to clipboard!', 'success');
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = '📋';
        }, 2000);
    }).catch(err => {
        showToast('Failed to copy', 'error');
    });
}

copyAllBtn?.addEventListener('click', () => {
    if (!currentResults) return;

    const markdown = generateMarkdown(currentResults);
    navigator.clipboard.writeText(markdown).then(() => {
        showToast('All results copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
});

exportMdBtn?.addEventListener('click', () => {
    if (!currentResults) return;

    const markdown = generateMarkdown(currentResults);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearthink-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported as Markdown!', 'success');
});

function generateMarkdown(results) {
    let md = `# CLEARTHINK Analysis\n\n`;
    md += `**Decision:** ${currentDecision}\n\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;

    results.agents.forEach(agent => {
        md += `## ${agent.emoji} ${agent.agent}\n\n`;
        md += `${agent.result}\n\n`;
        md += `---\n\n`;
    });

    return md;
}

// ============================================
// Follow-up Questions (placeholder for future API)
// ============================================
followupBtn?.addEventListener('click', () => {
    const question = followupInput?.value.trim();
    if (!question) {
        shakeElement(followupInput);
        return;
    }

    // For now, show a toast - can be connected to actual API later
    showToast('Follow-up questions coming soon!', 'success');
    followupInput.value = '';
});

// ============================================
// New Analysis / Reset
// ============================================
newAnalysisBtn.addEventListener('click', resetToHome);

function resetToHome() {
    resultsSection.classList.add('hidden');
    useCasesSection.classList.remove('hidden');
    decisionInput.value = '';
    charCount.textContent = '0';
    agentResults.innerHTML = '';
    currentResults = null;
    currentDecision = '';
    decisionInput.focus();
}

// ============================================
// Markdown Formatting
// ============================================
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
        // Bullet lists
        .replace(/^- (.*$)/gm, '• $1')
        // Line breaks
        .replace(/\n/g, '<br>');
}

// ============================================
// Animations & Error Handling
// ============================================
function shakeElement(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function showError(message) {
    loadingSection.classList.add('hidden');
    useCasesSection.classList.remove('hidden');
    showToast(message, 'error');
}

// ============================================
// Progress Observer
// ============================================
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

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderHistory();
    decisionInput.focus();
});
