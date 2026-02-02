# 🔌 DutyDesk - Backend API Spesifikasiyası

Bu sənəd backend developer üçün hazırlanıb. Bütün API endpoint-ləri, request/response formatları və database sxemi burada ətraflı təsvir olunub.

---

## 📊 Database Schema

### 1. Users (İstifadəçilər)
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            ENUM('admin', 'supervisor', 'employee') DEFAULT 'employee',
    team_id         UUID REFERENCES teams(id),
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Teams (Komandalar)
```sql
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    supervisor_id   UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Shifts (Növbələr)
```sql
CREATE TABLE shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    team_id         UUID REFERENCES teams(id),
    shift_type      ENUM('day', 'evening', 'night') NOT NULL,
    start_time      TIMESTAMP NOT NULL,
    end_time        TIMESTAMP NOT NULL,
    status          ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shift type time mappings:
-- day:     08:00 - 16:00
-- evening: 16:00 - 00:00
-- night:   00:00 - 08:00
```

### 4. Check-ins (Giriş/Çıxış)
```sql
CREATE TABLE checkins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id        UUID REFERENCES shifts(id) NOT NULL,
    user_id         UUID REFERENCES users(id) NOT NULL,
    check_in_time   TIMESTAMP,
    check_out_time  TIMESTAMP,
    check_in_note   TEXT,
    check_out_note  TEXT,
    status          ENUM('pending', 'checked_in', 'checked_out', 'missed') DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Handovers (Təhvil-Təslimlər)
```sql
CREATE TABLE handovers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id            UUID REFERENCES shifts(id) NOT NULL,
    from_user_id        UUID REFERENCES users(id) NOT NULL,
    to_user_id          UUID REFERENCES users(id),
    
    -- Form Fields
    incidents           TEXT NOT NULL,           -- Baş verən hadisələr
    system_status       TEXT NOT NULL,           -- Sistem statusu
    pending_tasks       TEXT,                    -- Gözləyən tapşırıqlar
    next_shift_info     TEXT NOT NULL,           -- Növbəti növbə üçün məlumat
    additional_notes    TEXT,                    -- Əlavə qeydlər
    
    status              ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    submitted_at        TIMESTAMP,
    approved_at         TIMESTAMP,
    approved_by         UUID REFERENCES users(id),
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Shift Notes (Növbə Qeydləri)
```sql
CREATE TABLE shift_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id        UUID REFERENCES shifts(id) NOT NULL,
    user_id         UUID REFERENCES users(id) NOT NULL,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Shift Change Requests (Növbə Dəyişiklik Tələbləri)
```sql
CREATE TABLE shift_change_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id        UUID REFERENCES shifts(id) NOT NULL,
    user_id         UUID REFERENCES users(id) NOT NULL,
    reason          TEXT NOT NULL,
    requested_date  DATE,
    status          ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Password Reset Tokens
```sql
CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    token           VARCHAR(6) NOT NULL,        -- 6 digit code
    expires_at      TIMESTAMP NOT NULL,
    is_used         BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication API

### POST /api/auth/login
İstifadəçi girişi

**Request:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "firstName": "Leyla",
            "lastName": "Məmmədova",
            "role": "employee",
            "team": {
                "id": "uuid",
                "name": "APM Team"
            }
        },
        "token": "jwt_token_here",
        "expiresIn": 86400
    }
}
```

**Response (401):**
```json
{
    "success": false,
    "error": {
        "code": "INVALID_CREDENTIALS",
        "message": "Email və ya şifrə yanlışdır"
    }
}
```

---

### POST /api/auth/forgot-password
Şifrə sıfırlama kodu göndərmə

**Request:**
```json
{
    "email": "user@example.com"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Təsdiq kodu email ünvanınıza göndərildi",
    "data": {
        "expiresIn": 120  // seconds
    }
}
```

---

### POST /api/auth/verify-code
Təsdiq kodunu yoxlama

**Request:**
```json
{
    "email": "user@example.com",
    "code": "123456"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "resetToken": "temporary_reset_token"
    }
}
```

---

### POST /api/auth/reset-password
Yeni şifrə təyin etmə

**Request:**
```json
{
    "resetToken": "temporary_reset_token",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Şifrəniz uğurla yeniləndi"
}
```

---

## 👤 User API

### GET /api/users/me
Cari istifadəçi məlumatları (Auth required)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "Leyla",
        "lastName": "Məmmədova",
        "role": "employee",
        "phone": "+994501234567",
        "team": {
            "id": "uuid",
            "name": "APM Team"
        },
        "currentShift": {
            "id": "uuid",
            "type": "day",
            "startTime": "2026-01-14T08:00:00Z",
            "endTime": "2026-01-14T16:00:00Z",
            "status": "active"
        }
    }
}
```

