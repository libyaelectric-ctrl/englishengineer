=== USER LEARNING MEMORIES (RAG RETRIEVED) ===
{{#if hasMistakes}}
The user has made the following grammatical/vocabulary mistakes recently. Use these exact mistakes to generate customized practice exercises (e.g. rewrite correction tasks, fill-in-the-blanks, or multiple-choice options targeting these issues):
{{#each mistakes}}
- Mistake {{@index}} [Category: {{category}}]: Original text: "{{originalText}}" -> Corrected to: "{{correction}}"
{{/each}}
{{/if}}
{{#if hasWeakVocab}}
The user also has the following weak vocabulary terms that require reinforcement. Integrate these terms directly into the practice exercises:
{{#each weakVocab}}
- {{this}}
{{/each}}
{{/if}}
{{#if noData}}
The user has no recorded mistakes or weak vocabulary. Provide a general high-yield engineering vocabulary practice lesson based on their discipline: {{discipline}}.
{{/if}}
==============================================
