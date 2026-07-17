export const examples: Record<string, string[]> = {
  'Electrical Engineering': [
    '{term} devreye alma sırasında saha denetim ekibi tarafından denetlendi.',
    '{term} devre enerjilmeden önce tüm güvenlik kontrolleri yapılmalıdır.',
    '{term} proje şartnamesinde belirtilen kriterleri karşılamalıdır.',
    '{term} için yapılan test sonuçları belgeleme dosyasına işlendi.',
  ],
  'Mechanical Engineering': [
    '{term} mekanik tamamlama incelemesi sırasında detaylı olarak kontrol edildi.',
    '{term} çalıştırma öncesi düzgün şekilde monte edilmeli ve test edilmelidir.',
    '{term} performansı tasarım kriterlerine göre bağımsız olarak doğrulandı.',
    '{term} operasyonel hazırlık kontrol listesinde zorunlu olarak yer alıyor.',
  ],
  'Civil Engineering': [
    '{term} bir sonraki inşaat aşamasına geçmeden önce kapsamlı şekilde denetlendi.',
    '{term} yapısal tasarım şartnamelerine ve yerel yönetmeliklere uygun olmalıdır.',
    '{term} saha muayenesi sırasında müteahhit firması tarafından doğrulandı.',
    '{term} kalite kontrol kaydına tarih ve imza ile birlikte işlendi.',
  ],
  Architecture: [
    '{term} tasarım koordinasyon toplantısında tüm paydaşlar tarafından gözden geçirildi.',
    '{term} mimari niyet, fonksiyonellik ve şartnamelerle tam uyumlu olmalıdır.',
    '{term} mimar proje gereksinimlerini karşıladığını resmi olarak onayladı.',
    '{term} bitiş programında ilgili aşama ile birlikte yer alıyor.',
  ],
  Construction: [
    '{term} bir sonraki iş cephesine geçmeden önce saha şefi tarafından kontrol edildi.',
    '{term} saha şefi tarafından günlük yürüyüş sırasında doğrulandı ve kaydedildi.',
    '{term} kontrol talebi gönderilmeden önce tamamlanmış ve hazır olmalıdır.',
    '{term} iş sırası ve programına göre planlanarak uygulandı.',
  ],
  Commissioning: [
    '{term} devreye alma kontrol listesi sırasında adım adım test edildi.',
    '{term} sistem enerjilmesi öncesi bağımsız olarak doğrulanmalıdır.',
    '{term} test sonuçları commissioning ekibi tarafından resmi olarak belgelendi.',
    '{term} operasyonel hazırlık durumunda kalite kontrol tarafından onaylandı.',
  ],
  'QA/QC': [
    '{term} kontrol kaydına tarih, sorumlu kişi ve sonuç ile birlikte işlendi.',
    '{term} onay öncesi belirlenen kabul kriterlerini eksiksiz karşılamalıdır.',
    '{term} kalite kontrol mühendisi tarafından şartnameye göre doğrulandı.',
    '{term} uygunluk matrisinde ilgili madde ile birlikte yer alıyor.',
  ],
  HSE: [
    '{term} güvenlik brifingi sırasında tüm ekip tarafından gözden geçirildi.',
    '{term} çalışma başlamadan önce sahada yerinde hazır olmalıdır.',
    '{term} saha denetimi sırasında güvenlik memuru tarafından kontrol edildi.',
    '{term} acil durum müdahalesi planında referans olarak kullanıldı.',
  ],
  'Project Management': [
    '{term} haftalık ilerleme raporunda proje yöneticisi tarafından güncellendi.',
    '{term} proje kilometre taşı programını doğrudan etkiliyor.',
    '{term} proje yöneticisi tarafından durum toplantısında detaylı olarak incelendi.',
    '{term} risk defterine öncelik seviyesi ile birlikte kaydedildi.',
  ],
};

export function resolveExample(template: string, term: string): string {
  return template.replace(/\{term\}/g, term);
}