---

## 📅 Shifts API

### GET /api/shifts
İstifadəçinin növbələri

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter: scheduled, active, completed |
| from | date | Başlanğıc tarixi |
| to | date | Son tarix |
| page | number | Səhifə nömrəsi |
| limit | number | Səhifədəki say |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "shifts": [
            {
                "id": "uuid",
                "type": "day",
                "typeLabel": "Gündüz",
                "date": "2026-01-14",
                "startTime": "08:00",
                "endTime": "16:00",
                "status": "active",
                "checkin": {
                    "checkInTime": "07:55",
                    "checkOutTime": null,
                    "status": "checked_in"
                }
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 25,
            "totalPages": 3
        }
    }
}
```

---

### GET /api/shifts/current
Cari aktiv növbə

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "type": "day",
        "startTime": "2026-01-14T08:00:00Z",
        "endTime": "2026-01-14T16:00:00Z",
        "remainingTime": 9000,  // seconds
        "status": "active",
        "checkin": {
            "checkInTime": "2026-01-14T07:55:00Z",
            "status": "checked_in"
        }
    }
}
```

---

### POST /api/shifts/check-in
Check-in etmə

**Request:**
```json
{
    "shiftId": "uuid",
    "note": "Optional check-in note"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Check-in uğurla tamamlandı",
    "data": {
        "checkinId": "uuid",
        "checkInTime": "2026-01-14T07:55:00Z"
    }
}
```

---

### POST /api/shifts/check-out
Check-out etmə

**Request:**
```json
{
    "shiftId": "uuid",
    "note": "Optional check-out note"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Check-out uğurla tamamlandı",
    "data": {
        "checkinId": "uuid",
        "checkOutTime": "2026-01-14T16:02:00Z",
        "totalHours": 8.12
    }
}
```

---

### POST /api/shifts/change-request
Növbə dəyişikliyi tələbi

**Request:**
```json
{
    "shiftId": "uuid",
    "reason": "Şəxsi səbəblərə görə",
    "requestedDate": "2026-01-20"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Tələbiniz göndərildi",
    "data": {
        "requestId": "uuid",
        "status": "pending"
    }
}
```

---

## 📝 Handovers API

### GET /api/handovers
Təhvil-təslim tarixçəsi

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter: draft, submitted, approved |
| from | date | Başlanğıc tarixi |
| to | date | Son tarix |
| search | string | Axtarış sözü |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "handovers": [
            {
                "id": "uuid",
                "shiftType": "day",
                "date": "2026-01-13",
                "time": "16:00",
                "fromUser": {
                    "id": "uuid",
                    "name": "Leyla Məmmədova"
                },
                "toUser": {
                    "id": "uuid",
                    "name": "Əli Həsənov"
                },
                "status": "approved",
                "summary": "Bütün sistemlər normal işləyir..."
            }
        ],
        "pagination": { ... }
    }
}
```

---

### GET /api/handovers/:id
Təhvil-təslim detalları

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "shift": {
            "id": "uuid",
            "type": "day",
            "date": "2026-01-13",
            "startTime": "08:00",
            "endTime": "16:00"
        },
        "fromUser": {
            "id": "uuid",
            "name": "Leyla Məmmədova",
            "team": "APM Team"
        },
        "toUser": {
            "id": "uuid",
            "name": "Əli Həsənov"
        },
        "incidents": "3 incident həll olundu:\n1. Server restart\n2. Network issue\n3. User complaint",
        "systemStatus": "Bütün sistemlər normal işləyir",
        "pendingTasks": "- Backup yoxlaması\n- Log təmizliyi",
        "nextShiftInfo": "Monitoring sistemini izləmək lazımdır",
        "additionalNotes": "Əlavə qeyd yoxdur",
        "status": "approved",
        "submittedAt": "2026-01-13T16:05:00Z",
        "approvedAt": "2026-01-13T16:10:00Z",
        "approvedBy": {
            "id": "uuid",
            "name": "Admin User"
        }
    }
}
```

