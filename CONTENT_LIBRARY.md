# Professional Content Library

EngineerOS includes a structured content pack with 30 listening scripts, 30
speaking roleplays and 30 writing tasks across A1-C2 engineering communication.

Listening entries use `script_ready` unless a real audio file is supplied and
verified. The content pack never creates fake playback evidence. Roleplay and
writing entries include professional tasks, rubrics, common mistakes and target
vocabulary.

`ProfessionalContentLibrary` provides level-specific queries for future engine
integration without duplicating Vocabulary or Grammar databases. Optional
`vocabularyIds` are available for curated canonical links; empty links are not
invented.

Run `npm run content:validate` to verify counts, IDs, required fields, CEFR
levels, listening status values and audio honesty.
