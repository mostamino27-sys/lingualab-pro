// ========== Configuration ==========
let currentTool = 'corpus';
let darkMode = true;
let chartInstances = {};

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initTheme();
});

// ========== Gestion du Thème (مُصلح) ==========
function initTheme() {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    darkMode = true;
    updateThemeIcon();
    updateParticlesVisibility();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
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
    
    updateThemeIcon();
    updateParticlesVisibility();
}

function updateParticlesVisibility() {
    const particles = document.getElementById('particles-container');
    if (particles) {
        particles.style.opacity = darkMode ? '1' : '0';
    }
}

// ========== Particules Animées ==========
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

// ========== Navigation entre Outils ==========
function switchTool(toolName) {
    if (currentTool === toolName) return;
    currentTool = toolName;
    
    document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedTool = document.getElementById(toolName + '-tool');
    if (selectedTool) selectedTool.classList.add('active');
    
    const navItem = document.querySelector(`.nav-item[data-tool="${toolName}"]`);
    if (navItem) navItem.classList.add('active');
}

// ========== Analyse avec IA via Serverless Function ==========
async function analyzeWithAI(text, context) {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                text: text.substring(0, 1000), 
                context 
            })
        });
        
        if (!response.ok) {
            console.error('AI API error:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data.result || null;
        
    } catch (error) {
        console.error('Erreur analyse IA:', error);
        return null;
    }
}

// ========== Analyse de Corpus (مُصلح) ==========
async function analyzeCorpus() {
    const text = document.getElementById('corpus-input').value.trim();
    const lang = document.getElementById('corpus-lang').value;
    
    if (!text || text.split(/\s+/).length < 10) {
        alert('Veuillez entrer un texte d\'au moins 10 mots.');
        return;
    }
    
    showLoading(true);
    
    // تأخير صغير لعرض التحميل
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const analysis = performCorpusAnalysis(text, lang);
        let html = generateCorpusHTML(analysis);
        
        // عرض النتائج فوراً
        document.getElementById('corpus-results').innerHTML = html;
        
        // محاولة الحصول على تحليل ذكي
        try {
            const aiInsight = await analyzeWithAI(
                text,
                'Analyse de corpus - expliquez la richesse lexicale, le style et les patterns linguistiques de manière académique'
            );
            
            if (aiInsight) {
                html += `<div style="margin-top:25px; padding:20px; background:var(--bg-primary); border-left:4px solid var(--neon-purple); border-radius:12px;">
                    <h3><i class="fas fa-lightbulb"></i> Interprétation Linguistique</h3>
                    <p style="line-height:1.8; color:var(--text-primary);">${aiInsight.replace(/\n/g, '<br>')}</p>
                </div>`;
                document.getElementById('corpus-results').innerHTML = html;
            }
        } catch (aiError) {
            console.log('AI unavailable:', aiError);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de l\'analyse');
    } finally {
        showLoading(false);
    }
}

function performCorpusAnalysis(text, lang) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const sentences = text.split(/[.!?؟]+/).filter(s => s.trim());
    const stopWords = getStopWords(lang);
    const frequency = {};
    words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
    
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
        ttr,
        hapax,
        avgSentenceLength,
        topWords: sortedWords.slice(0, 30)
    };
}

function generateCorpusHTML(analysis) {
    let html = '<h3><i class="fas fa-chart-bar"></i> Statistiques du Corpus</h3>';
    html += '<div class="stats-grid">';
    html += `<div class="stat-card"><div class="stat-value">${analysis.totalWords}</div><div class="stat-label">Tokens totaux</div></div>`;
    html += `<div class="stat-card"><div class="stat-value">${analysis.uniqueWords}</div><div class="stat-label">Types (mots uniques)</div></div>`;
    html += `<div class="stat-card"><div class="stat-value">${analysis.sentences}</div><div class="stat-label">Phrases</div></div>`;
    html += `<div class="stat-card"><div class="stat-value">${analysis.ttr}%</div><div class="stat-label">TTR (Richesse lexicale)</div></div>`;
    html += `<div class="stat-card"><div class="stat-value">${analysis.hapax}</div><div class="stat-label">Hapax</div></div>`;
    html += `<div class="stat-card"><div class="stat-value">${analysis.avgSentenceLength}</div><div class="stat-label">Mots par phrase</div></div>`;
    html += '</div>';
    
    html += '<h3 style="margin-top:30px;"><i class="fas fa-trophy"></i> 30 Mots les Plus Fréquents</h3>';
    html += '<div class="word-cloud">';
    analysis.topWords.forEach(([word, freq]) => {
        const size = 12 + (freq / analysis.topWords[0][1]) * 20;
        html += `<div class="word-item" style="font-size:${size}px" title="Fréquence: ${freq}">${word}</div>`;
    });
    html += '</div>';
    return html;
}

