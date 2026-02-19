# CALENDIQ – TABLET LOCAL-FIRST MVP
## Product Requirements Document (PRD)

---

## 1. Ürün Tanımı

Calendiq, **10.5 inç tablet** için optimize edilmiş, **local-first** çalışan, **tek kullanıcılı** bir takvim uygulamasıdır. Web tabanlıdır ve **PWA** olarak tablet ana ekranına eklenebilir. Web browser'da da çalışabilir.

- Uygulama internet bağlantısı olmadan takvim verilerini çalıştırabilir.
- AI parsing için internet bağlantısı gereklidir; ancak takvim verisi tamamen cihaz üzerinde saklanır.
- Oscar entegrasyonu bu aşamada **yoktur**. Calendiq tamamen bağımsızdır.

---

## 2. Mimari Yaklaşım

### Genel Yapı
Frontend ağırlıklı bir mimari benimsenir.

### Veri Katmanı
- **Primary Storage:** IndexedDB
- **Yaklaşım:** Local-first
- **Prensip:** Event verileri hiçbir zaman cloud'a bağlı olmamalıdır. Tüm veriler tamamen cihazda tutulur.

### Backend
- Kalıcı bir backend servisi **yoktur**.
- Yalnızca OpenAI API çağrıları için **Vercel Serverless Function** üzerinde minimal bir proxy endpoint kullanılır.
- Bu proxy endpoint'in tek görevi: tablet'ten gelen mesajı alıp OpenAI'a iletmek ve cevabı dönmektir.
- OpenAI API key bu proxy içinde **Vercel environment variable** olarak saklanır. Kaynak koduna ve bundle'a **asla girmez**.

---

## 3. Deployment ve API Key Güvenliği

### Strateji
Proje GitHub'da açık kaynak olarak yayınlanacağı için API key güvenliği şu şekilde sağlanır:

- **PWA (Frontend):** GitHub reposunda yer alır, Vercel veya benzeri bir statik host üzerinden yayınlanır.
- **Proxy Endpoint:** Aynı Vercel projesinde bir `api/` klasörü içinde serverless function olarak yer alır.
- **OpenAI API Key:** Vercel Dashboard → Project Settings → Environment Variables bölümüne eklenir. `.env` dosyasına yazılır, `.gitignore`'a eklenir, asla commit edilmez.

### Kullanıcı Kurulum Adımları (README'de belgelenecek)
1. Repo fork'lanır veya clone'lanır.
2. Vercel'e deploy edilir.
3. Vercel Environment Variables bölümüne `OPENAI_API_KEY` eklenir.
4. Deploy tamamlanır, PWA tablet'e yüklenir.

---

## 4. Uygulama Giriş Akışı

### İlk Açılış – Kurulum Ekranı
Uygulama ilk kez açıldığında bir **kurulum (onboarding) ekranı** gösterilir. Bu ekran yalnızca bir kez görünür ve tamamlandıktan sonra bir daha gösterilmez.

Kurulum ekranında kullanıcıdan alınan bilgiler:

| Alan | Tür | Zorunlu |
|---|---|---|
| Ad | Text input | Evet |
| Soyad | Text input | Evet |
| Doğum Tarihi | Date picker | Evet |
| PIN (4 haneli) | PIN input | Evet |
| PIN Tekrar | PIN input | Evet |

- PIN yalnızca rakamlardan oluşur, 4 haneli olmalıdır.
- PIN doğrulama: iki giriş eşleşmiyorsa hata gösterilir.
- Tüm bilgiler IndexedDB'deki `user_profile` store'unda saklanır.
- Kurulum tamamlandıktan sonra kullanıcı doğrudan ana ekrana yönlendirilir.

### Sonraki Açılışlar – PIN Ekranı
Uygulama her açıldığında (veya arka plandan öne alındığında) **4 haneli PIN ekranı** gösterilir.

- Kullanıcı PIN'ini girer.
- Doğruysa ana ekrana geçilir.
- Yanlışsa hata mesajı gösterilir.
- PIN ekranı basit, sade ve tablet dokunmatik kullanımına uygun olmalıdır.
- PIN sıfırlama bu MVP'de **yoktur**.

---

## 5. Teknik Stack

### Frontend
| Katman | Teknoloji |
|---|---|
| Framework | React |
| Dil | TypeScript |
| Stil | TailwindCSS |
| UI Components | shadcn/ui |
| Takvim | FullCalendar (community edition) |
| Local Storage | IndexedDB – Dexie.js wrapper |

### Backend / Proxy
| Katman | Teknoloji |
|---|---|
| Proxy | Vercel Serverless Function (`/api/ai`) |
| AI | OpenAI API (GPT-4o önerilir) |
| Speech to Text | Deepgram API |
| Key Yönetimi | Vercel Environment Variables |

### Diğer
| Özellik | Teknoloji |
|---|---|
| PWA | Vite PWA Plugin veya manuel manifest + service worker |
| Validation | Zod |

---

## 6. Veri Modeli

### `user_profile` Store
Kullanıcıya ait profil ve PIN bilgisi.

