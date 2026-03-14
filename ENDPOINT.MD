## DutyDesk API Endpoint Guide

Bu sənəd **frontend developer** üçün DutyDesk backend API-ləri ilə işləməyi sadə və aydın şəkildə izah edir.

---

### Ümumi Qaydalar

 - **Base URL**:
   - Lokal: `http://localhost:8080`
   - Prod: `https://dutydesk-g3ma.onrender.com`
- **Content-Type**: bütün body-lər `application/json` formatındadır.
- **Authorization**: qorunan endpoint-lərə request zamanı header əlavə et:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Response formatı**: bütün cavablar `ApiResponse<T>` wrapper-i ilə gəlir:
  - Uğurlu cavabda əsas data `data` sahəsinin içində olur (məsələn, `data.token`, `data.items` və s.)
- **Rollar**:
  - **ADMIN** və **SUPERVISOR**: `/api/admin/**` endpoint-lərə girə bilirlər.
  - **EMPLOYEE**: istifadəçi paneli, növbələr, handover və s.

#### Test istifadəçilər

| Email                    | Şifrə        | Rol         |
|--------------------------|-------------|-------------|
| `admin123@example.com`   | `password123` | `ADMIN`     |
| `vuqar@example.com`      | `password123` | `SUPERVISOR`|
| `leyla@example.com`      | `password123` | `EMPLOYEE`  |
| `ali@example.com`        | `password123` | `EMPLOYEE`  |

---

### Auth Endpoint-ləri (`/api/auth`)

#### POST `/api/auth/login` — Login

- **Məqsəd**: İstifadəçini sistemə daxil etmək və JWT token əldə etmək.
- **Body (nümunə)**:

```json
{
  "email": "admin123@example.com",
  "password": "password123"
}
```

- **Frontend nümunə (fetch)**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin123@example.com',
    password: 'password123'
  })
});

const json = await res.json();
// json.data.token, json.data.user və s.
```

- **Tipik istifadə**:
  - `json.data.token` dəyərini localStorage/cookie-də saxla.
  - Sonrakı bütün qorunan endpoint-lərə `Authorization: Bearer <token>` header-i ilə get.

---

#### POST `/api/auth/forgot-password` — Şifrəni unutdum

- **Məqsəd**: İstifadəçi email yazır, sistem email əsasında reset prosesi başlayır.
- **Body (nümunə)**:

```json
{
  "email": "leyla@example.com"
}
```

- **Frontend flow**:
  1. İstifadəçi email daxil edir.
  2. Bu endpoint-ə POST atılır.
  3. Response-dakı mesajı/toast-u göstər (məs: "Kod email-ə göndərildi").

---

#### POST `/api/auth/verify-code` — Kodun yoxlanması

- **Məqsəd**: İstifadəçinin email-ə gələn verification code-nu təsdiq etmək.
- **Body (nümunə)**:

```json
{
  "email": "leyla@example.com",
  "code": "123456"
}
```

- **Frontend flow**:
  1. Forgot password-dan sonra kod input səhifəsi.
  2. Kod təsdiqlənəndə növbəti addım: yeni şifrə səhifəsi və ya avtomatik login (backend dizaynına görə).

---

#### POST `/api/auth/reset-password` — Yeni şifrə

- **Məqsəd**: Təsdiqlənmiş email/kod əsasında yeni şifrə təyin etmək.
- **Body (nümunə)**:

```json
{
  "email": "leyla@example.com",
  "code": "123456",
  "newPassword": "YeniSifre123!"
}
```

- **Frontend flow**:
  1. Kod təsdiqlənəndən sonra bu endpoint-ə yeni şifrə ilə POST et.
  2. Uğurlu cavabda toast göstər, istifadəçini login səhifəsinə yönləndir.

---

### Users Endpoint-ləri (`/api/users`)

#### GET `/api/users/me` — Hal-hazırkı istifadəçi

- **Auth tələb edir**: Bəli (`Authorization: Bearer <token>`)
- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → CurrentUserResponse (id, email, firstName, lastName, role, team və s.)
```

- **Frontend istifadəsi**:
  - App açılarkən (layout səviyyəsində) current user-i yükləmək üçün.
  - Rol əsaslı routing: `role === 'admin'` və s.

---

### Admin Endpoint-ləri (`/api/admin`)

> **Qeyd:** Bu endpoint-lər **yalnız `ADMIN` və `SUPERVISOR`** token-i ilə əlçatandır.

#### GET `/api/admin/dashboard` — Admin dashboard məlumatları

- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data.overview, json.data.onDutyNow, json.data.weeklyStats və s.
```

- **İstifadə yeri**: Admin dashboard ekranında overview, “on duty now” listi və s.

---

#### GET `/api/admin/users` — İstifadəçi siyahısı (filter + pagination)

- **Query parametrlər**:
  - `role` *(optional)* — `admin`, `supervisor`, `employee` (case-insensitive)
  - `team` *(optional)* — `UUID` (komanda id)
  - `search` *(optional)* — email və ya ad/soyad üzrə axtarış
  - `status` *(optional)* — `active` və ya başqa dəyər (active olmayanlar üçün)
  - `page` *(default: 1)*
  - `limit` *(default: 10)*

- **Nümunə**:

```js
const params = new URLSearchParams({
  role: 'employee',
  status: 'active',
  search: 'leyla',
  page: '1',
  limit: '20'
});

const res = await fetch(`http://localhost:8080/api/admin/users?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data.items → istifadəçi listi
// json.data.meta → PaginationMeta (page, limit, total, totalPages)
```

---

#### GET `/api/admin/teams` — Bütün komanda siyahısı və statistikası

- **Məqsəd**: Frontend üçün bütün team-ləri və onların üzv/növbə saylarını qaytarmaq.
- **Auth tələb edir**: Bəli (`ADMIN` və ya `SUPERVISOR` token-i)
- **Response**: `ApiResponse<List<TeamStatsResponse>>`

- **Response Structure (`TeamStatsResponse`)**:
  - `id`: UUID
  - `name`: String
  - `description`: String
  - `memberCount`: long (komandadakı ümumi istifadəçi sayı)
  - `activeShiftCount`: long (hazırda aktiv növbədə olan üzv sayı)

- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/teams', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → [
//   { 
//     id: 'uuid', 
//     name: 'APM Team', 
//     description: '...', 
//     memberCount: 5, 
//     activeShiftCount: 1 
//   }, 
//   ...
// ]
```

- **Frontend istifadəsi**:
  - Team seçimi üçün dropdown.
  - Dashboard-da komanda kartları (məs: "5 APM Komandası, 1 növbədə").

---

#### GET `/api/admin/teams/{id}` — Tək komandanın detalları

- **Məqsəd**: Seçilmiş komandanın id və adını ayrıca çəkmək.
- **Auth tələb edir**: Bəli (`ADMIN` və ya `SUPERVISOR` token-i)
- **Response**: `ApiResponse<{ id, name }>`

- **Nümunə**:

```js
const teamId = '11111111-2222-3333-4444-555555555555';

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/teams/${teamId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → { id: '...', name: 'Support Team' }
```

- **Frontend istifadəsi**:
  - Əgər yalnız bir komanda id-si varsa, onun adını göstərmək üçün (məsələn, detail səhifəsində title).

---

#### POST `/api/admin/users` — Yeni istifadəçi yaratma

- **Body (`CreateUserRequest`) tipik sahələr (hamısı məcburidir)**:
  - `email`: string
  - `password`: string
  - `firstName`: string
  - `lastName`: string
  - `role`: string (`ADMIN`, `SUPERVISOR`, `EMPLOYEE`)
  - `teamId`: UUID
  - `phone`: string (boş ola bilməz)

- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User',
    role: 'EMPLOYEE',
    teamId: '11111111-2222-3333-4444-555555555555',
    phone: '+994501234567'
  })
});

const json = await res.json();
// json.data.id → yaradılmış istifadəçinin id-si
```

---

#### PUT `/api/admin/users/{id}` — İstifadəçi yeniləmə

- **Body (`UpdateUserRequest`) — hamısı optional**:
  - `firstName?`, `lastName?`, `phone?`, `role?`, `teamId?`, `isActive?`

- **Nümunə**:

```js
const userId = '...';

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    firstName: 'Leyla',
    lastName: 'Updated',
    isActive: true
  })
});

const json = await res.json();
// json.data.id
```

---

#### DELETE `/api/admin/users/{id}` — Deaktivasiya

- İstifadəçi DB-dən tam silinmir, yalnız `isActive=false` qoyulur.

```js
await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
// Cavab: data içində id və isActive:false
```

---

#### GET `/api/admin/shifts` — Admin üçün növbə siyahısı

- **Məqsəd**: Növbələri admin filtr-ləri ilə siyahılamaq.
- **Auth tələb edir**: Bəli (`ADMIN` və ya `SUPERVISOR` token-i)
- **Query parametrlər**:
  - `email` *(optional)* — istifadəçi email-i ilə filter
  - `team` *(optional)* — komanda UUID-si
  - `status` *(optional)* — `scheduled`, `active`, `completed`, `cancelled`
  - `from` *(optional)* — `YYYY-MM-DD`
  - `to` *(optional)* — `YYYY-MM-DD`
  - `page` *(default: 1)*
  - `limit` *(default: 10)*

- **Response (`ShiftItemDto`)**:
  - `id`
  - `userId`
  - `userName`
  - `teamName`
  - `type`, `typeLabel`, `date`, `startTime`, `endTime`, `status`, `checkin`

- **Nümunə**:

```js
const params = new URLSearchParams({
  status: 'scheduled',
  from: '2026-04-01',
  to: '2026-04-30',
  page: '1',
  limit: '20'
});

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data.shifts[0].userId
// json.data.shifts[0].userName
// json.data.shifts[0].teamName
```

---

#### GET `/api/admin/schedules?week=YYYY-Www[&team=UUID]` — Həftəlik cədvəl

- **Parametrlər**:
  - `week` (mütləq) — ISO week formatı, məsələn: `2026-W05`
  - `team` (optional) — komanda UUID

- **Nümunə**:

```js
const params = new URLSearchParams({
  week: '2026-W05',
  // team: '11111111-2222-3333-4444-555555555555' // optional
});

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/schedules?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data.days → 7 günlük cədvəl, hər gün üçün day/evening/night listləri
```

---

#### POST `/api/admin/schedules` — Növbə cədvəli yaratma / upsert

- **Qayda**: `userId` yalnız `EMPLOYEE` roluna aid olmalıdır (`ADMIN` və `SUPERVISOR` qəbul edilmir).
- **Body (`UpsertScheduleRequest`)**:

```json
{
  "shifts": [
    {
      "userId": "user-uuid",
      "date": "2026-02-26",
      "type": "day"
    }
  ]
}
```

- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/schedules', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    shifts: [
      {
        userId: '11111111-2222-3333-4444-555555555555',
        date: '2026-02-26',
        type: 'day' // day, evening, night
      }
    ]
  })
});

