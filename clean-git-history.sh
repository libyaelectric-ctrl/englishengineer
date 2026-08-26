#!/usr/bin/env bash
# Git geçmişinden sızmış "sample/" klasörünü ve içindeki üçüncü taraf
# anahtarlarını (pk_live_..., JWE token'ları) tamamen temizler.
#
# UYARI: Bu işlem repo geçmişini yeniden yazar (commit hash'leri değişir).
# Force-push sonrası tüm collaborator'ların repoyu YENİDEN clone etmesi
# gerekir; mevcut lokal branch'ler/PR'lar bozulabilir.
#
# Kullanım:
#   1. Bu scripti repo'nun bulunduğu üst dizine koyup çalıştırın, ya da
#      REPO_DIR değişkenini kendi repo yolunuza göre düzenleyin.
#   2. git filter-repo kurulu olmalı: pip install git-filter-repo
#      (brew install git-filter-repo de olur)

set -euo pipefail

REPO_DIR="${1:-.}"
cd "$REPO_DIR"

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo bulunamadı. Kurulum için:"
  echo "  pip install git-filter-repo"
  echo "veya"
  echo "  brew install git-filter-repo"
  exit 1
fi

echo "Mevcut branch: $(git branch --show-current)"
echo "Bu işlem 'sample/' klasörünü TÜM geçmişten kaldıracak."
read -p "Devam etmek istiyor musunuz? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "İptal edildi."
  exit 0
fi

# sample/ klasörünü tüm geçmişten kaldır
git filter-repo --path "sample/" --invert-paths --force

echo ""
echo "Temizlik tamamlandı. Şimdi:"
echo "  1. Uzak repo bağlantısını yeniden ekleyin (filter-repo bazen kaldırır):"
echo "     git remote add origin <repo-url>"
echo "  2. Force-push yapın:"
echo "     git push origin --force --all"
echo "     git push origin --force --tags"
echo "  3. TÜM collaborator'lara repoyu yeniden clone etmelerini söyleyin."
echo "  4. sample/ klasörünü .gitignore'a ekleyin ki tekrar commit edilmesin."