---

### POST /api/handovers
Yeni təhvil-təslim yaratma

**Request:**
```json
{
    "shiftId": "uuid",
    "incidents": "Baş verən hadisələr...",
    "systemStatus": "Sistem statusu...",
    "pendingTasks": "Gözləyən tapşırıqlar...",
    "nextShiftInfo": "Növbəti növbə üçün məlumat...",
    "additionalNotes": "Əlavə qeydlər...",
    "status": "submitted"  // or "draft"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Təhvil-təslim formu göndərildi",
    "data": {
        "id": "uuid",
        "status": "submitted"
    }
}
```

---

### PUT /api/handovers/:id
Qaralama yeniləmə

**Request:**
```json
{
    "incidents": "Yenilənmiş mətn...",
    "status": "submitted"
}
```

---

## 📝 Shift Notes API

### GET /api/shifts/:shiftId/notes
Növbə qeydləri

**Response (200):**
```json
{
    "success": true,
    "data": {
        "notes": [
            {
                "id": "uuid",
                "content": "Qeyd mətni",
                "createdAt": "2026-01-14T10:30:00Z"
            }
        ]
    }
}
```

---

### POST /api/shifts/:shiftId/notes
Yeni qeyd əlavə etmə

**Request:**
```json
{
    "content": "Qeyd mətni"
}
```

---

## 👨‍💼 Admin API

### GET /api/admin/dashboard
Admin dashboard statistikaları

**Response (200):**
```json
{
    "success": true,
    "data": {
        "overview": {
            "totalEmployees": 24,
            "activeShifts": 8,
            "pendingHandovers": 3,
            "todayCheckins": 18
        },
        "onDutyNow": [
            {
                "id": "uuid",
                "name": "Leyla Məmmədova",
                "team": "APM Team",
                "shiftType": "day",
                "checkInTime": "07:55",
                "status": "active"
            }
        ],
        "recentAlerts": [
            {
                "id": "uuid",
                "type": "late_checkin",
                "message": "Əli Həsənov 15 dəqiqə gec check-in etdi",
                "timestamp": "2026-01-14T08:15:00Z"
            }
        ],
        "weeklyStats": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "checkins": [22, 24, 23, 24, 22, 12, 10],
            "handovers": [8, 8, 8, 8, 8, 4, 4]
        }
    }
}
```

---