```typescript
interface UserProfile {
  id: 1; // sabit, tek kullanıcı
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 format: "YYYY-MM-DD"
  pinHash: string;   // PIN düz metin olarak saklanmaz, hash'lenir (örn. SHA-256)
  createdAt: string;
}
```

### `events` Store
Tüm takvim event'leri.

```typescript
interface CalendarEvent {
  id: string;          // UUID
  title: string;
  description?: string;
  location?: string;
  start: string;       // ISO 8601
  end: string;         // ISO 8601
  allDay: boolean;
  color?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'planned' | 'done' | 'cancelled';
  reminder?: number;   // Dakika cinsinden hatırlatıcı (0, 5, 10, 15, 30, 60, 1440=1gün)
  createdAt: string;
  updatedAt: string;
}
```

### `chat_messages` Store
AI ile yapılan konuşma geçmişi.

```typescript
interface ChatMessage {
  id: string;          // UUID
  userMessage: string;
  aiResponse?: string;
  timestamp: string;   // ISO 8601
  actionType?: string; // CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT, QUERY_EVENTS
  actionPayload?: any; // İlgili action'ın payload'ı
}
```

---

## 7. Chat ve AI Akışı

### Akış Adımları (Text)
1. Kullanıcı chat paneline doğal dilde bir komut yazar.
2. Mesaj Vercel proxy endpoint'ine gönderilir (`/api/ai`).
3. Proxy, mesajı OpenAI API'ye iletir ve JSON action döner.
4. Dönen JSON, frontend'de Zod schema ile doğrulanır.
5. Geçerli action, local event store (IndexedDB) üzerine uygulanır.
6. Takvim UI'ı güncellenir.
7. Mesaj ve cevap `chat_messages` store'una kaydedilir.

### Akış Adımları (Voice)
1. Kullanıcı mikrofon butonuna basar.
2. Ses kaydedilir ve Deepgram API'ye gönderilir (proxy üzerinden).
3. Deepgram transcript döner, chat input'a yazılır.
4. Kullanıcı onaylarsa text flow devam eder.

### Önemli Kurallar
- AI hiçbir zaman doğrudan state değiştirmez.
- Her zaman bir **action objesi** üretir ve bu action uygulanır.
- İnternet bağlantısı yoksa kullanıcı bilgilendirilir ve **manuel event ekleme** modu kullanılabilir.
- Chat geçmişi sınırsız olarak saklanır.

### Action Şeması (Örnek)
```typescript
type AIAction =
  | { type: 'CREATE_EVENT'; payload: Partial<CalendarEvent> }
  | { type: 'UPDATE_EVENT'; id: string; payload: Partial<CalendarEvent> }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'QUERY_EVENTS'; filter: object };
```

---

## 8. Conflict Detection

Çakışma kontrolü tamamen **local** olarak yapılır, herhangi bir sunucu çağrısı gerekmez.

### Kontrol Mantığı
- Yeni bir event oluşturulurken veya mevcut bir event güncellenirken, aynı zaman aralığındaki tüm event'lerle karşılaştırma yapılır.
- `start` ve `end` aralıkları kesişiyorsa çakışma tespit edilir.
- Kullanıcıya bildirim gösterilir: **"Bu saatte başka bir etkinlik var."**

### MVP Kapsamı
- Çakışma tespiti: **Var**
- Kullanıcı bildirimi: **Var**
- Alternatif slot önerisi: **MVP dışı** (ileride eklenebilir)

---

## 9. Manuel Event CRUD UI

### Özellikler
AI olmadan da tam event yönetimi yapılabilmelidir.

- **Create:** "+" butonu ile yeni event modal'ı açılır
- **Read:** Event'e tıklanınca detay modal'ı açılır
- **Update:** Event modal'ında düzenleme yapılabilir
- **Delete:** Event modal'ında silme butonu

### Form Alanları
- Title (zorunlu)
- Description (opsiyonel)
- Start date/time (zorunlu)
- End date/time (zorunlu)
- All day toggle
- Location (opsiyonel)
- Color picker (opsiyonel)
- Priority selector (low/medium/high)
- Status selector (planned/done/cancelled)
- Tags input (opsiyonel)

---

## 10. Reminder ve Bildirim Sistemi

### Genel Yaklaşım
Her event için opsiyonel hatırlatıcı (reminder) ayarlanabilir. Hatırlatıcı vakti geldiğinde kullanıcıya **browser notification** gönderilir.

### Reminder Seçenekleri
- 0 dakika (event başladığında)
- 5 dakika önce
- 10 dakika önce
- 15 dakika önce
- 30 dakika önce
- 1 saat önce (60 dakika)
- 1 gün önce (1440 dakika)

### Teknik Uygulama
- **Web Notifications API** kullanılır
- Kullanıcıdan ilk kez bildirim izni istenir
- Service Worker üzerinden background notification desteği sağlanır
- PWA kapalıyken de bildirim gönderilebilir (service worker aktifse)
- Reminder check service her dakika çalışır ve yaklaşan event'leri kontrol eder

