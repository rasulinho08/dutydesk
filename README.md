# 🏢 DutyDesk - Növbə İdarəetmə Sistemi

Shift Handover Management System - Növbə təhvil-təslim prosesini idarə etmək üçün modern web tətbiqi.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Layihə Haqqında

DutyDesk, müəssisələrdə növbə idarəetməsini asanlaşdıran tam funksional bir sistemdir. İşçilər öz növbələrini görə, check-in/check-out edə və təhvil-təslim formlarını doldura bilərlər. Administratorlar isə bütün sistemi izləyə və idarə edə bilərlər.

---

## 🚀 Xüsusiyyətlər

### 👤 İstifadəçi Paneli
- ✅ **Dashboard** - Növbə statusu, check-in/check-out, qeydlər
- ✅ **Mənim Növbələrim** - Növbə tarixçəsi və gələcək növbələr
- ✅ **Təhvil-Təslim Formu** - Növbə sonu hesabat formu
- ✅ **Tarixçə** - Keçmiş təhvil-təslim qeydləri

### 👨‍💼 Admin Paneli
- ✅ **Dashboard** - Ümumi statistika və canlı məlumatlar
- ✅ **Statistika** - Detallı analitika və qrafiklər
- ✅ **Tarixçə** - Bütün handover-ların tarixçəsi
- ✅ **Cədvəl** - Növbə cədvəlini planlaşdırma
- ✅ **İşçilər** - İşçi idarəetməsi

### 🔐 Autentifikasiya
- ✅ Login sistemi
- ✅ Şifrəni unutdum (Email verification ilə)
- ✅ Şifrə gücü göstəricisi
- ✅ Multi-step password reset

---

## 📁 Proyekt Strukturu

```
dutydesk/
├── public/                  # Statik fayllar
├── src/
│   ├── components/          # Yenidən istifadə edilən komponentlər
│   │   ├── ui/              # UI komponentləri (Button, Modal, Toast)
│   │   ├── Layout.jsx       # User layout
│   │   ├── AdminLayout.jsx  # Admin layout
│   │   └── Sidebar.jsx      # Sidebar komponenti
│   │
│   ├── pages/               # Səhifə komponentləri
│   │   ├── admin/           # Admin səhifələri
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── MyShifts.jsx
│   │   ├── HandoverForm.jsx
│   │   └── HandoverHistory.jsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useToast.js
│   │   └── useTimer.js
│   │
│   ├── utils/               # Utility funksiyaları
│   │   ├── dateUtils.js     # Tarix funksiyaları
│   │   └── validation.js    # Validasiya funksiyaları
│   │
│   ├── constants/           # Sabit dəyərlər
│   │   └── index.js
│   │
│   ├── App.jsx              # Əsas App komponenti
│   ├── main.jsx             # Entry point
│   └── index.css            # Global stillər
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠️ Texnologiyalar

| Texnologiya | Versiya | Təsvir |
|-------------|---------|--------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool |
| React Router | 6.x | Routing |
| Lucide React | latest | İkonlar |
| CSS3 | - | Styling |

---

## 📦 Quraşdırma

### Tələblər
- Node.js 18+ 
- npm və ya yarn

### Addımlar

```bash
# 1. Proyekti klonlayın
git clone https://github.com/your-username/dutydesk.git

# 2. Qovluğa keçin
cd dutydesk

# 3. Asılılıqları quraşdırın
npm install

# 4. Development serverini başladın
npm run dev

# 5. Brauzerdə açın
# http://localhost:5173
```

---

## 🔑 Test Hesabları

### Admin
```
Email: admin123@example.com
Şifrə: admin123
```

### İstifadəçi
```
Email: istənilən email
Şifrə: istənilən şifrə
```

---

## 📜 Mövcud Skriptlər

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Production preview
npm run lint     # ESLint yoxlaması
```

---

## 🎨 UI Komponentləri

### Button
```jsx
import { Button } from './components/ui'

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

### Modal
```jsx
import { Modal } from './components/ui'

<Modal isOpen={true} onClose={() => {}} title="Modal Title">
  Modal content
</Modal>
```

### Toast
```jsx
import { Toast } from './components/ui'

<Toast show={true} message="Success!" type="success" />
```

---

## 🪝 Custom Hooks

### useToast
```jsx
import { useToast } from './hooks'

const { toast, showToast, hideToast } = useToast()
showToast('Uğurlu!', 'success')
```

### useTimer
```jsx
import { useTimer } from './hooks'

const { formattedTime, start, pause, reset } = useTimer(120)
```

---

## 🔧 Utility Funksiyaları

### Tarix Funksiyaları
```jsx
import { formatDateAz, formatTime, getRelativeTime } from './utils'

formatDateAz(new Date())  // "14 Yanvar 2026"
formatTime(new Date())    // "14:30"
getRelativeTime(date)     // "5 dəqiqə əvvəl"
```

### Validasiya
```jsx
import { isValidEmail, getPasswordStrength } from './utils'

isValidEmail('test@mail.com')  // true
getPasswordStrength('Pass123!') // { level: 'strong', text: 'Güclü' }
```

---

## 📝 TODO - Backend İnteqrasiyası

Backend hazır olduqda aşağıdakı sənədləri oxuyun:

| Sənəd | Təsvir |
|-------|--------|
| [API Specification](docs/API_SPECIFICATION.md) | Tam API endpoint-ləri |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Database strukturu |
| [Frontend Integration](docs/FRONTEND_INTEGRATION.md) | İnteqrasiya təlimatı |

### Gözlənilən API Endpoints:

```
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/verify-code
POST   /api/auth/reset-password

GET    /api/users/me
GET    /api/shifts
POST   /api/shifts/check-in
POST   /api/shifts/check-out

GET    /api/handovers
POST   /api/handovers
GET    /api/handovers/:id

# Admin
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/schedules
POST   /api/admin/schedules
```

---

## 📄 Lisenziya

Bu proyekt MIT lisenziyası altında yayımlanır.

---

## 👥 Əlaqə

Suallarınız varsa, issue açın və ya əlaqə saxlayın.

---

**DutyDesk** © 2026 - Növbə İdarəetmə Sistemi