// ========== Analyse Sémantique (مُصلح) ==========
async function analyzeSemantic() {
    const text = document.getElementById('semantic-input').value.trim();
    const type = document.getElementById('semantic-type').value;
    
    if (!text) {
        alert('Veuillez entrer un texte à analyser.');
        return;
    }
    
    showLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const analysis = performSemanticAnalysis(text, type);
        let html = displaySemanticResults(analysis, type);
        document.getElementById('semantic-results').innerHTML = html;
        
        try {
            const aiAnalysis = await analyzeWithAI(text, `Analyse sémantique de type ${type} - fournissez des insights linguistiques approfondis`);
            
            if (aiAnalysis) {
                html += `<div style="margin-top:25px; padding:20px; background:var(--bg-primary); border-left:4px solid var(--neon-purple); border-radius:12px;">
                    <h3><i class="fas fa-brain"></i> Analyse Approfondie</h3>
                    <p style="line-height:1.8; color:var(--text-primary);">${aiAnalysis.replace(/\n/g, '<br>')}</p>
                </div>`;
                document.getElementById('semantic-results').innerHTML = html;
            }
        } catch (aiError) {
            console.log('AI unavailable:', aiError);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de l\'analyse');
    } finally {
        showLoading(false);
    }
}

function performSemanticAnalysis(text, type) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    
    if (type === 'sentiment') return analyzeSentiment(text, words);
    else if (type === 'entities') return extractEntities(text);
    else if (type === 'themes') return extractThemes(words);
    else if (type === 'collocations') return extractCollocations(words);
}

function analyzeSentiment(text, words) {
    const positiveWords = ['bon', 'bien', 'excellent', 'magnifique', 'merveilleux', 'parfait', 'génial', 'formidable', 'agréable', 'superbe', 'remarquable'];
    const negativeWords = ['mauvais', 'mal', 'horrible', 'terrible', 'nul', 'pire', 'médiocre', 'désagréable', 'catastrophique', 'affreux'];
    
    const posCount = words.filter(w => positiveWords.includes(w)).length;
    const negCount = words.filter(w => negativeWords.includes(w)).length;
    
    let sentiment = 'Neutre 😐';
    if (posCount > negCount) sentiment = 'Positif 😊';
    else if (negCount > posCount) sentiment = 'Négatif 😔';
    
    return { sentiment, positive: posCount, negative: negCount, score: ((posCount - negCount) / words.length * 100).toFixed(2) };
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
    return { themes };
}

function extractCollocations(words) {
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length > 2 && words[i+1].length > 2) {
            bigrams.push(`${words[i]} ${words[i+1]}`);
        }
    }
    const bigramFreq = {};
    bigrams.forEach(bg => bigramFreq[bg] = (bigramFreq[bg] || 0) + 1);
    const collocations = Object.entries(bigramFreq).filter(([_, f]) => f > 1).sort((a, b) => b[1] - a[1]).slice(0, 25);
    return { collocations };
}

