// ========== Configuration ==========
let currentTool = 'corpus';
let darkMode = true;

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initTheme();
    console.log('✅ LinguaLab Pro v2.0 loaded successfully!');
});

// ========== Thème ==========
function initTheme() {
    document.body.classList.add('dark-mode');
    darkMode = true;
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = '☀️';
    const particles = document.getElementById('particles-container');
    if (particles) particles.style.opacity = '1';
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
    if (icon) {
        icon.textContent = darkMode ? '☀️' : '🌙';
    }
    
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
    currentTool = toolName;
    
    document.querySelectorAll('.tool-card').forEach(function(card) {
        card.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.remove('active');
    });
    
    const selectedTool = document.getElementById(toolName + '-tool');
    if (selectedTool) selectedTool.classList.add('active');
    
    const navItem = document.querySelector('.nav-item[data-tool="' + toolName + '"]');
    if (navItem) navItem.classList.add('active');
}

// ========== Loading ==========
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

// ========== PDF Support ==========
async function extractTextFromPDF(file) {
    return new Promise(function(resolve, reject) {
        if (typeof pdfjsLib === 'undefined') {
            reject('PDF.js non chargé');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedArray = new Uint8Array(e.target.result);
            
            pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
                const numPages = pdf.numPages;
                const promises = [];
                
                for (let i = 1; i <= numPages; i++) {
                    promises.push(
                        pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(content) {
                                return content.items.map(function(item) {
                                    return item.str;
                                }).join(' ');
                            });
                        })
                    );
                }
                
                Promise.all(promises).then(function(pages) {
                    resolve(pages.join('\n\n'));
                }).catch(reject);
                
            }).catch(reject);
        };
        
        reader.onerror = function() {
            reject('Erreur lecture fichier');
        };
        
        reader.readAsArrayBuffer(file);
    });
}

async function loadFileGeneric(file, targetInputId) {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop grand. Max 10MB');
        return;
    }
    
    showLoading(true);
    
    try {
        let text;
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.txt')) {
            text = await new Promise(function(resolve, reject) {
                const reader = new FileReader();
                reader.onload = function(e) { resolve(e.target.result); };
                reader.onerror = reject;
                reader.readAsText(file, 'UTF-8');
            });
        } else if (fileName.endsWith('.pdf')) {
            text = await extractTextFromPDF(file);
        } else {
            alert('Format non supporté. Utilisez .txt ou .pdf');
            showLoading(false);
            return;
        }
        
        document.getElementById(targetInputId).value = text;
        
        const inputEl = document.getElementById(targetInputId);
        inputEl.style.borderColor = '#3b82f6';
        inputEl.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
        setTimeout(function() {
            inputEl.style.borderColor = '';
            inputEl.style.boxShadow = '';
        }, 1500);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement: ' + error);
        showLoading(false);
    }
}

function loadFileForCorpus(input) {
    const file = input.files[0];
    loadFileGeneric(file, 'corpus-input');
}

function loadFileForSemantic(input) {
    const file = input.files[0];
    loadFileGeneric(file, 'semantic-input');
}

function loadFileForConcordance(input) {
    const file = input.files[0];
    loadFileGeneric(file, 'conc-input');
}

function loadFileForComparison(input, textNumber) {
    const file = input.files[0];
    const targetId = textNumber === 1 ? 'compare-text1' : 'compare-text2';
    loadFileGeneric(file, targetId);
}

function loadFileForVisualization(input) {
    const file = input.files[0];
    loadFileGeneric(file, 'viz-input');
}

// ========== Analyse de Corpus ==========
function analyzeCorpus() {
    const input = document.getElementById('corpus-input');
    const resultsDiv = document.getElementById('corpus-results');
    
    if (!input || !resultsDiv) {
        alert('Erreur: Éléments introuvables');
        return;
    }
    
    const text = input.value.trim();
    const lang = document.getElementById('corpus-lang').value;
    
    if (!text || text.split(/\s+/).length < 10) {
        alert('Veuillez entrer un texte d\'au moins 10 mots.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        const analysis = performCorpusAnalysis(text, lang);
        const html = generateCorpusHTML(analysis);
        resultsDiv.innerHTML = html;
        showLoading(false);
    }, 500);
}

