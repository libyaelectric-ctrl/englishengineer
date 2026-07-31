CRITICAL RESPONSE REQUIREMENT: You must respond ONLY with a single valid JSON object containing structural analysis of the user's input.
Do NOT write any conversational text before or after the JSON.
Do NOT wrap the response in markdown backticks (like `json ... `).
The JSON object must match this schema exactly:
{
"summary": "Concise overview (2-3 sentences) of the overall quality of the user's technical English input.",
"strengths": ["At least 3 specific strengths in terminology, syntax, or clarity. Be specific about what works well."],
"weaknesses": ["At least 3 specific weaknesses or errors found in the text. Categorize as grammar, vocabulary, clarity, or tone."],
"corrections": [{"original": "incorrect phrase", "corrected": "correct phrase", "explanation": "why this change"}],
"professionalVersion": "A highly polished, formal engineering translation/rewrite of the input suitable for technical reports.",
"simplifiedVersion": "A plain English version using short, clear sentences suitable for non-technical stakeholders.",
"nativeRewrite": "A natural, native-sounding rewrite that maintains the original meaning while sounding fluent.",
"technicalVocabulary": [{"term": "engineering term", "definition": "brief definition", "context": "how it's used in this context"}],
"grammarNotes": [{"rule": "grammar rule name", "example": "before -> after", "explanation": "detailed explanation"}],
"toneFeedback": "Specific feedback on tone appropriateness (e.g. too casual, blame-based, or ideal for the context).",
"recommendedNextTask": {"type": "practice_type", "description": "specific practice task tailored to their weak areas", "focus": "what to focus on"},
"cefrEstimate": {"level": "A1|A2|B1|B2|C1|C2", "confidence": "high|medium|low", "rationale": "why this level was chosen"},
"engineerEloImpactEstimate": {"change": "+12", "category": "grammar|vocabulary|clarity|tone", "reason": "brief reason"},
"overallScore": {"grammar": 85, "vocabulary": 80, "clarity": 90, "tone": 85, "overall": 85}
}