### MVP Kapsamı
- Manuel event oluşturma/düzenleme sırasında reminder seçilebilir
- AI komutlarında "10 dakika önce hatırlat" gibi ifadeler parse edilir
- Bildirim gönderimi: **Var**
- Bildirime tıklayınca event detayı: **Var**
- Snooze özelliği: **MVP dışı** (ileride eklenebilir)

---

## 11. Tablet Layout

### Genel Yapı
Sabit iki kolon, **10.5 inç yatay (landscape) tablet** için optimize edilmiştir. Web browser'da da çalışır.

| Kolon | İçerik | Genişlik |
|---|---|---|
| Sol | Haftalık takvim (FullCalendar week view) | ~65% |
| Sağ | Chat paneli (geçmiş + input) | ~35% |

### Layout Kuralları
- Mobil responsive **yoktur**.
- Layout sabit kalır (desktop/tablet için).
- Tüm dokunmatik hedefler tablet parmak kullanımına uygun boyutta olmalıdır (min. 44px).
- shadcn/ui bileşenleri kullanılacak.

---

## 12. PWA Özellikleri

| Özellik | Durum |
|---|---|
| Web App Manifest | Var |
| Service Worker (offline cache) | Var |
| Ana ekrana eklenebilir | Var |
| Offline çalışma (takvim verisi) | Var |
| Offline AI | Yok (internet gerekir) |

Amaç: Tablet üzerinde native uygulama hissi vermek.

### Manifest Örneği
```json
{
  "name": "Calendiq",
  "short_name": "Calendiq",
  "display": "standalone",
  "orientation": "landscape",
  "start_url": "/",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 12. Uygulama Akış Özeti

```
İlk Açılış
    │
    ▼
Kurulum Ekranı
(Ad, Soyad, Doğum Tarihi, PIN)
    │
    ▼
Ana Ekran (Takvim + Chat)

────────────────────────────

Sonraki Açılışlar
    │
    ▼
PIN Ekranı
    │
  Doğru PIN
    │
    ▼
Ana Ekran (Takvim + Chat)
```

---

## 13. MVP Dışı Özellikler

Aşağıdaki özellikler bu MVP kapsamında **yoktur**:

- Cloud sync
- Multi-device senkronizasyon
- Multi-user desteği
- Authentication (JWT, OAuth vb.)
- Tekrarlayan event'ler (recurring events)
- Bildirim sistemi (push notification)
- Timezone yönetimi
- Gerçek bir backend servisi
- PIN sıfırlama akışı
- Alternatif slot önerisi (conflict'te)

---

## 14. İleride Oscar Entegrasyonu

Calendiq şu an tamamen bağımsız bir local takvim uygulamasıdır. Ancak mimari Oscar entegrasyonuna hazır olacak şekilde tasarlanmalıdır.

### Geçişi Kolaylaştıracak Kararlar
- Event store, soyut bir **repository pattern** ile yazılmalıdır. (`IEventRepository` interface'i, `IndexedDBEventRepository` implementasyonu)
- Böylece ileride `IndexedDBEventRepository` yerine `OscarAPIEventRepository` geçirilebilir, üst katman hiç değişmez.
- Oscar, REST API üzerinden iletişim kuracaktır.

### Gelecekteki Olası Geçiş
```
Şu an:   Calendiq → IndexedDB
İleride: Calendiq → Oscar REST API → Gerçek Backend
```

---

## 15. Dosya ve Klasör Yapısı (Öneri)

```
caleniq/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── Calendar/
│   │   ├── Chat/
│   │   ├── PIN/
│   │   └── Setup/
│   ├── db/
│   │   ├── db.ts              # Dexie instance
│   │   ├── eventRepository.ts # IEventRepository + IndexedDB impl
│   │   └── userRepository.ts
│   ├── hooks/
│   ├── types/
│   │   └── event.ts
│   └── App.tsx
├── api/
│   └── ai.ts                  # Vercel Serverless Function (proxy)
├── .env                        # OPENAI_API_KEY (gitignore'da)
├── .env.example                # Örnek env (repoda yer alır)
├── .gitignore
└── README.md
```

---

## 16. API Key Yönetimi

### Environment Variables
Vercel Dashboard'a eklenecek environment variables:

```
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
```

### .env.example İçeriği
```
OPENAI_API_KEY=
DEEPGRAM_API_KEY=
```

---

## 17. README İçeriği (Özet)

README aşağıdaki bilgileri içermelidir:

1. Projenin ne olduğu (kısa açıklama)
2. Kurulum adımları:
   - Repo clone
   - `npm install`
   - `.env.example` dosyasını `.env` olarak kopyala
   - `OPENAI_API_KEY` değerini ekle
   - Vercel'e deploy et
   - Vercel Dashboard'dan environment variable ekle
3. Tablet'e PWA olarak nasıl yükleneceği
4. Kullanım notları

---

*Bu doküman Calendiq MVP'nin teknik ve ürün gereksinimlerini tanımlar. Copilot veya benzeri bir AI kod asistanına yönelik hazırlanmıştır.*