const json = await res.json();
// json.data.createdShiftIds → yaradılmış növbə id-ləri
```

---

#### POST `/api/admin/schedules/generate` — Avtomatik Növbə Planlama (Auto-Scheduler)

- **Məqsəd**: Seçilmiş komanda üçün bir aylıq növbə cədvəlini avtomatik yaratmaq.
- **Qaydalar**:
  - Komanda daxilindəki işçiləri soyada görə sıralayır.
  - Növbəyə yalnız `EMPLOYEE` rolu olan istifadəçiləri daxil edir.
  - Hər gün üçün 3 növbə (08-16, 16-00, 00-08) yaradır.
  - Hər növbəyə 1 işçi təyin edir.
  - İşçiləri rotasiya (dönüşümlü) prinsipi ilə bölüşdürür.
  - Əgər növbə artıq varsa, dublikat yaratmır (skip edir).

- **Auth tələb edir**: Bəli (`ADMIN` və ya `SUPERVISOR` token-i)
- **Body (`GenerateScheduleRequest`)**:
  - `teamId`: UUID (Mütləq)
  - `year`: int (Mütləq, məs: 2026)
  - `month`: int (Mütləq, 1-12)

- **Nümunə**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/schedules/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    teamId: 'team-uuid-...',
    year: 2026,
    month: 4 // Aprel ayı üçün
  })
});

// Status 200 OK gəlirsə, deməli cədvəl uğurla yaradıldı.
// Body boş olur (void response).
```

---

#### DELETE `/api/admin/schedules/{id}` — Növbəni ləğv etmək (yalnız SCHEDULED)

- **Məqsəd**: Yalnız statusu `scheduled` olan növbələri ləğv etmək.
- **Qayda**: `active`, `completed` və ya `cancelled` növbələr üçün icazə verilmir — 400 qaytarılır.
- **Auth tələb edir**: Bəli (`ADMIN` və ya `SUPERVISOR` token-i)
- **Response**: `ApiResponse<{ id, status: "cancelled" }>`

- **Nümunə**:

```js
const shiftId = '11111111-2222-3333-4444-555555555555';

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/schedules/${shiftId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → { id: '...', status: 'cancelled' }
```

---

### Shifts Endpoint-ləri (`/api/shifts`)

#### GET `/api/shifts` — Növbə siyahısı

- **Query parametrlər**:
  - `status` *(optional)* — `scheduled`, `active`, `completed` və s. (`ShiftStatus`)
  - `from` *(optional)* — `YYYY-MM-DD`
  - `to` *(optional)* — `YYYY-MM-DD`
  - `page` *(default: 1)*
  - `limit` *(default: 10)*

