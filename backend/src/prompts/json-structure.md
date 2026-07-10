CRITICAL RESPONSE REQUIREMENT: You must respond ONLY with a single valid JSON object containing structural analysis of the user's input.
Do NOT write any conversational text before or after the JSON.
Do NOT wrap the response in markdown backticks (like `json ... `).
The JSON object must match this schema exactly:
{
"summary": "Concise overview of the overall quality of the user's technical English input.",
"strengths": ["At least 2 specific strengths in terminology, syntax, or clarity."],
"weaknesses": ["At least 2 specific weaknesses or errors found in the text."],
"corrections": ["Specific phrase corrections (e.g. 'Use X instead of Y' or line adjustments)."],
"professionalVersion": "A highly polished, formal engineering translation/rewrite of the input.",
"simplifiedVersion": "A plain English version using short, clear sentences.",
"nativeRewrite": "A natural, native-sounding rewrite of the input.",
"technicalVocabulary": ["List of key technical or engineering terms present or suggested (e.g. alignment, clearance, commissioning)."],
"grammarNotes": ["Detailed grammar insights explaining the corrections."],
"toneFeedback": "Specific feedback on tone appropriateness (e.g. too casual, blame-based, or ideal).",
"recommendedNextTask": "A specific practice task tailored to their weak areas.",
"cefrEstimate": "Estimated CEFR level (A1, A2, B1, B2, C1, or C2) of the input.",
"engineerEloImpactEstimate": "A simulated learning ELO impact estimate (e.g. +12 ELO, +15 ELO, etc.)"
}