function displaySemanticResults(analysis, type) {
    let html = '<h3><i class="fas fa-brain"></i> Résultats de l\'Analyse Sémantique</h3>';
    
    if (type === 'sentiment') {
        html += '<div class="stats-grid">';
        html += `<div class="stat-card"><div class="stat-value">${analysis.sentiment}</div><div class="stat-label">Sentiment</div></div>`;
        html += `<div class="stat-card"><div class="stat-value">${analysis.positive}</div><div class="stat-label">Positifs</div></div>`;
        html += `<div class="stat-card"><div class="stat-value">${analysis.negative}</div><div class="stat-label">Négatifs</div></div>`;
        html += `<div class="stat-card"><div class="stat-value">${analysis.score}</div><div class="stat-label">Score</div></div>`;
        html += '</div>';
    } else if (type === 'entities') {
        html += `<h3 style="margin-top:20px;"><i class="fas fa-user"></i> Entités (${analysis.entities.length})</h3><div class="word-cloud">`;
        analysis.entities.slice(0, 40).forEach(e => html += `<div class="word-item">${e}</div>`);
        html += '</div>';
    } else if (type === 'themes') {
        html += '<h3 style="margin-top:20px;"><i class="fas fa-hashtag"></i> Thèmes</h3><div class="word-cloud">';
        analysis.themes.forEach(([t, f]) => {
            const size = 12 + (f/analysis.themes[0][1]*20);
            html += `<div class="word-item" style="font-size:${size}px">${t}</div>`;
        });
        html += '</div>';
    } else if (type === 'collocations') {
        html += '<h3 style="margin-top:20px;"><i class="fas fa-link"></i> Collocations</h3><div class="word-cloud">';
        analysis.collocations.forEach(([c, f]) => html += `<div class="word-item">${c} <span style="background:var(--neon-cyan);color:#fff;padding:2px 6px;border-radius:10px;font-size:0.8em;">${f}</span></div>`);
        html += '</div>';
    }
    return html;
}
// ========== Concordancier KWIC ==========
function generateConcordance() {
    const text = document.getElementById('conc-input').value.trim();
    const keyword = document.getElementById('conc-keyword').value.trim().toLowerCase();
    const contextSize = parseInt(document.getElementById('conc-window').value);
    
    if (!text || !keyword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    showLoading(true);
    setTimeout(() => {
        const concordances = extractConcordances(text, keyword, contextSize);
        displayConcordances(concordances, keyword);
        showLoading(false);
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

function displayConcordances(concordances, keyword) {
    let html = `<h3><i class="fas fa-search"></i> Concordances KWIC pour "${keyword}"</h3>`;
    html += `<p style="color:var(--text-secondary);margin-bottom:20px;"><i class="fas fa-check-circle"></i> ${concordances.length} occurrence(s)</p>`;
    
    if (concordances.length === 0) {
        html += '<p style="text-align:center;padding:40px;color:var(--text-secondary);">Aucune occurrence.</p>';
    } else {
        html += '<div class="concordance-list">';
        concordances.forEach((c, i) => {
            html += `<div class="concordance-item">
                <span style="color:var(--text-secondary);margin-right:10px;">[${i+1}]</span>
                <span style="color:var(--text-secondary);">${c.left}</span>
                <span class="keyword-highlight">${c.keyword}</span>
                <span style="color:var(--text-secondary);">${c.right}</span>
            </div>`;
        });
        html += '</div>';
    }
    document.getElementById('conc-results').innerHTML = html;
}

// ========== Comparaison (مُصلح) ==========
async function compareTexts() {
    const text1 = document.getElementById('compare-text1').value.trim();
    const text2 = document.getElementById('compare-text2').value.trim();
    
    if (!text1 || !text2 || text1.split(/\s+/).length < 10 || text2.split(/\s+/).length < 10) {
        alert('Veuillez entrer deux textes d\'au moins 10 mots.');
        return;
    }
    
    showLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const comparison = performTextComparison(text1, text2);
        displayComparisonResults(comparison);
        createComparisonCharts(comparison);
        
        try {
            const aiComp = await analyzeWithAI(
                `Texte 1: ${text1.substring(0, 300)}\n\nTexte 2: ${text2.substring(0, 300)}`,
                'Comparez ces textes stylistiquement et lexicalement'
            );
            
            if (aiComp) {
                const current = document.getElementById('comparison-results').innerHTML;
                document.getElementById('comparison-results').innerHTML = current + 
                    `<div style="margin-top:25px;padding:20px;background:var(--bg-primary);border-left:4px solid var(--neon-purple);border-radius:12px;">
                        <h3><i class="fas fa-microscope"></i> Analyse Comparative</h3>
                        <p style="line-height:1.8;color:var(--text-primary);">${aiComp.replace(/\n/g, '<br>')}</p>
                    </div>`;
            }
        } catch (aiError) {
            console.log('AI unavailable:', aiError);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la comparaison');
    } finally {
        showLoading(false);
    }
}

function performTextComparison(text1, text2) {
    const words1 = text1.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const shared = [...set1].filter(w => set2.has(w));
    
    return {
        text1: { words: words1.length, unique: set1.size, sentences: text1.split(/[.!?]+/).filter(s=>s.trim()).length, 
                 ttr: ((set1.size/words1.length)*100).toFixed(2) },
        text2: { words: words2.length, unique: set2.size, sentences: text2.split(/[.!?]+/).filter(s=>s.trim()).length,
                 ttr: ((set2.size/words2.length)*100).toFixed(2) },
        shared,
        uniqueTo1: [...set1].filter(w => !set2.has(w)).slice(0,50),
        uniqueTo2: [...set2].filter(w => !set1.has(w)).slice(0,50),
        similarity: ((shared.length/Math.max(set1.size,set2.size))*100).toFixed(2)
    };
}

function displayComparisonResults(c) {
    let html = '<h3><i class="fas fa-balance-scale"></i> Comparaison</h3>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:25px 0;">';
    html += `<div style="border:2px solid var(--neon-cyan);border-radius:15px;padding:20px;">
        <h4 style="color:var(--neon-cyan);margin-bottom:15px;"><i class="fas fa-file-alt"></i> Texte 1</h4>
        <p>Mots: <strong>${c.text1.words}</strong></p>
        <p>Uniques: <strong>${c.text1.unique}</strong></p>
        <p>Phrases: <strong>${c.text1.sentences}</strong></p>
        <p>TTR: <strong>${c.text1.ttr}%</strong></p>
    </div>`;
    html += `<div style="border:2px solid var(--neon-purple);border-radius:15px;padding:20px;">
        <h4 style="color:var(--neon-purple);margin-bottom:15px;"><i class="fas fa-file-alt"></i> Texte 2</h4>
        <p>Mots: <strong>${c.text2.words}</strong></p>
        <p>Uniques: <strong>${c.text2.unique}</strong></p>
        <p>Phrases: <strong>${c.text2.sentences}</strong></p>
        <p>TTR: <strong>${c.text2.ttr}%</strong></p>
    </div>`;
    html += '</div>';
    html += `<div style="text-align:center;padding:20px;background:var(--bg-primary);border-radius:15px;margin:20px 0;">
        <h3 style="color:var(--neon-green);"><i class="fas fa-percentage"></i> Similarité: ${c.similarity}%</h3>
    </div>`;
    
    html += `<h3 style="margin-top:30px;"><i class="fas fa-intersection"></i> Mots Partagés (${c.shared.length})</h3><div class="word-cloud">`;
    c.shared.slice(0,40).forEach(w => html += `<div class="word-item">${w}</div>`);
    html += '</div>';
    
    document.getElementById('comparison-results').innerHTML = html;
}

function createComparisonCharts(c) {
    const container = document.getElementById('comparison-charts');
    Object.values(chartInstances).forEach(ch => ch.destroy());
    chartInstances = {};
    container.innerHTML = '<h3><i class="fas fa-chart-bar"></i> Visualisations</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;"><div class="chart-wrapper"><canvas id="comparisonChart1"></canvas></div><div class="chart-wrapper"><canvas id="comparisonChart2"></canvas></div></div>';
    
    const ctx1 = document.getElementById('comparisonChart1');
    if(ctx1) {
        chartInstances.comp1 = new Chart(ctx1, {
            type: 'bar',
             {
                labels: ['Mots','Uniques','Phrases'],
                datasets: [
                    {label:'Texte 1',[c.text1.words,c.text1.unique,c.text1.sentences],backgroundColor:'rgba(0,243,255,0.6)',borderColor:'rgba(0,243,255,1)',borderWidth:2},
                    {label:'Texte 2',[c.text2.words,c.text2.unique,c.text2.sentences],backgroundColor:'rgba(176,69,255,0.6)',borderColor:'rgba(176,69,255,1)',borderWidth:2}
                ]
            },
            options: {
                responsive:true,
                plugins:{
                    title:{display:true,text:'Comparaison Statistique',color:darkMode?'#e8eaf6':'#2d3436',font:{size:16,weight:'bold'}},
                    legend:{labels:{color:darkMode?'#e8eaf6':'#2d3436'}}
                },
                scales:{
                    y:{beginAtZero:true,ticks:{color:darkMode?'#b8bdc9':'#636e72'},grid:{color:darkMode?'#2d3561':'#dfe6e9'}},
                    x:{ticks:{color:darkMode?'#b8bdc9':'#636e72'},grid:{color:darkMode?'#2d3561':'#dfe6e9'}}
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('comparisonChart2');
    if(ctx2) {
        chartInstances.comp2 = new Chart(ctx2, {
            type:'pie',
            {
                labels:['Partagés','Uniques T1','Uniques T2'],
                datasets:[{
                    [c.shared.length,c.uniqueTo1.length,c.uniqueTo2.length],
                    backgroundColor:['rgba(0,255,135,0.6)','rgba(0,243,255,0.6)','rgba(176,69,255,0.6)'],
                    borderColor:['rgba(0,255,135,1)','rgba(0,243,255,1)','rgba(176,69,255,1)'],
                    borderWidth:2
                }]
            },
            options:{
                responsive:true,
                plugins:{
                    title:{display:true,text:'Distribution',color:darkMode?'#e8eaf6':'#2d3436',font:{size:16,weight:'bold'}},
                    legend:{labels:{color:darkMode?'#e8eaf6':'#2d3436'}}
                }
            }
        });
    }
}

// ========== Visualisation ==========
function visualizeData() {
    const text = document.getElementById('viz-input').value.trim();
    const vizType = document.getElementById('viz-type').value;
    if(!text) { alert('Texte requis'); return; }
    showLoading(true);
    setTimeout(() => {
        if(vizType==='wordcloud') createWordCloud(text);
        else if(vizType==='frequency') createFrequencyChart(text);
        else if(vizType==='ngrams') createNgramsView(text);
        else if(vizType==='lexical') createLexicalDiversityChart(text);
        showLoading(false);
    }, 500);
}

function createWordCloud(text) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const stopWords = getStopWords('fr');
    const freq = {};
    words.filter(w=>!stopWords.has(w)&&w.length>2).forEach(w=>freq[w]=(freq[w]||0)+1);
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,60);
    const max = sorted[0][1];
    let html = '<h3><i class="fas fa-cloud"></i> Nuage de Mots</h3><div style="padding:40px;background:var(--bg-primary);border-radius:15px;display:flex;flex-wrap:wrap;gap:15px;justify-content:center;align-items:center;min-height:400px;">';
    sorted.forEach(([w,f]) => {
        const size = 14+(f/max)*40;
        const hue = Math.random()*60+(darkMode?160:200);
        html += `<span style="font-size:${size}px;color:hsl(${hue},100%,${darkMode?70:50}%);font-weight:bold;cursor:pointer;transition:all 0.3s;" 
                 onmouseover="this.style.transform='scale(1.3)';this.style.textShadow='0 0 20px currentColor';" 
                 onmouseout="this.style.transform='scale(1)';this.style.textShadow='none';"
                 title="Fréquence: ${f}">${w}</span>`;
    });
    html += '</div>';
    document.getElementById('viz-results').innerHTML = html;
}

function createFrequencyChart(text) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const freq = {};
    words.filter(w=>!getStopWords('fr').has(w)&&w.length>2).forEach(w=>freq[w]=(freq[w]||0)+1);
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,20);
    document.getElementById('viz-results').innerHTML = '<h3><i class="fas fa-chart-bar"></i> Fréquences</h3><div class="chart-wrapper"><canvas id="frequencyChart"></canvas></div>';
    const ctx = document.getElementById('frequencyChart');
    if(ctx) {
        if(chartInstances.frequency) chartInstances.frequency.destroy();
        chartInstances.frequency = new Chart(ctx, {
            type:'bar',
            {
                labels:sorted.map(([w])=>w),
                datasets:[{
                    label:'Fréquence',
                    sorted.map(([_,f])=>f),
                    backgroundColor:sorted.map((_,i)=>{const hue=180+i*10;return `hsla(${hue},100%,${darkMode?60:50}%,0.7)`;}),
                    borderColor:sorted.map((_,i)=>{const hue=180+i*10;return `hsl(${hue},100%,${darkMode?60:50}%)`;}),
                    borderWidth:2
                }]
            },
            options:{
                responsive:true,
                plugins:{
                    legend:{display:false},
                    title:{display:true,text:'Top 20 Mots',color:darkMode?'#e8eaf6':'#2d3436',font:{size:18,weight:'bold'}}
                },
                scales:{
                    y:{beginAtZero:true,ticks:{color:darkMode?'#b8bdc9':'#636e72'},grid:{color:darkMode?'#2d3561':'#dfe6e9'}},
                    x:{ticks:{color:darkMode?'#b8bdc9':'#636e72',maxRotation:45,minRotation:45},grid:{color:darkMode?'#2d3561':'#dfe6e9'}}
                }
            }
        });
    }
}

function createNgramsView(text) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const trigrams = [];
    for(let i=0;i<words.length-2;i++) {
        if(words[i].length>2&&words[i+1].length>2&&words[i+2].length>2) {
            trigrams.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
        }
    }
    const freq = {};
    trigrams.forEach(t=>freq[t]=(freq[t]||0)+1);
    const top = Object.entries(freq).filter(([_,f])=>f>1).sort((a,b)=>b[1]-a[1]).slice(0,30);
    let html = '<h3><i class="fas fa-font"></i> N-grammes</h3><p style="color:var(--text-secondary);margin-bottom:20px;"><i class="fas fa-info-circle"></i> Séquences de 3 mots</p><div class="word-cloud">';
    top.forEach(([t,f]) => html += `<div class="word-item">${t} <span style="background:var(--neon-cyan);color:#fff;padding:2px 6px;border-radius:10px;margin-left:5px;font-size:0.8em;">${f}</span></div>`);
    html += '</div>';
    document.getElementById('viz-results').innerHTML = html;
}

function createLexicalDiversityChart(text) {
    const words = text.toLowerCase().match(/\b[\w'àâäéèêëïîôùûüÿæœç]+\b/g) || [];
    const unique = new Set();
    const growth = [];
    const step = Math.max(1,Math.floor(words.length/30));
    for(let i=0;i<words.length;i+=step) {
        for(let j=0;j<=i&&j<words.length;j++) unique.add(words[j]);
        growth.push({position:i,unique:unique.size});
    }
    const ttr = ((unique.size/words.length)*100).toFixed(2);
    document.getElementById('viz-results').innerHTML = `<h3><i class="fas fa-chart-line"></i> Diversité</h3><div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${words.length}</div><div class="stat-label">Tokens</div></div>
        <div class="stat-card"><div class="stat-value">${unique.size}</div><div class="stat-label">Types</div></div>
        <div class="stat-card"><div class="stat-value">${ttr}%</div><div class="stat-label">TTR</div></div>
    </div><div class="chart-wrapper" style="margin-top:30px;"><canvas id="lexicalChart"></canvas></div>`;
    
    const ctx = document.getElementById('lexicalChart');
    if(ctx) {
        if(chartInstances.lexical) chartInstances.lexical.destroy();
        chartInstances.lexical = new Chart(ctx, {
            type:'line',
            {
                labels:growth.map(g=>g.position),
                datasets:[{
                    label:'Mots uniques',
                    growth.map(g=>g.unique),
                    borderColor:'rgba(0,243,255,1)',
                    backgroundColor:'rgba(0,243,255,0.1)',
                    borderWidth:3,
                    tension:0.4,
                    fill:true
                }]
            },
            options:{
                responsive:true,
                plugins:{
                    title:{display:true,text:'Croissance du Vocabulaire',color:darkMode?'#e8eaf6':'#2d3436',font:{size:18,weight:'bold'}},
                    legend:{labels:{color:darkMode?'#e8eaf6':'#2d3436'}}
                },
                scales:{
                    y:{beginAtZero:true,ticks:{color:darkMode?'#b8bdc9':'#636e72'},grid:{color:darkMode?'#2d3561':'#dfe6e9'},title:{display:true,text:'Mots uniques',color:darkMode?'#b8bdc9':'#636e72'}},
                    x:{ticks:{color:darkMode?'#b8bdc9':'#636e72'},grid:{color:darkMode?'#2d3561':'#dfe6e9'},title:{display:true,text:'Position',color:darkMode?'#b8bdc9':'#636e72'}}
                }
            }
        });
    }
}
// ========== Export PDF ==========
async function exportToPDF(toolType) {
    if(typeof jspdf==='undefined') { alert('PDF non chargé'); return; }
    showLoading(true);
    try {
        const {jsPDF} = jspdf;
        const doc = new jsPDF();
        let y=20;
        const m=15;
        const w=doc.internal.pageSize.width-2*m;
        
        doc.setFontSize(20);
        doc.setTextColor(0,132,227);
        doc.text('LinguaLab Pro',m,y);
        y+=10;
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('Rapport d\'Analyse',m,y);
        y+=5;
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`,m,y);
        y+=5;
        doc.text('Par: Bettahar Abdelkrim',m,y);
        y+=15;
        
        doc.setDrawColor(0,132,227);
        doc.setLineWidth(0.5);
        doc.line(m,y,doc.internal.pageSize.width-m,y);
        y+=10;
        
        let div;
        if(toolType==='corpus') div=document.getElementById('corpus-results');
        else if(toolType==='semantic') div=document.getElementById('semantic-results');
        else if(toolType==='concordance') div=document.getElementById('conc-results');
        else if(toolType==='comparison') div=document.getElementById('comparison-results');
        else if(toolType==='visualization') div=document.getElementById('viz-results');
        
        if(!div||!div.innerHTML) { 
            alert('Effectuez d\'abord une analyse'); 
            showLoading(false); 
            return; 
        }
        
        const txt = div.innerText;
        doc.setFontSize(10);
        doc.setTextColor(0);
        const lines = doc.splitTextToSize(txt,w);
        doc.text(lines,m,y);
        doc.save(`LinguaLab_${toolType}_${Date.now()}.pdf`);
    } catch(e) {
        console.error('PDF Error:',e);
        alert('Erreur PDF');
    } finally {
        showLoading(false);
    }
}

// ========== Utilitaires ==========
function getStopWords(lang) {
    const map = {
        'fr':['le','la','les','un','une','des','de','du','et','ou','mais','donc','car','ni','or','à','dans','par','pour','en','vers','avec','sans','sous','sur','je','tu','il','elle','nous','vous','ils','elles','ce','cet','cette','ces','mon','ma','mes','ton','ta','tes','son','sa','ses','est','sont','être','avoir','au','aux','ne','pas','plus','qui','que','dont','où'],
        'en':['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','should','could','may','might','must','can','this','that','these','those','i','you','he','she','it','we','they'],
        'ar':['في','من','إلى','على','عن','هذا','هذه','ذلك','التي','الذي','أن','ما','لا','إن','كان','قد','لم','لن','كل','بعض','هو','هي','هم','هن'],
        'es':['el','la','los','las','un','una','unos','unas','de','del','y','o','pero','en','por','para','con','sin','sobre','es','son','ser','estar','que','cual'],
        'it':['il','lo','la','i','gli','le','un','uno','una','di','a','da','in','su','per','con','e','o','ma','che','è','sono','essere','avere']
    };
    return new Set(map[lang]||map['fr']);
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if(overlay) overlay.classList.toggle('active',show);
}

console.log('%cLinguaLab Pro','font-size:24px;color:#00f3ff;font-weight:bold;');
console.log('%cDéveloppé par Bettahar Abdelkrim','font-size:12px;color:#666;');
