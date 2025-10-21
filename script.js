// ========== Configuration ==========
let currentTool = 'corpus';
let darkMode = true;
let chartInstances = {};

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initTheme();
    console.log('LinguaLab Pro loaded successfully!');
});

// ========== Thème ==========
function initTheme() {
    document.body.classList.add('dark-mode');
    darkMode = true;
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = 'fas fa-sun';
    updateParticlesVisibility();
}

function toggleTheme() {
    darkMode = !darkMode;
    const body = document.body;
    
    if (darkMode) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    }
    
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    updateParticlesVisibility();
}

function updateParticlesVisibility() {
    const particles = document.getElementById('particles-container');
    if (particles) particles.style.opacity = darkMode ? '1' : '0';
}

// ========== Particules ==========
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ========== Navigation ==========
function switchTool(toolName) {
    console.log('Switching to:', toolName);
    currentTool = toolName;
    
    document.querySelectorAll('.tool-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const selectedTool = document.getElementById(toolName + '-tool');
    if (selectedTool) {
        selectedTool.classList.add('active');
        console.log('Activated:', toolName);
    }
    
    const navItem = document.querySelector(`.nav-item[data-tool="${toolName}"]`);
    if (navItem) navItem.classList.add('active');
}

// ========== Loading ==========
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.toggle('active', show);
}

// ========== Analyse de Corpus ==========
function analyzeCorpus() {
    console.log('analyzeCorpus called!');
    
    const input = document.getElementById('corpus-input');
    const resultsDiv = document.getElementById('corpus-results');
    
    if (!input || !resultsDiv) {
        console.error('Elements not found!');
        alert('Erreur: Éléments manquants');
        return;
    }
    
    const text = input.value.trim();
    const lang = document.getElementById('corpus-lang').value;
    
    console.log('Text length:', text.length);
    
    if (!text || text.split(/\s+/).length < 10) {
        alert('Veuillez entrer un texte d\'au moins 10 mots.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const analysis = performCorpusAnalysis(text, lang);
            const html = generateCorpusHTML(analysis);
            resultsDiv.innerHTML = html;
            console.log('Analysis complete!');
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">Erreur lors de l\'analyse</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function performCorpusAnalysis(text, lang) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const sentences = text.split(/[.!?؟]+/).filter(s => s.trim());
    const stopWords = getStopWords(lang);
    const frequency = {};
    
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    const sortedWords = Object.entries(frequency)
        .filter(([word]) => !stopWords.has(word) && word.length > 2)
        .sort((a, b) => b[1] - a[1]);
    
    const uniqueWords = new Set(words);
    const hapax = sortedWords.filter(([_, freq]) => freq === 1).length;
    const ttr = ((uniqueWords.size / words.length) * 100).toFixed(2);
    const avgSentenceLength = (words.length / sentences.length).toFixed(2);
    
    return {
        totalWords: words.length,
        uniqueWords: uniqueWords.size,
        sentences: sentences.length,
        ttr: ttr,
        hapax: hapax,
        avgSentenceLength: avgSentenceLength,
        topWords: sortedWords.slice(0, 30)
    };
}

function generateCorpusHTML(analysis) {
    let html = '<h3><i class="fas fa-chart-bar"></i> Statistiques du Corpus</h3>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.totalWords + '</div><div class="stat-label">Tokens totaux</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.uniqueWords + '</div><div class="stat-label">Types (mots uniques)</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.sentences + '</div><div class="stat-label">Phrases</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.ttr + '%</div><div class="stat-label">TTR (Richesse lexicale)</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.hapax + '</div><div class="stat-label">Hapax</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.avgSentenceLength + '</div><div class="stat-label">Mots par phrase</div></div>';
    html += '</div>';
    
    html += '<h3 style="margin-top:30px;"><i class="fas fa-trophy"></i> 30 Mots les Plus Fréquents</h3>';
    html += '<div class="word-cloud">';
    analysis.topWords.forEach(function([word, freq]) {
        const size = 12 + (freq / analysis.topWords[0][1]) * 20;
        html += '<div class="word-item" style="font-size:' + size + 'px" title="Fréquence: ' + freq + '">' + word + '</div>';
    });
    html += '</div>';
    
    return html;
}

function getStopWords(lang) {
    const map = {
        'fr': ['le','la','les','un','une','des','de','du','et','ou','mais','donc','car','ni','or','à','dans','par','pour','en','vers','avec','sans','sous','sur','je','tu','il','elle','nous','vous','ils','elles','ce','cet','cette','ces','mon','ma','mes','est','sont','être','avoir','au','aux','ne','pas','plus','qui','que','dont','où'],
        'en': ['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','have','has','this','that'],
        'ar': ['في','من','إلى','على','عن','هذا','أن','ما','لا'],
        'es': ['el','la','los','las','un','de','y','en','que','es'],
        'it': ['il','lo','la','i','le','un','di','e','che','è']
    };
    return new Set(map[lang] || map['fr']);
}

// Fonctions vides pour éviter les erreurs
function analyzeSemantic() {
    alert('Analyse sémantique - En développement');
}

function generateConcordance() {
    alert('Concordancier KWIC - En développement');
}

function compareTexts() {
    alert('Comparaison - En développement');
}

function visualizeData() {
    alert('Visualisation - En développement');
}

function exportToPDF() {
    alert('Export PDF - En développement');
}

console.log('%cLinguaLab Pro', 'font-size:24px;color:#00f3ff;font-weight:bold;');
console.log('%cDéveloppé par Bettahar Abdelkrim', 'font-size:12px;color:#666;');
