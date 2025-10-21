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

// ========== Analyse Sémantique ==========
function analyzeSemantic() {
    const text = document.getElementById('semantic-input').value.trim();
    const type = document.getElementById('semantic-type').value;
    const resultsDiv = document.getElementById('semantic-results');
    
    if (!text) {
        alert('Veuillez entrer un texte à analyser.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const analysis = performSemanticAnalysis(text, type);
            const html = displaySemanticResults(analysis, type);
            resultsDiv.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">Erreur lors de l\'analyse</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function performSemanticAnalysis(text, type) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    
    if (type === 'sentiment') return analyzeSentiment(text, words);
    else if (type === 'entities') return extractEntities(text);
    else if (type === 'themes') return extractThemes(words);
    else if (type === 'collocations') return extractCollocations(words);
}

function analyzeSentiment(text, words) {
    const positiveWords = ['bon', 'bien', 'excellent', 'magnifique', 'merveilleux', 'parfait', 'génial', 'formidable', 'agréable', 'superbe', 'remarquable', 'extraordinaire', 'fantastique', 'splendide'];
    const negativeWords = ['mauvais', 'mal', 'horrible', 'terrible', 'nul', 'pire', 'médiocre', 'désagréable', 'catastrophique', 'affreux', 'détestable', 'lamentable'];
    
    const posCount = words.filter(w => positiveWords.includes(w)).length;
    const negCount = words.filter(w => negativeWords.includes(w)).length;
    
    let sentiment = 'Neutre 😐';
    if (posCount > negCount) sentiment = 'Positif 😊';
    else if (negCount > posCount) sentiment = 'Négatif 😔';
    
    return { 
        sentiment: sentiment, 
        positive: posCount, 
        negative: negCount, 
        score: ((posCount - negCount) / words.length * 100).toFixed(2) 
    };
}

function extractEntities(text) {
    const entities = text.match(/\b[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*/g) || [];
    const uniqueEntities = [...new Set(entities)];
    const entityFreq = {};
    entities.forEach(e => entityFreq[e] = (entityFreq[e] || 0) + 1);
    return { entities: uniqueEntities, frequency: entityFreq };
}

function extractThemes(words) {
    const stopWords = getStopWords('fr');
    const contentWords = words.filter(w => !stopWords.has(w) && w.length > 3);
    const frequency = {};
    contentWords.forEach(w => frequency[w] = (frequency[w] || 0) + 1);
    const themes = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 20);
    return { themes: themes };
}

function extractCollocations(words) {
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length > 2 && words[i + 1].length > 2) {
            bigrams.push(words[i] + ' ' + words[i + 1]);
        }
    }
    const bigramFreq = {};
    bigrams.forEach(bg => bigramFreq[bg] = (bigramFreq[bg] || 0) + 1);
    const collocations = Object.entries(bigramFreq).filter(([_, f]) => f > 1).sort((a, b) => b[1] - a[1]).slice(0, 25);
    return { collocations: collocations };
}

