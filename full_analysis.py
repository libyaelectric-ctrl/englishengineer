import pandas as pd
import json
import os
from collections import Counter

df = pd.read_excel(r'C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\database\dosyalar\Genel7.xlsx')

output_dir = r'C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0\analysis_output'
os.makedirs(output_dir, exist_ok=True)

print("=" * 80)
print("GENEL7.XLSX KAPSAMLI ANALİZ RAPORU")
print("=" * 80)

# ============================================================
# 1. DOMAIN x CEFR ÇAPRAZ MATRİSİ
# ============================================================
print("\n\n1. DOMAIN x CEFR ÇAPRAZ MATRİSİ (Kelime Sayıları)")
print("-" * 60)

cross = pd.crosstab(df['domain'], df['cefrLevel'], margins=True, margins_name='TOPLAM')
cross = cross[['A1','A2','B1','B2','C1','C2','TOPLAM']]
print(cross.to_string())

cross.to_csv(os.path.join(output_dir, 'domain_cefr_matrix.csv'))

# Domain özet
print("\n\nDOMAIN ÖZETİ:")
domain_summary = df.groupby('domain').agg(
    kelime_sayisi=('term', 'count'),
    benzersiz_kategori=('category', 'nunique'),
    ortalama_guven=('confidence', 'mean')
).sort_values('kelime_sayisi', ascending=False)
print(domain_summary.to_string())
domain_summary.to_csv(os.path.join(output_dir, 'domain_summary.csv'))

# ============================================================
# 2. KELİME SAYISI ANALİZİ (1-9 kelimelik terimler)
# ============================================================
print("\n\n2. TERİM KELİME SAYISI DAĞILIMI (1-9 Kelime)")
print("-" * 60)

# wordCount kolonu zaten var, ama term'den de hesaplayalım doğrulama için
df['term_word_count'] = df['term'].str.split().str.len()

word_count_dist = df['term_word_count'].value_counts().sort_index()
print("wordCount kolonu (mevcut):")
print(df['wordCount'].value_counts().sort_index().to_string())

print("\nTerm'den hesaplanan kelime sayısı:")
print(word_count_dist.head(15).to_string())

# 1-9 arası detay
print("\n1-9 Kelimelik Terim Detayı:")
for i in range(1, 10):
    count = (df['term_word_count'] == i).sum()
    pct = count / len(df) * 100
    print(f"  {i} kelimelik: {count:>5} (%{pct:.1f})")

toplam_1_9 = (df['term_word_count'] <= 9).sum()
print(f"\n1-9 kelimelik TOPLAM: {toplam_1_9} / {len(df)} (%{toplam_1_9/len(df)*100:.1f})")

word_count_df = pd.DataFrame({
    'kelime_sayisi': range(1, 10),
    'adet': [(df['term_word_count'] == i).sum() for i in range(1, 10)],
    'yuzde': [(df['term_word_count'] == i).sum() / len(df) * 100 for i in range(1, 10)]
})
word_count_df.to_csv(os.path.join(output_dir, 'word_count_distribution.csv'), index=False)

# ============================================================
# 3. VERİ KALİTE DENETİMİ (DATA QUALITY AUDIT)
# ============================================================
print("\n\n3. VERİ KALİTE DENETİMİ")
print("-" * 60)

# Eksik değerler
print("EKSİK DEĞER ANALİZİ:")
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(2)
missing_df = pd.DataFrame({'eksik_sayi': missing, 'eksik_yuzde': missing_pct})
missing_df = missing_df[missing_df['eksik_sayi'] > 0].sort_values('eksik_sayi', ascending=False)
print(missing_df.to_string())

# Copy duplicate kontrolü
print("\n\nCOPY DUPLICATE KONTROLÜ:")
dup_id = df['id'].duplicated().sum()
dup_term = df['term'].duplicated().sum()
dup_term_norm = df['normalizedTerm'].duplicated().sum()
print(f"  ID duplicate: {dup_id}")
print(f"  Term duplicate: {dup_term}")
print(f"  NormalizedTerm duplicate: {dup_term_norm}")