### GET /api/admin/users
İşçilər siyahısı

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | Filter: admin, supervisor, employee |
| team | uuid | Team ID |
| search | string | Ad/email axtarışı |
| status | string | active, inactive |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": "uuid",
                "email": "user@example.com",
                "firstName": "Leyla",
                "lastName": "Məmmədova",
                "role": "employee",
                "team": {
                    "id": "uuid",
                    "name": "APM Team"
                },
                "isActive": true,
                "lastLogin": "2026-01-14T08:00:00Z",
                "stats": {
                    "totalShifts": 45,
                    "completedHandovers": 42,
                    "avgCheckInTime": "07:58"
                }
            }
        ],
        "pagination": { ... }
    }
}
```

---

### POST /api/admin/users
Yeni işçi əlavə etmə

**Request:**
```json
{
    "email": "newuser@example.com",
    "firstName": "Yeni",
    "lastName": "İstifadəçi",
    "role": "employee",
    "teamId": "uuid",
    "phone": "+994501234567",
    "password": "tempPassword123"
}
```

---

### PUT /api/admin/users/:id
İşçi məlumatlarını yeniləmə

---

### DELETE /api/admin/users/:id
İşçini silmə (soft delete)

---

### GET /api/admin/schedules
Növbə cədvəli

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| week | string | ISO week: "2026-W03" |
| team | uuid | Team ID |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "week": "2026-W03",
        "days": [
            {
                "date": "2026-01-13",
                "dayName": "Bazar ertəsi",
                "shifts": {
                    "day": [
                        { "userId": "uuid", "userName": "Leyla M." }
                    ],
                    "evening": [
                        { "userId": "uuid", "userName": "Əli H." }
                    ],
                    "night": [
                        { "userId": "uuid", "userName": "Vüqar R." }
                    ]
                }
            }
        ]
    }
}
```

---

### POST /api/admin/schedules
Növbə cədvəli yaratma/yeniləmə

**Request:**
```json
{
    "shifts": [
        {
            "userId": "uuid",
            "date": "2026-01-20",
            "type": "day"
        },
        {
            "userId": "uuid",
            "date": "2026-01-20",
            "type": "evening"
        }
    ]
}
```

---

## 🔔 Notifications (WebSocket)

Real-time bildirişlər üçün WebSocket bağlantısı.

### Connection
```javascript
const ws = new WebSocket('wss://api.dutydesk.com/ws?token=jwt_token')
```

### Events

**Server → Client:**
```json
// Yeni handover
{
    "type": "NEW_HANDOVER",
    "data": {
        "id": "uuid",
        "fromUser": "Leyla Məmmədova",
        "message": "Yeni təhvil-təslim göndərildi"
    }
}

// Check-in alert
{
    "type": "CHECKIN_ALERT",
    "data": {
        "userId": "uuid",
        "userName": "Əli Həsənov",
        "message": "15 dəqiqə gec check-in etdi"
    }
}

// Shift reminder
{
    "type": "SHIFT_REMINDER",
    "data": {
        "shiftId": "uuid",
        "message": "Növbəniz 30 dəqiqə sonra başlayır"
    }
}
```

---

## ⚠️ Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Yanlış email/şifrə |
| TOKEN_EXPIRED | 401 | JWT token vaxtı bitib |
| UNAUTHORIZED | 403 | İcazə yoxdur |
| NOT_FOUND | 404 | Resurs tapılmadı |
| VALIDATION_ERROR | 422 | Validasiya xətası |
| ALREADY_CHECKED_IN | 400 | Artıq check-in edilib |
| SHIFT_NOT_ACTIVE | 400 | Növbə aktiv deyil |
| HANDOVER_EXISTS | 400 | Bu növbə üçün artıq handover var |

**Error Response Format:**
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "İstifadəçi üçün mesaj",
        "details": {
            "field": "Xəta detalları"
        }
    }
}
```

---

## 🛡️ Security Notes

1. **JWT Token** - Access token 24 saat, Refresh token 7 gün
2. **Password** - Minimum 6 simvol, bcrypt hash
3. **Rate Limiting** - Login: 5 req/min, API: 100 req/min
4. **CORS** - Yalnız icazəli domain-lər
5. **Input Validation** - Bütün input-lar sanitize edilməli

---

## 📧 Email Templates

Backend aşağıdakı email-ləri göndərməlidir:

1. **Password Reset Code** - 6 rəqəmli kod
2. **Welcome Email** - Yeni istifadəçi üçün
3. **Shift Reminder** - Növbədən 1 saat əvvəl
4. **Handover Approved** - Təsdiq bildirişi

---

**Bu spesifikasiya ilə backend developer rahatlıqla API yaza bilər! 🚀**
