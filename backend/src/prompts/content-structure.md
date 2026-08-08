CRITICAL RESPONSE REQUIREMENT: You must respond ONLY with a single valid JSON object containing the generated engineering English lesson content.
Do NOT write any conversational text before or after the JSON.
Do NOT wrap the response in markdown backticks (like ```json ... ```).
The JSON object must match this schema exactly:
{
  "vocabulary": [
    {
      "term": "engineering term",
      "translation": "translated meaning in target language",
      "definition": "English definition",
      "example": "Example sentence using the term in engineering context",
      "exampleTranslation": "Example sentence translated to target language",
      "cefrLevel": "B1",
      "domain": "civil"
    }
  ],
  "reading": {
    "title": "Reading passage title in English",
    "titleTranslation": "Reading passage title in target language",
    "passage": "3-5 sentence engineering passage in English at the target CEFR level",
    "passageTranslation": "Full passage translated to target language",
    "questions": [
      {"question": "Comprehension question in English", "questionTranslation": "Question in target language", "answer": "Short answer"}
    ]
  },
  "writing": {
    "prompt": "Writing task prompt in English",
    "promptTranslation": "Writing task prompt in target language",
    "modelResponse": "Model response in English",
    "modelResponseTranslation": "Model response in target language"
  },
  "speaking": {
    "scenario": "Speaking scenario description in English",
    "scenarioTranslation": "Scenario in target language",
    "prompts": [
      {"role": "You", "text": "Your line in English", "textTranslation": "Your line in target language"},
      {"role": "Partner", "text": "Partner line in English", "textTranslation": "Partner line in target language"}
    ]
  },
  "listening": {
    "script": "Listening passage script in English (4-6 sentences)",
    "scriptTranslation": "Script in target language",
    "questions": [
      {"question": "Question in English", "questionTranslation": "Question in target language", "answer": "Expected answer"}
    ]
  }
}