# Term duplicate detayı
if dup_term > 0:
    dup_terms = df[df['term'].duplicated(keep=False)].sort_values('term')
    print(f"\n  Duplicate terimler (ilk 20):")
    print(dup_terms[['term','domain','cefrLevel','id']].head(20).to_string())

# Boş string kontrolü
print("\n\nBOŞ STRING KONTROLÜ:")
for col in ['term', 'turkishMeaning', 'definition', 'exampleSentence', 'turkishExample']:
    empty = (df[col] == '').sum()
    whitespace = (df[col].str.strip() == '').sum()
    print(f"  {col}: boş={empty}, sadece boşluk={whitespace}")

# Kategori kapsama analizi
print("\n\nKATEGORİ KAPSAMA ANALİZİ (Domain başına):")
cat_coverage = df.groupby('domain').agg(
    toplam_kelime=('term','count'),
    kategori_sayisi=('category','nunique'),
    kategori_listesi=('category', lambda x: list(x.unique())[:10])
).sort_values('toplam_kelime', ascending=False)
print(cat_coverage[['toplam_kelime','kategori_sayisi']].to_string())

# ImportTier x Domain
print("\n\nIMPORT TIER x DOMAIN:")
import_domain = pd.crosstab(df['importTier'], df['domain'], margins=True, margins_name='TOPLAM')
print(import_domain.to_string())

# ============================================================
# 4. SEO CONTENT ANALYSIS - TOPIC CLUSTERING
# ============================================================
print("\n\n4. SEO CONTENT ANALYSIS - TOPIC CLUSTERING")
print("-" * 60)

# Her domain için ana kategoriler (pillar page adayları)
for domain in df['domain'].unique():
    if domain in ['general-english']: continue
    subset = df[df['domain']==domain]
    top_cats = subset['category'].value_counts().head(10)
    print(f"\n{domain.upper()} - Top 10 Kategori (Pillar Page Adayları):")
    for cat, cnt in top_cats.items():
        cefr_dist = subset[subset['category']==cat]['cefrLevel'].value_counts().sort_index()
        cefr_str = ", ".join([f"{k}:{v}" for k,v in cefr_dist.items()])
        print(f"  {cat}: {cnt} kelime [CEFR: {cefr_str}]")

# Content gap analizi - hangi CEFR seviyeleri eksik
print("\n\nCONTENT GAP ANALİZİ (Domain x CEFR eksiklikler):")
for domain in sorted(df['domain'].unique()):
    if domain == 'general-english': continue
    subset = df[df['domain']==domain]
    cefr_counts = subset['cefrLevel'].value_counts()
    missing_cefr = [c for c in ['A1','A2','B1','B2','C1','C2'] if c not in cefr_counts.index]
    low_cefr = {c:v for c,v in cefr_counts.items() if v < 10}
    if missing_cefr or low_cefr:
        print(f"  {domain}: Eksik CEFR={missing_cefr}, Az (<10)={low_cefr}")

# ============================================================
# 5. SCHEMA/JSON-LD GENERATION
# ============================================================
print("\n\n5. SCHEMA/JSON-LD ÖRNEK ÜRETİMİ")
print("-" * 60)

# Her domain için birer schema.org/DefinedTerm seti örneği
schema_examples = []
for domain in ['electrical', 'software', 'mechanical', 'civil']:
    subset = df[df['domain']==domain].head(3)
    for _, row in subset.iterrows():
        schema = {
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            "name": row['term'],
            "description": row['definition'],
            "inDefinedTermSet": {
                "@type": "DefinedTermSet",
                "name": f"EngineerOS {domain.capitalize()} Vocabulary"
            },
            "termCode": row['id'],
            "turkishEquivalent": row['turkishMeaning'],
            "cefrLevel": row['cefrLevel'],
            "domain": domain,
            "category": row['category'],
            "partOfSpeech": row['partOfSpeech'],
            "exampleSentence": row['exampleSentence'],
            "turkishExample": row['turkishExample'],
            "confidence": row['confidence'],
            "isCore": bool(row['isCore']),
            "isTechnical": bool(row['isTechnical'])
        }
        schema_examples.append(schema)