function displaySemanticResults(analysis, type) {
    let html = '<h3><i class="fas fa-brain"></i> Résultats de l\'Analyse Sémantique</h3>';
    
    if (type === 'sentiment') {
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-value">' + analysis.sentiment + '</div><div class="stat-label">Sentiment</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + analysis.positive + '</div><div class="stat-label">Mots positifs</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + analysis.negative + '</div><div class="stat-label">Mots négatifs</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + analysis.score + '</div><div class="stat-label">Score</div></div>';
        html += '</div>';
    } else if (type === 'entities') {
        html += '<h3 style="margin-top:20px;"><i class="fas fa-user"></i> Entités nommées (' + analysis.entities.length + ')</h3>';
        html += '<div class="word-cloud">';
        analysis.entities.slice(0, 40).forEach(e => html += '<div class="word-item">' + e + '</div>');
        html += '</div>';
    } else if (type === 'themes') {
        html += '<h3 style="margin-top:20px;"><i class="fas fa-hashtag"></i> Thèmes principaux</h3>';
        html += '<div class="word-cloud">';
        analysis.themes.forEach(function([t, f]) {
            const size = 12 + (f / analysis.themes[0][1] * 20);
            html += '<div class="word-item" style="font-size:' + size + 'px">' + t + '</div>';
        });
        html += '</div>';
    } else if (type === 'collocations') {
        html += '<h3 style="margin-top:20px;"><i class="fas fa-link"></i> Collocations</h3>';
        html += '<div class="word-cloud">';
        analysis.collocations.forEach(function([c, f]) {
            html += '<div class="word-item">' + c + ' <span style="background:var(--neon-cyan);color:#fff;padding:2px 6px;border-radius:10px;font-size:0.8em;">' + f + '</span></div>';
        });
        html += '</div>';
    }
    
    return html;
}
// ========== Concordancier KWIC ==========
function generateConcordance() {
    const text = document.getElementById('conc-input').value.trim();
    const keyword = document.getElementById('conc-keyword').value.trim().toLowerCase();
    const contextSize = parseInt(document.getElementById('conc-window').value);
    const resultsDiv = document.getElementById('conc-results');
    
    if (!text || !keyword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const concordances = extractConcordances(text, keyword, contextSize);
            displayConcordances(concordances, keyword, resultsDiv);
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">Erreur lors de la génération</p>';
        } finally {
            showLoading(false);
        }
    }, 300);
}

function extractConcordances(text, keyword, contextSize) {
    const words = text.match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const concordances = [];
    
    for (let i = 0; i < words.length; i++) {
        if (words[i].toLowerCase() === keyword) {
            concordances.push({
                left: words.slice(Math.max(0, i - contextSize), i).join(' '),
                keyword: words[i],
                right: words.slice(i + 1, Math.min(words.length, i + contextSize + 1)).join(' ')
            });
        }
    }
    return concordances;
}