function performCorpusAnalysis(text, lang) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const sentences = text.split(/[.!?؟]+/).filter(function(s) { return s.trim(); });
    const stopWords = getStopWords(lang);
    const frequency = {};
    
    words.forEach(function(word) {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    const sortedWords = Object.entries(frequency)
        .filter(function(entry) { return !stopWords.has(entry[0]) && entry[0].length > 2; })
        .sort(function(a, b) { return b[1] - a[1]; });
    
    const uniqueWords = new Set(words);
    const hapax = sortedWords.filter(function(entry) { return entry[1] === 1; }).length;
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
    let html = '<h3><span style="font-size:24px;margin-right:8px;">📊</span> Statistiques du Corpus</h3>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.totalWords + '</div><div class="stat-label">Tokens totaux</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.uniqueWords + '</div><div class="stat-label">Types</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.sentences + '</div><div class="stat-label">Phrases</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.ttr + '%</div><div class="stat-label">TTR</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.hapax + '</div><div class="stat-label">Hapax</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + analysis.avgSentenceLength + '</div><div class="stat-label">Mots/phrase</div></div>';
    html += '</div>';
    
    html += '<h3 style="margin-top:30px;"><span style="font-size:24px;margin-right:8px;">🏆</span> Mots Fréquents</h3>';
    html += '<div class="word-cloud">';
    analysis.topWords.forEach(function(entry) {
        const size = 12 + (entry[1] / analysis.topWords[0][1]) * 20;
        html += '<div class="word-item" style="font-size:' + size + 'px">' + entry[0] + '</div>';
    });
    html += '</div>';
    
    return html;
}

// ========== Concordancier KWIC ==========
function generateConcordance() {
    const text = document.getElementById('conc-input').value.trim();
    const keyword = document.getElementById('conc-keyword').value.trim().toLowerCase();
    const contextSize = parseInt(document.getElementById('conc-window').value);
    const resultsDiv = document.getElementById('conc-results');
    
    if (!text || !keyword) {
        alert('⚠️ Veuillez remplir tous les champs:\n\n1. Entrez un corpus textuel\n2. Entrez un mot-clé à rechercher');
        return;
    }
    
    if (text.split(/\s+/).length < 10) {
        alert('⚠️ Le corpus doit contenir au moins 10 mots.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const concordances = extractConcordances(text, keyword, contextSize);
            displayConcordances(concordances, keyword, resultsDiv);
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">❌ Erreur lors de la génération</p>';
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
            const leftStart = Math.max(0, i - contextSize);
            const rightEnd = Math.min(words.length, i + contextSize + 1);
            
            concordances.push({
                index: i,
                left: words.slice(leftStart, i).join(' '),
                keyword: words[i],
                right: words.slice(i + 1, rightEnd).join(' ')
            });
        }
    }
    return concordances;
}

function displayConcordances(concordances, keyword, resultsDiv) {
    let html = '<h3><span style="font-size:24px;margin-right:8px;">🔍</span> Concordances KWIC pour "' + keyword + '"</h3>';
    html += '<div style="margin:20px 0;padding:15px;background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;border-radius:10px;">';
    html += '<p style="margin:0;"><strong>✅ ' + concordances.length + ' occurrence(s) trouvée(s)</strong></p>';
    html += '</div>';
    
    if (concordances.length === 0) {
        html += '<div style="text-align:center;padding:60px 20px;background:var(--bg-primary);border-radius:15px;">';
        html += '<p style="font-size:48px;margin-bottom:15px;">🔎</p>';
        html += '<p style="font-size:18px;color:var(--text-secondary);">Aucune occurrence trouvée pour "' + keyword + '"</p>';
        html += '</div>';
    } else {
        html += '<div class="concordance-list" style="max-height:600px;overflow-y:auto;">';
        concordances.forEach(function(c, i) {
            html += '<div style="padding:15px;margin-bottom:12px;background:var(--bg-primary);border-radius:10px;border-left:4px solid #3b82f6;font-family:\'Courier New\',monospace;">';
            html += '<div style="margin-bottom:8px;"><span style="background:rgba(59,130,246,0.2);color:#3b82f6;padding:2px 8px;border-radius:5px;font-size:12px;font-weight:600;">#' + (i + 1) + '</span></div>';
            html += '<div style="font-size:15px;line-height:1.8;">';
            html += '<span style="color:var(--text-secondary);">' + c.left + '</span> ';
            html += '<span style="background:linear-gradient(135deg,#3b82f6,#60a5fa);color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold;">' + c.keyword + '</span> ';
            html += '<span style="color:var(--text-secondary);">' + c.right + '</span>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    resultsDiv.innerHTML = html;
}
// ========== Analyse Sémantique ==========
function analyzeSemantic() {
    const text = document.getElementById('semantic-input').value.trim();
    const type = document.getElementById('semantic-type').value;
    const resultsDiv = document.getElementById('semantic-results');
    
    if (!text) {
        alert('⚠️ Veuillez entrer un texte à analyser.');
        return;
    }
    
    if (text.split(/\s+/).length < 5) {
        alert('⚠️ Le texte doit contenir au moins 5 mots.');
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
            resultsDiv.innerHTML = '<p style="color:red;">❌ Erreur lors de l\'analyse</p>';
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
    const positiveWords = ['bon','bien','excellent','magnifique','merveilleux','parfait','génial','formidable','agréable','superbe','remarquable','extraordinaire','fantastique','splendide','beau','belle','joli','jolie','heureux','heureuse','joie','amour','bonheur','succès','réussite','intéressant','formidable','incroyable'];
    const negativeWords = ['mauvais','mal','horrible','terrible','nul','nulle','pire','médiocre','désagréable','catastrophique','affreux','détestable','lamentable','triste','tristesse','malheur','échec','problème','difficulté','erreur','ennuyeux','décevant','faible'];
    
    const posCount = words.filter(w => positiveWords.includes(w)).length;
    const negCount = words.filter(w => negativeWords.includes(w)).length;
    const total = words.length;
    
    let sentiment = 'Neutre', emoji = '😐', color = '#6c757d', score = 0;
    
    if (posCount > negCount) {
        sentiment = 'Positif';
        emoji = '😊';
        color = '#10b981';
        score = Math.round((posCount / total) * 100);
    } else if (negCount > posCount) {
        sentiment = 'Négatif';
        emoji = '😔';
        color = '#ef4444';
        score = Math.round((negCount / total) * 100);
    }
    
    return {
        sentiment: sentiment,
        emoji: emoji,
        color: color,
        score: score,
        positive: posCount,
        negative: negCount,
        neutral: total - posCount - negCount,
        posWords: words.filter(w => positiveWords.includes(w)),
        negWords: words.filter(w => negativeWords.includes(w))
    };
}

function extractEntities(text) {
    const capitalizedWords = text.match(/\b[A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)*\b/g) || [];
    const uniqueEntities = [...new Set(capitalizedWords)];
    return { total: uniqueEntities.length, all: uniqueEntities };
}

function extractThemes(words) {
    const stopWords = getStopWords('fr');
    const frequency = {};
    words.filter(w => !stopWords.has(w) && w.length > 3).forEach(function(word) {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 15);
    return { themes: sorted };
}

function extractCollocations(words) {
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length > 2 && words[i + 1].length > 2) {
            bigrams.push(words[i] + ' ' + words[i + 1]);
        }
    }
    const freq = {};
    bigrams.forEach(b => freq[b] = (freq[b] || 0) + 1);
    const sorted = Object.entries(freq).filter(([_, f]) => f > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    return { collocations: sorted, total: sorted.length };
}

function displaySemanticResults(analysis, type) {
    let html = '<h3><span style="font-size:24px;margin-right:8px;">🧠</span> Résultats de l\'Analyse Sémantique</h3>';
    
    if (type === 'sentiment') {
        html += '<div style="text-align:center;padding:40px;background:var(--bg-primary);border-radius:15px;margin:25px 0;">';
        html += '<div style="font-size:80px;margin-bottom:15px;">' + analysis.emoji + '</div>';
        html += '<h2 style="color:' + analysis.color + ';margin-bottom:10px;">Sentiment: ' + analysis.sentiment + '</h2>';
        html += '<p style="font-size:18px;color:var(--text-secondary);">Score: ' + analysis.score + '%</p>';
        html += '</div>';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-value" style="color:#10b981;">' + analysis.positive + '</div><div class="stat-label">Mots Positifs</div></div>';
        html += '<div class="stat-card"><div class="stat-value" style="color:#ef4444;">' + analysis.negative + '</div><div class="stat-label">Mots Négatifs</div></div>';
        html += '<div class="stat-card"><div class="stat-value" style="color:#6c757d;">' + analysis.neutral + '</div><div class="stat-label">Mots Neutres</div></div>';
        html += '</div>';
    } else if (type === 'entities') {
        html += '<div style="margin:25px 0;padding:20px;background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;border-radius:10px;">';
        html += '<p style="margin:0;"><strong>✅ ' + analysis.total + ' entité(s) nommée(s) détectée(s)</strong></p></div>';
        if (analysis.all.length > 0) {
            html += '<h3 style="margin-top:30px;"><span style="font-size:20px;margin-right:8px;">👥</span> Entités Détectées</h3>';
            html += '<div class="word-cloud">';
            analysis.all.forEach(e => html += '<div class="word-item">' + e + '</div>');
            html += '</div>';
        }
    } else if (type === 'themes') {
        html += '<h3 style="margin-top:30px;"><span style="font-size:20px;margin-right:8px;">🎯</span> Thèmes Principaux</h3>';
        html += '<div style="padding:20px;background:var(--bg-primary);border-radius:15px;">';
        analysis.themes.forEach(function([theme, freq], i) {
            const barWidth = (freq / analysis.themes[0][1]) * 100;
            html += '<div style="margin:15px 0;">';
            html += '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">';
            html += '<span style="font-weight:600;">' + (i + 1) + '. ' + theme + '</span>';
            html += '<span style="color:#3b82f6;font-weight:600;">' + freq + '</span></div>';
            html += '<div style="background:var(--bg-secondary);height:25px;border-radius:10px;overflow:hidden;">';
            html += '<div style="background:linear-gradient(90deg,#3b82f6,#60a5fa);height:100%;width:' + barWidth + '%"></div></div></div>';
        });
        html += '</div>';
    } else if (type === 'collocations') {
        html += '<div style="margin:25px 0;padding:20px;background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;border-radius:10px;">';
        html += '<p style="margin:0;"><strong>✅ ' + analysis.total + ' collocation(s) détectée(s)</strong></p></div>';
        if (analysis.collocations.length > 0) {
            html += '<h3 style="margin-top:30px;"><span style="font-size:20px;margin-right:8px;">🔗</span> Collocations Fréquentes</h3>';
            html += '<div class="word-cloud">';
            analysis.collocations.forEach(function([col, freq]) {
                html += '<div class="word-item">' + col + ' <span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:10px;margin-left:5px;">' + freq + '</span></div>';
            });
            html += '</div>';
        }
    }
    return html;
}

// ========== Comparaison de Textes ==========
function compareTexts() {
    const text1 = document.getElementById('compare-text1').value.trim();
    const text2 = document.getElementById('compare-text2').value.trim();
    const resultsDiv = document.getElementById('comparison-results');
    
    if (!text1 || !text2) {
        alert('⚠️ Veuillez remplir les deux textes à comparer.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const comparison = performComparison(text1, text2);
            const html = displayComparisonResults(comparison);
            resultsDiv.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">❌ Erreur lors de la comparaison</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function performComparison(text1, text2) {
    const words1 = text1.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const common = [...set1].filter(w => set2.has(w));
    const unique1 = [...set1].filter(w => !set2.has(w));
    const unique2 = [...set2].filter(w => !set1.has(w));
    const similarity = ((common.length / Math.max(set1.size, set2.size)) * 100).toFixed(2);
    
    return {
        text1Length: words1.length,
        text2Length: words2.length,
        text1Unique: set1.size,
        text2Unique: set2.size,
        commonWords: common.length,
        uniqueToText1: unique1.length,
        uniqueToText2: unique2.length,
        similarity: similarity,
        commonWordsList: common.slice(0, 30),
        unique1List: unique1.slice(0, 20),
        unique2List: unique2.slice(0, 20)
    };
}

function displayComparisonResults(comp) {
    let html = '<h3><span style="font-size:24px;margin-right:8px;">⚖️</span> Résultats de la Comparaison</h3>';
    html += '<div style="text-align:center;padding:40px;background:var(--bg-primary);border-radius:15px;margin:25px 0;">';
    html += '<div style="font-size:60px;font-weight:bold;color:#3b82f6;margin-bottom:10px;">' + comp.similarity + '%</div>';
    html += '<p style="font-size:18px;color:var(--text-secondary);">Similarité Lexicale</p></div>';
    
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + comp.text1Length + '</div><div class="stat-label">Mots Texte 1</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + comp.text2Length + '</div><div class="stat-label">Mots Texte 2</div></div>';
    html += '<div class="stat-card"><div class="stat-value" style="color:#10b981;">' + comp.commonWords + '</div><div class="stat-label">Mots Communs</div></div>';
    html += '<div class="stat-card"><div class="stat-value" style="color:#3b82f6;">' + comp.uniqueToText1 + '</div><div class="stat-label">Uniques au Texte 1</div></div>';
    html += '<div class="stat-card"><div class="stat-value" style="color:#60a5fa;">' + comp.uniqueToText2 + '</div><div class="stat-label">Uniques au Texte 2</div></div>';
    html += '</div>';
    
    if (comp.commonWordsList.length > 0) {
        html += '<h3 style="margin-top:30px;"><span style="font-size:20px;margin-right:8px;">🤝</span> Mots Communs</h3>';
        html += '<div class="word-cloud">';
        comp.commonWordsList.forEach(w => html += '<div class="word-item" style="border-color:#10b981;">' + w + '</div>');
        html += '</div>';
    }
    
    return html;
}

// ========== Visualisation ==========
function visualizeData() {
    const text = document.getElementById('viz-input').value.trim();
    const type = document.getElementById('viz-type').value;
    const resultsDiv = document.getElementById('viz-results');
    
    if (!text) {
        alert('⚠️ Veuillez entrer un texte à visualiser.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(function() {
        try {
            const viz = performVisualization(text, type);
            const html = displayVisualization(viz, type);
            resultsDiv.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color:red;">❌ Erreur lors de la visualisation</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function performVisualization(text, type) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const stopWords = getStopWords('fr');
    const filtered = words.filter(w => !stopWords.has(w) && w.length > 3);
    
    if (type === 'wordcloud') {
        const freq = {};
        filtered.forEach(w => freq[w] = (freq[w] || 0) + 1);
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50);
    } else if (type === 'frequency') {
        const freq = {};
        filtered.forEach(w => freq[w] = (freq[w] || 0) + 1);
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    } else if (type === 'ngrams') {
        const trigrams = [];
        for (let i = 0; i < words.length - 2; i++) {
            trigrams.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
        const freq = {};
        trigrams.forEach(t => freq[t] = (freq[t] || 0) + 1);
        return Object.entries(freq).filter(([_, f]) => f > 1).sort((a, b) => b[1] - a[1]).slice(0, 15);
    } else if (type === 'lexical') {
        const total = words.length;
        const unique = new Set(words).size;
        const ttr = ((unique / total) * 100).toFixed(2);
        return { total, unique, ttr };
    }
}

function displayVisualization(data, type) {
    let html = '<h3><span style="font-size:24px;margin-right:8px;">📈</span> Visualisation: ';
    html += type === 'wordcloud' ? 'Nuage de Mots' : type === 'frequency' ? 'Fréquences' : type === 'ngrams' ? 'Trigrammes' : 'Diversité Lexicale';
    html += '</h3>';
    
    if (type === 'wordcloud') {
        html += '<div class="word-cloud">';
        data.forEach(([word, freq]) => {
            const size = 12 + (freq / data[0][1]) * 25;
            html += '<div class="word-item" style="font-size:' + size + 'px">' + word + '</div>';
        });
        html += '</div>';
    } else if (type === 'frequency') {
        html += '<div style="padding:20px;background:var(--bg-primary);border-radius:15px;margin-top:20px;">';
        data.forEach(([word, freq], i) => {
            const barWidth = (freq / data[0][1]) * 100;
            html += '<div style="margin:15px 0;"><div style="display:flex;justify-content:space-between;margin-bottom:5px;">';
            html += '<span style="font-weight:600;">' + (i + 1) + '. ' + word + '</span><span style="color:#3b82f6;font-weight:600;">' + freq + '</span></div>';
            html += '<div style="background:var(--bg-secondary);height:25px;border-radius:10px;overflow:hidden;">';
            html += '<div style="background:linear-gradient(90deg,#3b82f6,#60a5fa);height:100%;width:' + barWidth + '%"></div></div></div>';
        });
        html += '</div>';
    } else if (type === 'ngrams') {
        html += '<div class="word-cloud" style="margin-top:20px;">';
        data.forEach(([ngram, freq]) => html += '<div class="word-item">' + ngram + ' <span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:10px;margin-left:5px;">' + freq + '</span></div>');
        html += '</div>';
    } else if (type === 'lexical') {
        html += '<div class="stats-grid" style="margin-top:20px;">';
        html += '<div class="stat-card"><div class="stat-value">' + data.total + '</div><div class="stat-label">Total Tokens</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + data.unique + '</div><div class="stat-label">Types Uniques</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + data.ttr + '%</div><div class="stat-label">TTR (Diversité)</div></div>';
        html += '</div>';
    }
    
    return html;
}

// ========== Export PDF ==========
function exportToPDF(toolType) {
    if (typeof jspdf === 'undefined') {
        alert('⚠️ Erreur: Bibliothèque PDF non chargée.\n\nSolution: Rafraîchissez la page (F5)');
        return;
    }
    
    const contentDiv = document.getElementById(toolType + '-results');
    if (!contentDiv || !contentDiv.innerHTML || contentDiv.innerHTML.trim() === '') {
        alert('⚠️ Aucune analyse à exporter!\n\n📝 Marche à suivre:\n1️⃣ Entrez votre texte\n2️⃣ Cliquez sur "Analyser"\n3️⃣ Puis "Exporter en PDF"');
        return;
    }
    
    showLoading(true);
    
    try {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        const text = contentDiv.innerText || contentDiv.textContent;
        const lines = doc.splitTextToSize(text, 180);
        
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('LinguaLab Pro - Rapport', 15, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 15, 30);
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(lines, 15, 45);
        
        const filename = 'LinguaLab_' + toolType + '_' + Date.now() + '.pdf';
        doc.save(filename);
        showLoading(false);
        setTimeout(() => alert('✅ PDF exporté: ' + filename), 200);
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Erreur: ' + error.message);
        showLoading(false);
    }
}

// ========== Stop Words ==========
function getStopWords(lang) {
    const map = {
        'fr': ['le','la','les','un','une','des','de','du','et','ou','mais','donc','car','à','dans','par','pour','en','avec','sans','sur','je','tu','il','elle','nous','vous','ils','elles','ce','mon','ma','mes','est','sont','être','avoir','ne','pas','plus','qui','que','où'],
        'en': ['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','have','has','this','that','i','you','he','she','it','we','they'],
        'ar': ['في','من','إلى','على','عن','هذا','أن','ما','لا'],
        'es': ['el','la','los','las','un','de','y','en','que'],
        'it': ['il','lo','la','i','le','un','di','e','che']
    };
    return new Set(map[lang] || map['fr']);
}

console.log('%c🔬 LinguaLab Pro v2.0 COMPLET', 'font-size:20px;color:#3b82f6;font-weight:bold');
console.log('%c✅ 6/6 Outils Fonctionnels', 'color:#10b981;font-size:16px');
console.log('%c📊 Corpus | 🧠 Sémantique | 🔍 KWIC | ⚖️ Comparaison | 📈 Visualisation | 📄 Export', 'color:#60a5fa');