- **Nümunə**:

```js
const params = new URLSearchParams({
  status: 'active',
  from: '2026-02-01',
  to: '2026-02-28',
  page: '1',
  limit: '20'
});

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/shifts?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data.items → növbə listi
// json.data.meta → pagination
```

---

#### GET `/api/shifts/current` — Cari növbə

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/shifts/current', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → CurrentShiftResponse
```

---

#### POST `/api/shifts/check-in` — Növbəyə daxil olma

- **Body (`CheckInRequest`)** — tipik sahələr:
  - adətən ən azı növbə ilə bağlı məlumat (məs: shiftId və ya location, note və s.)

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/shifts/check-in', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: shiftId: '...', note: 'Başladım'
  })
});

const json = await res.json();
// json.data → CheckInOutResponse
```

---

#### POST `/api/shifts/check-out` — Növbədən çıxış

- **Body (`CheckOutRequest`)**:

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/shifts/check-out', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: shiftId: '...', note: 'Bitirdim'
  })
});

const json = await res.json();
// json.data → CheckInOutResponse
```

---

#### POST `/api/shifts/change-request` — Növbə dəyişiklik sorğusu

- **Body (`CreateShiftChangeRequest`)** — növbə dəyişmə ilə bağlı məlumatlar (target növbə, səbəb və s.)

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/shifts/change-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: targetDate: '2026-02-27', reason: 'Şəxsi işim var'
  })
});

const json = await res.json();
// json.data → ShiftChangeRequestResponse
```

---

#### GET `/api/shifts/{shiftId}/notes` — Növbə qeydləri

```js
const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/shifts/${shiftId}/notes`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → ShiftNoteResponse
```

---

#### POST `/api/shifts/{shiftId}/notes` — Növbəyə qeyd əlavə etmək

- **Body (`AddShiftNoteRequest`)** — əsasən mətn sahəsi (`text` və s.)

```js
const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/shifts/${shiftId}/notes`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: text: 'Serverdə problem həll olundu.'
  })
});

// Cavab: ApiResponse.success(null) → yalnız success flag
```

---

### Handovers Endpoint-ləri (`/api/handovers`)

#### GET `/api/handovers` — Handover siyahısı

- **Query parametrlər**:
  - `status` *(optional)* — `draft`, `submitted`, `approved` və s. (`HandoverStatus`)
  - `from` *(optional)* — tarix string
  - `to` *(optional)* — tarix string
  - `search` *(optional)* — text axtarış

- **Nümunə**:

```js
const params = new URLSearchParams({
  status: 'submitted',
  from: '2026-02-01',
  to: '2026-02-28',
  search: 'database'
});

const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/handovers?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → HandoverListResponse
```

---

#### GET `/api/handovers/{id}` — Handover detalları

```js
const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/users?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const json = await res.json();
// json.data → HandoverDetailResponse
```

---

#### POST `/api/handovers` — Yeni handover yaratma

- **Body (`CreateHandoverRequest`)** — növbə və təhvil-təslim məzmunu ilə bağlı sahələr.

```js
const res = await fetch('https://dutydesk-g3ma.onrender.com/api/handovers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: shiftId: '...', summary: 'Növbə ərzində görülən işlər', risks: '...'
  })
});

const json = await res.json();
// json.data.id → yaradılmış handover id-si
```

---

#### PUT `/api/handovers/{id}` — Handover yeniləmə

- **Body (`UpdateHandoverRequest`)** — status və məzmunla bağlı sahələr.

```js
const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/handovers/${handoverId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // misal: status: 'submitted', summary: 'Yenilənmiş məzmun'
  })
});

const json = await res.json();
// json.data → HandoverDetailResponse
```

---

### Frontend üçün Qısa “Recipe”lər

- **Login + token saxlama**:
  - `/api/auth/login` → `data.token` → localStorage/cookie.
  - Bütün qorunan endpoint-lərə `Authorization: Bearer <token>`.
- **App bootstrap**:
  - App startında `/api/users/me` çağır → user və rol-u global state-də saxla.
- **Role-based routing**:
  - `role === 'admin' || role === 'supervisor'` → admin layout və `/api/admin/**`
  - `role === 'employee'` → user dashboard və `/api/shifts`, `/api/handovers` və s.
- **Pagination & filterlər**:
  - List endpoint-lərində `page`, `limit`, `status`, `search`, `from`, `to` query parametrlərindən istifadə et.
  - Backend `PaginationMeta` ilə meta məlumat göndərir (`page`, `limit`, `total`, `totalPages`) — bunları UI pagination üçün istifadə et.