function displayConcordances(concordances, keyword, resultsDiv) {
    let html = '<h3><i class="fas fa-search"></i> Concordances KWIC pour "' + keyword + '"</h3>';
    html += '<p style="color:var(--text-secondary);margin-bottom:20px;"><i class="fas fa-check-circle"></i> ' + concordances.length + ' occurrence(s)</p>';
    
    if (concordances.length === 0) {
        html += '<p style="text-align:center;padding:40px;color:var(--text-secondary);">Aucune occurrence trouvée.</p>';
    } else {
        html += '<div class="concordance-list">';
        concordances.forEach(function(c, i) {
            html += '<div class="concordance-item">';
            html += '<span style="color:var(--text-secondary);margin-right:10px;">[' + (i + 1) + ']</span>';
            html += '<span style="color:var(--text-secondary);">' + c.left + '</span> ';
            html += '<span class="keyword-highlight">' + c.keyword + '</span> ';
            html += '<span style="color:var(--text-secondary);">' + c.right + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    resultsDiv.innerHTML = html;
}

// ========== Comparaison de Textes ==========
function compareTexts() {
    const text1 = document.getElementById('compare-text1').value.trim();
    const text2 = document.getElementById('compare-text2').value.trim();
    const resultsDiv = document.getElementById('comparison-results');
    
    if (!text1 || !text2 || text1.split(/\s+/).length < 10 || text2.split(/\s+/).length < 10) {
        alert('Veuillez entrer deux textes d\'au moins 10 mots chacun.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const comparison = performTextComparison(text1, text2);
            displayComparisonResults(comparison, resultsDiv);
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">Erreur lors de la comparaison</p>';
        } finally {
            showLoading(false);
        }
    }, 800);
}

function performTextComparison(text1, text2) {
    const words1 = text1.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const shared = [...set1].filter(w => set2.has(w));
    
    return {
        text1: {
            words: words1.length,
            unique: set1.size,
            sentences: text1.split(/[.!?]+/).filter(s => s.trim()).length,
            ttr: ((set1.size / words1.length) * 100).toFixed(2)
        },
        text2: {
            words: words2.length,
            unique: set2.size,
            sentences: text2.split(/[.!?]+/).filter(s => s.trim()).length,
            ttr: ((set2.size / words2.length) * 100).toFixed(2)
        },
        shared: shared,
        uniqueTo1: [...set1].filter(w => !set2.has(w)).slice(0, 50),
        uniqueTo2: [...set2].filter(w => !set1.has(w)).slice(0, 50),
        similarity: ((shared.length / Math.max(set1.size, set2.size)) * 100).toFixed(2)
    };
}

function displayComparisonResults(c, resultsDiv) {
    let html = '<h3><i class="fas fa-balance-scale"></i> Comparaison des Textes</h3>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:25px 0;">';
    html += '<div style="border:2px solid var(--neon-cyan);border-radius:15px;padding:20px;">';
    html += '<h4 style="color:var(--neon-cyan);margin-bottom:15px;"><i class="fas fa-file-alt"></i> Texte 1</h4>';
    html += '<p>Mots: <strong>' + c.text1.words + '</strong></p>';
    html += '<p>Uniques: <strong>' + c.text1.unique + '</strong></p>';
    html += '<p>Phrases: <strong>' + c.text1.sentences + '</strong></p>';
    html += '<p>TTR: <strong>' + c.text1.ttr + '%</strong></p>';
    html += '</div>';
    html += '<div style="border:2px solid var(--neon-purple);border-radius:15px;padding:20px;">';
    html += '<h4 style="color:var(--neon-purple);margin-bottom:15px;"><i class="fas fa-file-alt"></i> Texte 2</h4>';
    html += '<p>Mots: <strong>' + c.text2.words + '</strong></p>';
    html += '<p>Uniques: <strong>' + c.text2.unique + '</strong></p>';
    html += '<p>Phrases: <strong>' + c.text2.sentences + '</strong></p>';
    html += '<p>TTR: <strong>' + c.text2.ttr + '%</strong></p>';
    html += '</div>';
    html += '</div>';
    
    html += '<div style="text-align:center;padding:20px;background:var(--bg-primary);border-radius:15px;margin:20px 0;">';
    html += '<h3 style="color:var(--neon-green);"><i class="fas fa-percentage"></i> Similarité: ' + c.similarity + '%</h3>';
    html += '</div>';
    
    html += '<h3 style="margin-top:30px;"><i class="fas fa-intersection"></i> Mots Partagés (' + c.shared.length + ')</h3>';
    html += '<div class="word-cloud">';
    c.shared.slice(0, 40).forEach(w => html += '<div class="word-item">' + w + '</div>');
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

// ========== Visualisation ==========
function visualizeData() {
    const text = document.getElementById('viz-input').value.trim();
    const vizType = document.getElementById('viz-type').value;
    const resultsDiv = document.getElementById('viz-results');
    
    if (!text) {
        alert('Veuillez entrer un texte à visualiser.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            if (vizType === 'wordcloud') createWordCloud(text, resultsDiv);
            else if (vizType === 'frequency') createFrequencyView(text, resultsDiv);
            else if (vizType === 'ngrams') createNgramsView(text, resultsDiv);
            else if (vizType === 'lexical') createLexicalView(text, resultsDiv);
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">Erreur lors de la visualisation</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function createWordCloud(text, resultsDiv) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const stopWords = getStopWords('fr');
    const freq = {};
    words.filter(w => !stopWords.has(w) && w.length > 2).forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 60);
    const max = sorted[0][1];
    
    let html = '<h3><i class="fas fa-cloud"></i> Nuage de Mots</h3>';
    html += '<div style="padding:40px;background:var(--bg-primary);border-radius:15px;display:flex;flex-wrap:wrap;gap:15px;justify-content:center;align-items:center;min-height:300px;">';
    sorted.forEach(function([w, f]) {
        const size = 14 + (f / max) * 40;
        const hue = Math.random() * 60 + (darkMode ? 160 : 200);
        html += '<span style="font-size:' + size + 'px;color:hsl(' + hue + ',100%,' + (darkMode ? 70 : 50) + '%);font-weight:bold;cursor:pointer;transition:all 0.3s;" title="Fréquence: ' + f + '">' + w + '</span>';
    });
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function createFrequencyView(text, resultsDiv) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const freq = {};
    words.filter(w => !getStopWords('fr').has(w) && w.length > 2).forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    
    let html = '<h3><i class="fas fa-chart-bar"></i> Fréquences des Mots</h3>';
    html += '<div style="padding:20px;background:var(--bg-primary);border-radius:15px;">';
    sorted.forEach(function([w, f]) {
        const barWidth = (f / sorted[0][1]) * 100;
        html += '<div style="margin:10px 0;">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">';
        html += '<span style="font-weight:600;">' + w + '</span>';
        html += '<span style="color:var(--neon-cyan);">' + f + '</span>';
        html += '</div>';
        html += '<div style="background:var(--bg-secondary);height:25px;border-radius:10px;overflow:hidden;">';
        html += '<div style="background:linear-gradient(90deg,var(--neon-cyan),var(--neon-purple));height:100%;width:' + barWidth + '%;transition:width 0.5s;"></div>';
        html += '</div>';
        html += '</div>';
    });
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function createNgramsView(text, resultsDiv) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
        if (words[i].length > 2 && words[i + 1].length > 2 && words[i + 2].length > 2) {
            trigrams.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
    }
    const freq = {};
    trigrams.forEach(t => freq[t] = (freq[t] || 0) + 1);
    const top = Object.entries(freq).filter(([_, f]) => f > 1).sort((a, b) => b[1] - a[1]).slice(0, 30);
    
    let html = '<h3><i class="fas fa-font"></i> N-grammes (Trigrammes)</h3>';
    html += '<p style="color:var(--text-secondary);margin-bottom:20px;"><i class="fas fa-info-circle"></i> Séquences de 3 mots consécutifs</p>';
    html += '<div class="word-cloud">';
    top.forEach(function([t, f]) {
        html += '<div class="word-item">' + t + ' <span style="background:var(--neon-cyan);color:#fff;padding:2px 6px;border-radius:10px;margin-left:5px;font-size:0.8em;">' + f + '</span></div>';
    });
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function createLexicalView(text, resultsDiv) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const unique = new Set(words);
    const ttr = ((unique.size / words.length) * 100).toFixed(2);
    
    let html = '<h3><i class="fas fa-chart-line"></i> Diversité Lexicale</h3>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + words.length + '</div><div class="stat-label">Tokens</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + unique.size + '</div><div class="stat-label">Types</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + ttr + '%</div><div class="stat-label">TTR</div></div>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}
// ========== Export PDF ==========
function exportToPDF(toolType) {
    if (typeof jspdf === 'undefined') {
        alert('Bibliothèque PDF non chargée. Veuillez réessayer.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            let y = 20;
            const margin = 15;
            const pageWidth = doc.internal.pageSize.width - 2 * margin;
            
            // En-tête
            doc.setFontSize(20);
            doc.setTextColor(9, 132, 227);
            doc.text('LinguaLab Pro', margin, y);
            y += 10;
            
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text('Rapport d\'Analyse Linguistique', margin, y);
            y += 5;
            doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), margin, y);
            y += 5;
            doc.text('Par: Bettahar Abdelkrim', margin, y);
            y += 5;
            doc.text('Université de Mostaganem', margin, y);
            y += 15;
            
            // Ligne de séparation
            doc.setDrawColor(9, 132, 227);
            doc.setLineWidth(0.5);
            doc.line(margin, y, doc.internal.pageSize.width - margin, y);
            y += 10;
            
            // Contenu
            let contentDiv;
            if (toolType === 'corpus') {
                contentDiv = document.getElementById('corpus-results');
            } else if (toolType === 'semantic') {
                contentDiv = document.getElementById('semantic-results');
            } else if (toolType === 'concordance') {
                contentDiv = document.getElementById('conc-results');
            } else if (toolType === 'comparison') {
                contentDiv = document.getElementById('comparison-results');
            } else if (toolType === 'visualization') {
                contentDiv = document.getElementById('viz-results');
            }
            
            if (!contentDiv || !contentDiv.innerHTML) {
                alert('Veuillez d\'abord effectuer une analyse avant d\'exporter.');
                showLoading(false);
                return;
            }
            
            // Extraire le texte
            const textContent = contentDiv.innerText || contentDiv.textContent;
            
            doc.setFontSize(10);
            doc.setTextColor(0);
            const lines = doc.splitTextToSize(textContent, pageWidth);
            
            // Ajouter le texte page par page
            for (let i = 0; i < lines.length; i++) {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(lines[i], margin, y);
                y += 7;
            }
            
            // Footer sur toutes les pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    'Page ' + i + ' / ' + pageCount + ' - LinguaLab Pro - Université de Mostaganem',
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }
            
            // Télécharger
            const filename = 'LinguaLab_' + toolType + '_' + Date.now() + '.pdf';
            doc.save(filename);
            
            console.log('PDF généré:', filename);
            showLoading(false);
            
        } catch (error) {
            console.error('Erreur PDF:', error);
            alert('Erreur lors de la génération du PDF: ' + error.message);
            showLoading(false);
        }
    }, 300);
}