with open(os.path.join(output_dir, 'schema_examples.json'), 'w', encoding='utf-8') as f:
    json.dump(schema_examples, f, ensure_ascii=False, indent=2)
print(f"Schema örnekleri kaydedildi: {output_dir}/schema_examples.json ({len(schema_examples)} adet)")

# Full schema set (her domain için bir DefinedTermSet)
schema_sets = []
for domain in sorted(df['domain'].unique()):
    if domain == 'general-english': continue
    count = len(df[df['domain']==domain])
    schema_set = {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "name": f"EngineerOS {domain.capitalize()} Engineering Vocabulary",
        "description": f"{count} technical terms for {domain} engineering domain, CEFR A1-C2",
        "numberOfTerms": count,
        "inLanguage": "en-TR",
        "audience": {
            "@type": "Audience",
            "audienceType": "Engineering professionals and students"
        }
    }
    schema_sets.append(schema_set)

with open(os.path.join(output_dir, 'schema_termsets.json'), 'w', encoding='utf-8') as f:
    json.dump(schema_sets, f, ensure_ascii=False, indent=2)
print(f"Term set şemaları kaydedildi: {output_dir}/schema_termsets.json ({len(schema_sets)} adet)")

# ============================================================
# 6. EXPORT/TRANSFORM
# ============================================================
print("\n\n6. EXPORT/TRANSFORM")
print("-" * 60)

# CSV export
df.to_csv(os.path.join(output_dir, 'genel7_full.csv'), index=False, encoding='utf-8')
print(f"CSV: {output_dir}/genel7_full.csv")

# JSON export (lines format for ML)
df.to_json(os.path.join(output_dir, 'genel7_full.jsonl'), orient='records', lines=True, force_ascii=False)
print(f"JSONL: {output_dir}/genel7_full.jsonl")

# SQL CREATE TABLE + INSERT
sql_lines = []
sql_lines.append("-- EngineerOS Genel7 Vocabulary Database")
sql_lines.append("CREATE TABLE vocabulary_terms (")
sql_lines.append("    id VARCHAR(100) PRIMARY KEY,")
sql_lines.append("    term VARCHAR(500) NOT NULL,")
sql_lines.append("    normalized_term VARCHAR(500),")
sql_lines.append("    turkish_meaning TEXT,")
sql_lines.append("    cefr_level VARCHAR(10),")
sql_lines.append("    domain VARCHAR(100),")
sql_lines.append("    content_domain VARCHAR(100),")
sql_lines.append("    life_context VARCHAR(100),")
sql_lines.append("    register VARCHAR(50),")
sql_lines.append("    primary_use_case VARCHAR(100),")
sql_lines.append("    category VARCHAR(200),")
sql_lines.append("    term_type VARCHAR(50),")
sql_lines.append("    part_of_speech VARCHAR(50),")
sql_lines.append("    word_count INTEGER,")
sql_lines.append("    definition TEXT,")
sql_lines.append("    example_sentence TEXT,")
sql_lines.append("    turkish_example TEXT,")
sql_lines.append("    related_terms TEXT,")
sql_lines.append("    common_mistakes TEXT,")
sql_lines.append("    grammar_fits TEXT,")
sql_lines.append("    skill_use TEXT,")
sql_lines.append("    tags TEXT,")
sql_lines.append("    source TEXT,")
sql_lines.append("    confidence DECIMAL(3,2),")
sql_lines.append("    status VARCHAR(50),")
sql_lines.append("    import_tier VARCHAR(100),")
sql_lines.append("    is_core BOOLEAN,")
sql_lines.append("    is_technical BOOLEAN,")
sql_lines.append("    is_professional_phrase BOOLEAN,")
sql_lines.append("    is_contractual BOOLEAN,")
sql_lines.append("    is_daily_site_english BOOLEAN,")
sql_lines.append("    is_life_wide_english BOOLEAN,")
sql_lines.append("    review_reason TEXT,")
sql_lines.append("    variant_of VARCHAR(200),")
sql_lines.append("    grammar_domain_alias VARCHAR(100),")
sql_lines.append("    qc_repair_notes TEXT")
sql_lines.append(");")

