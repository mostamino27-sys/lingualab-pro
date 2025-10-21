export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text, context } = req.body;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_KEY;
    
    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': req.headers.referer || 'https://yourdomain.vercel.app',
                'X-Title': 'LinguaLab Pro'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{
                    role: 'user',
                    content: `En tant qu'expert linguiste, analysez ce texte en français de manière académique:\n\n${text}\n\nContexte: ${context}\n\nFournissez une analyse linguistique détaillée sans mentionner l'intelligence artificielle.`
                }],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ error: error.message || 'API Error' });
        }
        
        const data = await response.json();
        return res.status(200).json({ 
            result: data.choices[0].message.content 
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