// ========== Utilitaires ==========
function getStopWords(lang) {
    const map = {
        'fr': ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or', 'à', 'dans', 'par', 'pour', 'en', 'vers', 'avec', 'sans', 'sous', 'sur', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'ce', 'cet', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'est', 'sont', 'être', 'avoir', 'au', 'aux', 'ne', 'pas', 'plus', 'qui', 'que', 'dont', 'où', 'si', 'comme', 'tout', 'tous', 'toute', 'toutes', 'lui', 'leur', 'leurs', 'se', 'y', 'on', 'fait', 'faire', 'dit', 'dire', 'très', 'bien', 'aussi', 'peut', 'encore', 'moins', 'après', 'avant', 'pendant', 'depuis', 'puis', 'quand', 'chez', 'autre'],
        'en': ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'not', 'all', 'if', 'than', 'so', 'when', 'which', 'who', 'what'],
        'ar': ['في', 'من', 'إلى', 'على', 'عن', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'أن', 'ما', 'لا', 'إن', 'كان', 'قد', 'لم', 'لن', 'كل', 'بعض', 'هو', 'هي', 'هم', 'هن', 'أو', 'لكن', 'مع', 'عند', 'إذا', 'كيف', 'لماذا', 'أين', 'متى'],
        'es': ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'o', 'pero', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'es', 'son', 'ser', 'estar', 'que', 'cual', 'su', 'sus', 'se', 'le', 'lo', 'me', 'te', 'nos', 'como', 'si', 'no'],
        'it': ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'su', 'per', 'con', 'e', 'o', 'ma', 'che', 'è', 'sono', 'essere', 'avere', 'si', 'mi', 'ti', 'ci', 'come', 'se', 'non']
    };
    return new Set(map[lang] || map['fr']);
}

// Messages console
console.log('%c🔬 LinguaLab Pro', 'font-size:24px;color:#00f3ff;font-weight:bold;text-shadow:0 0 10px #00f3ff;');
console.log('%c✨ Version 1.0 - Développé par Bettahar Abdelkrim', 'font-size:14px;color:#b045ff;font-weight:bold;');
console.log('%c🎓 Université de Mostaganem - Département de Langue Française', 'font-size:12px;color:#00ff87;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#00f3ff;');
console.log('%cℹ️  Toutes les fonctionnalités sont opérationnelles', 'font-size:12px;color:#fff;');
console.log('%c📊 Analyse de Corpus | 🧠 Analyse Sémantique | 🔍 Concordancier KWIC', 'font-size:11px;color:#b8bdc9;');
console.log('%c⚖️  Comparaison | 📈 Visualisation | 📄 Export PDF', 'font-size:11px;color:#b8bdc9;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#00f3ff;');
