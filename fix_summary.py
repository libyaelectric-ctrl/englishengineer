import pandas as pd, os, json

output_dir = r'C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0\analysis_output'

# Final veriyi oku
final_df = pd.read_csv(os.path.join(output_dir, 'genel7_final.csv'))

# gene8.json'ı düzelt - sadece yeni eklenen terimleri içermeli
# Yeni eklenen terimler c2 gap-fill terimleridir
gap_terms = final_df[final_df['source'] == 'EngineerOS gap-fill batch 2026']

# gene8.json'u sadece yeni terimlerle yeniden yaz
gap_terms_dict = gap_terms.to_dict('records')
with open(os.path.join(output_dir, 'genel8.json'), 'w', encoding='utf-8') as f:
    json.dump(gap_terms_dict, f, ensure_ascii=False, indent=2)

# Yeni eklenen domain sayıları
ind_new = len(gap_terms[gap_terms['domain']=='industrial'])
mech_new = len(gap_terms[gap_terms['domain']=='mechatronics'])

# Summary dosyasını yeniden yaz
with open(os.path.join(output_dir, 'gene8_summary.txt'), 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("GENEL8 - GENEL7 ANALIZ SONUÇ DOSYASI\n")
    f.write("=" * 80 + "\n")
    f.write("Oluşturulma Tarihi: 2026-07-30\n")
    f.write("Orijinal Veri: Genel7.xlsx (14,622 kayit)\n")
    f.write(f"Temizlenmis + Genisletilmis Veri: genel7_final.csv ({len(final_df)} kayit)\n")
    f.write(f"Yeni C2 Gap-Fill Kayit (gene8): genel8.json ({len(gap_terms)} kayit)\n\n")

    f.write("DUPLICATE TEMIZLEME SONUCU:\n")
    f.write("  - Çikarilan kayit: 0 (term+domain benzersizdi)\n")
    f.write(f"  - Kalan kayit: {len(final_df)}\n")
    f.write("  - Cross-domain duplicate terimler: 414 adet (farkli domainlerde ayni kelime - dogal)\n\n")

    f.write("CEFR GAP DOLDURMA SONUCU:\n")
    f.write(f"  - Industrial C2 yeni terim: {ind_new}\n")
    f.write(f"  - Mechatronics C2 yeni terim: {mech_new}\n")
    f.write(f"  - Industrial C2 önce: 6, sonra: {6 + ind_new}\n")
    f.write(f"  - Mechatronics C2 önce: 5, sonra: {5 + mech_new}\n\n")

    f.write("YENI TERIM LISTESI (gene8):\n")
    for _, row in gap_terms.iterrows():
        f.write(f"  [{row['cefrLevel']}] [{row['domain']}] {row['term']} -> {row['turkishMeaning']}\n")

    f.write("\nCIKTI DOSYALARI:\n")
    f.write("  - genel7_cleaned.csv (temizlenmis orijinal veri)\n")
    f.write("  - genel7_final.csv (temiz + gap-fill birlestirilmis)\n")
    f.write("  - genel8.json (sadece yeni C2 terimleri)\n")
    f.write("  - gene8_summary.txt (bu dosya)\n")

print(f"gene8.json düzeltildi: {len(gap_terms)} yeni C2 terimi")
print(f"Industrial C2 yeni: {ind_new}")
print(f"Mechatronics C2 yeni: {mech_new}")
print(f"genel7_final.csv: {len(final_df)} kayit")
print(f"gene8_summary.txt: yeniden yazildi")
