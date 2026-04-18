# EFHA 101 - Profesyonel Skor Analiz Uygulaması

EFHA 101, 101 Okey oyunları için geliştirilmiş, derinlemesine performans analizi sunan modern bir skor takip uygulamasıdır.

## Özellikler

- **Esnek Oyun Modları:** Tekli (4 kişi) veya Eşli (2 takım) oyun desteği.
- **Otomatik İsimlendirme:** İsim girilmediğinde otomatik oyuncu/takım ataması.
- **Dinamik Renk Sistemi:** Takımlara özel renkler ve el kazananına göre renklenen el göstergeleri.
- **Beraberlik Takibi:** Berabere biten eller için özel sarı renk göstergesi.
- **17 El Sabit Oyun:** 101 Okey standartlarına uygun 17 el takibi.
- **Gelişmiş Analizler:**
  - **Kümülatif Skor Grafiği:** Oyun boyu puan gelişimi.
  - **Delta Analizi:** El bazlı performans değişimleri.
  - **Pro Level (Standart Sapma):** Oyuncu istikrar analizi.
  - **Momentum:** Son el trendleri.
- **Kayıt Sistemi:** Geçmiş 50 oyunu cihazınızda saklar.

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

1. Depoyu klonlayın:
   ```bash
   git clone <repo-url>
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Teknolojiler

- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Animasyonlar)
- **Recharts** (Veri Görselleştirme)
- **Lucide React** (İkonlar)

## Lisans

Apache-2.0
