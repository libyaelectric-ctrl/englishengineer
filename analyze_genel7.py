import pandas as pd
import json

df = pd.read_excel(r'C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\database\dosyalar\Genel7.xlsx')

print("=== QC REPAIR NOTES (unique values) ===")
print(df['qcRepairNotes'].value_counts().head(30).to_string())
print()

print("=== TERM SAMPLE (first 20) ===")
for i, row in df.head(20).iterrows():
    print(f"{row['term']} | {row['turkishMeaning']} | {row['domain']} | {row['cefrLevel']} | {row['category']}")
print()

print("=== CEFR x DOMAIN CROSSTAB (top 15) ===")
print(pd.crosstab(df['cefrLevel'], df['domain']).head(15).to_string())
print()

print("=== CEFR x IMPORT TIER ===")
print(pd.crosstab(df['cefrLevel'], df['importTier']).to_string())
print()

print("=== DOMAIN x IMPORT TIER (top 10) ===")
print(pd.crosstab(df['domain'], df['importTier']).head(10).to_string())
print()

print("=== IS TECHNICAL x CEFR ===")
print(pd.crosstab(df['isTechnical'], df['cefrLevel']).to_string())
print()

print("=== IS DAILY SITE ENGLISH x CEFR ===")
print(pd.crosstab(df['isDailySiteEnglish'], df['cefrLevel']).to_string())
print()

print("=== IS LIFE WIDE ENGLISH x CEFR ===")
print(pd.crosstab(df['isLifeWideEnglish'], df['cefrLevel']).to_string())
print()

print("=== TAGS ANALYSIS (sample) ===")
for i, tags in enumerate(df['tags'].head(30)):
    print(f"  {tags}")

print()
print("=== TERM LENGTH STATS ===")
df['term_length'] = df['term'].str.len()
print(df['term_length'].describe())
print()

print("=== UNIQUE CATEGORIES COUNT ===")
print(f"Unique categories: {df['category'].nunique()}")
print()

print("=== CATEGORY SAMPLES BY DOMAIN (electrical) ===")
print(df[df['domain']=='electrical']['category'].value_counts().head(20).to_string())
print()

print("=== CATEGORY SAMPLES BY DOMAIN (software) ===")
print(df[df['domain']=='software']['category'].value_counts().head(20).to_string())
print()

print("=== CONTENT DOMAIN x CEFR ===")
print(pd.crosstab(df['contentDomain'], df['cefrLevel']).to_string())
print()

print("=== EXAMPLE SENTENCES SAMPLE ===")
for i, ex in enumerate(df['exampleSentence'].head(10)):
    print(f"  {ex}")