# Insert statements (sample 100)
sample = df.head(100)
for _, row in sample.iterrows():
    vals = []
    for col in df.columns:
        val = row[col]
        if pd.isna(val):
            vals.append('NULL')
        elif isinstance(val, bool):
            vals.append('TRUE' if val else 'FALSE')
        elif isinstance(val, (int, float)):
            vals.append(str(val))
        else:
            escaped = str(val).replace("'", "''")
            vals.append(f"'{escaped}'")
    sql_lines.append(f"INSERT INTO vocabulary_terms VALUES ({', '.join(vals)});")

with open(os.path.join(output_dir, 'genel7_schema.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))
print(f"SQL: {output_dir}/genel7_schema.sql (ilk 100 kayıt)")

# Sitemap XML
sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
base_url = "https://engineeros.com/vocabulary"
for domain in sorted(df['domain'].unique()):
    if domain == 'general-english': continue
    sitemap_lines.append(f'  <url><loc>{base_url}/{domain}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')
    # Category pages
    for cat in df[df['domain']==domain]['category'].unique()[:20]:
        cat_slug = cat.lower().replace(' ', '-').replace('/', '-')
        sitemap_lines.append(f'  <url><loc>{base_url}/{domain}/{cat_slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>')
sitemap_lines.append('</urlset>')

with open(os.path.join(output_dir, 'sitemap_vocabulary.xml'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(sitemap_lines))
print(f"Sitemap: {output_dir}/sitemap_vocabulary.xml")

# ============================================================
# 7. ML/NLP TRAINING DATA PREP
# ============================================================
print("\n\n7. ML/NLP TRAINING DATA PREP")
print("-" * 60)

# Classification datasets
# Task 1: Domain classification
domain_clf = df[['term', 'definition', 'domain']].copy()
domain_clf.to_csv(os.path.join(output_dir, 'ml_domain_classification.csv'), index=False)
print(f"Domain classification: {output_dir}/ml_domain_classification.csv ({len(domain_clf)} samples)")

# Task 2: CEFR level prediction
cefr_clf = df[['term', 'definition', 'exampleSentence', 'cefrLevel']].copy()
cefr_clf.to_csv(os.path.join(output_dir, 'ml_cefr_prediction.csv'), index=False)
print(f"CEFR prediction: {output_dir}/ml_cefr_prediction.csv ({len(cefr_clf)} samples)")

# Task 3: Technical vs Non-technical binary
tech_clf = df[['term', 'definition', 'isTechnical']].copy()
tech_clf['label'] = tech_clf['isTechnical'].astype(int)
tech_clf.to_csv(os.path.join(output_dir, 'ml_technical_binary.csv'), index=False)
print(f"Technical binary: {output_dir}/ml_technical_binary.csv ({len(tech_clf)} samples)")

# Task 4: Category classification (multi-label per domain)
for domain in ['electrical', 'software', 'mechanical', 'civil']:
    subset = df[df['domain']==domain][['term', 'definition', 'category']].copy()
    if len(subset) > 50:
        subset.to_csv(os.path.join(output_dir, f'ml_category_{domain}.csv'), index=False)
        print(f"Category ({domain}): {output_dir}/ml_category_{domain}.csv ({len(subset)} samples)")

# Task 5: Turkish translation pairs (for MT)
mt_data = df[['term', 'turkishMeaning', 'definition', 'exampleSentence', 'turkishExample', 'domain']].copy()
mt_data.to_csv(os.path.join(output_dir, 'ml_translation_pairs.csv'), index=False)
print(f"Translation pairs: {output_dir}/ml_translation_pairs.csv ({len(mt_data)} samples)")

# Tokenization stats
print("\nTOKENİZASYON İSTATİSTİKLERİ:")
term_lengths = df['term'].str.len()
def_lengths = df['definition'].str.len()
ex_lengths = df['exampleSentence'].str.len()
print(f"  Term uzunluğu: ort={term_lengths.mean():.0f}, med={term_lengths.median():.0f}, max={term_lengths.max()}")
print(f"  Tanım uzunluğu: ort={def_lengths.mean():.0f}, med={def_lengths.median():.0f}, max={def_lengths.max()}")
print(f"  Örnek cümle: ort={ex_lengths.mean():.0f}, med={ex_lengths.median():.0f}, max={ex_lengths.max()}")

# Vocabulary size
all_words = ' '.join(df['term'].tolist() + df['definition'].tolist() + df['exampleSentence'].tolist()).split()
unique_words = set(all_words)
print(f"  Toplam token: {len(all_words):,}")
print(f"  Benzersiz token: {len(unique_words):,}")

# ============================================================
# 8. CONTENT BRIEF OUTLINES (SEO)
# ============================================================
print("\n\n8. SEO CONTENT BRIEF OUTLINES")
print("-" * 60)

briefs = []
for domain in sorted(df['domain'].unique()):
    if domain == 'general-english': continue
    subset = df[df['domain']==domain]
    total = len(subset)
    cats = subset['category'].value_counts()
    
    # Pillar page candidate (en büyük kategori)
    pillar_cat = cats.index[0]
    pillar_count = cats.iloc[0]
    
    # Cluster pages (diğer kategoriler)
    clusters = []
    for cat, cnt in cats.head(8).items():
        cefr_dist = subset[subset['category']==cat]['cefrLevel'].value_counts().sort_index()
        cefr_str = ", ".join([f"{k}:{v}" for k,v in cefr_dist.items()])
        clusters.append({
            "category": cat,
            "word_count": int(cnt),
            "cefr_distribution": cefr_str,
            "target_keywords": f"{domain} {cat.lower()}"
        })
    
    brief = {
        "domain": domain,
        "total_terms": int(total),
        "pillar_page": {
            "category": pillar_cat,
            "word_count": int(pillar_count),
            "suggested_title": f"{domain.capitalize()} Engineering: {pillar_cat} - Complete Vocabulary Guide",
            "target_keyword": f"{domain} {pillar_cat.lower()}"
        },
        "cluster_pages": clusters,
        "cefr_coverage": {k: int(v) for k, v in subset['cefrLevel'].value_counts().sort_index().items()},
        "import_tiers": {k: int(v) for k, v in subset['importTier'].value_counts().items()}
    }
    briefs.append(brief)

with open(os.path.join(output_dir, 'seo_content_briefs.json'), 'w', encoding='utf-8') as f:
    json.dump(briefs, f, ensure_ascii=False, indent=2)
print(f"Content briefs: {output_dir}/seo_content_briefs.json ({len(briefs)} domain)")

# ============================================================
# ÖZET RAPOR
# ============================================================
print("\n\n" + "=" * 80)
print("GENEL ÖZET")
print("=" * 80)
print(f"Toplam Terim: {len(df):,}")
print(f"Domain Sayısı: {df['domain'].nunique()}")
print(f"Kategori Sayısı: {df['category'].nunique()}")
print(f"CEFR Dağılımı: {dict(df['cefrLevel'].value_counts().sort_index())}")
print(f"Teknik Terim Oranı: %{df['isTechnical'].mean()*100:.1f}")
print(f"Core Vocabulary: {df['isCore'].sum()} ({df['isCore'].mean()*100:.1f}%)")
print(f"Ortalama Confidence: {df['confidence'].mean():.3f}")
print(f"\nÇıktı Dizini: {output_dir}")
print("Dosyalar:")
for f in sorted(os.listdir(output_dir)):
    size = os.path.getsize(os.path.join(output_dir, f))
    print(f"  {f} ({size:,} bytes)")