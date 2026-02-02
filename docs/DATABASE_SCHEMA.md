# 🗄️ DutyDesk - Database Diaqramı

## ER Diagram (Entity Relationship)

```
┌─────────────────┐       ┌─────────────────┐
│     TEAMS       │       │     USERS       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ name            │       │ email           │
│ description     │       │ password_hash   │
│ supervisor_id   │───────│ first_name      │
│ created_at      │       │ last_name       │
└─────────────────┘       │ role            │
                          │ team_id (FK)    │──┐
                          │ phone           │  │
                          │ is_active       │  │
                          │ created_at      │  │
                          └────────┬────────┘  │
                                   │           │
          ┌────────────────────────┼───────────┘
          │                        │
          ▼                        ▼
┌─────────────────┐       ┌─────────────────┐
│     SHIFTS      │       │   CHECKINS      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ user_id (FK)    │───┐   │ shift_id (FK)   │
│ team_id (FK)    │   │   │ user_id (FK)    │
│ shift_type      │   │   │ check_in_time   │
│ start_time      │   │   │ check_out_time  │
│ end_time        │   │   │ status          │
│ status          │   │   │ created_at      │
│ notes           │   │   └─────────────────┘
│ created_at      │   │
└────────┬────────┘   │
         │            │
         ▼            │
┌─────────────────┐   │   ┌─────────────────┐
│   HANDOVERS     │   │   │  SHIFT_NOTES    │
├─────────────────┤   │   ├─────────────────┤
│ id (PK)         │   │   │ id (PK)         │
│ shift_id (FK)   │   │   │ shift_id (FK)   │
│ from_user_id    │───┘   │ user_id (FK)    │
│ to_user_id      │       │ content         │
│ incidents       │       │ created_at      │
│ system_status   │       └─────────────────┘
│ pending_tasks   │
│ next_shift_info │       ┌─────────────────┐
│ status          │       │ CHANGE_REQUESTS │
│ submitted_at    │       ├─────────────────┤
│ approved_at     │       │ id (PK)         │
│ approved_by     │       │ shift_id (FK)   │
└─────────────────┘       │ user_id (FK)    │
                          │ reason          │
                          │ status          │
┌─────────────────┐       │ reviewed_by     │
│ PASSWORD_RESET  │       │ created_at      │
├─────────────────┤       └─────────────────┘
│ id (PK)         │
│ user_id (FK)    │
│ token (6 digit) │
│ expires_at      │
│ is_used         │
└─────────────────┘
```

---

## 📋 Cədvəl Əlaqələri

| Əsas Cədvəl | Əlaqə | Bağlı Cədvəl | Tip |
|-------------|-------|--------------|-----|
| teams | → | users | 1:N |
| users | → | shifts | 1:N |
| users | → | checkins | 1:N |
| users | → | handovers | 1:N |
| shifts | → | checkins | 1:1 |
| shifts | → | handovers | 1:1 |
| shifts | → | shift_notes | 1:N |
| shifts | → | change_requests | 1:N |

---

## 🔑 İndekslər

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_role ON users(role);

-- Shifts
CREATE INDEX idx_shifts_user ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(start_time);
CREATE INDEX idx_shifts_status ON shifts(status);

-- Checkins
CREATE INDEX idx_checkins_shift ON checkins(shift_id);
CREATE INDEX idx_checkins_user ON checkins(user_id);

-- Handovers
CREATE INDEX idx_handovers_shift ON handovers(shift_id);
CREATE INDEX idx_handovers_user ON handovers(from_user_id);
CREATE INDEX idx_handovers_status ON handovers(status);
```

---

## 📊 Enum Values

### User Roles
```
admin      - Tam giriş
supervisor - Komanda rəhbəri
employee   - Adi işçi
```

### Shift Types
```
day     - 08:00 - 16:00
evening - 16:00 - 00:00
night   - 00:00 - 08:00
```

### Shift Status
```
scheduled - Planlanmış
active    - Aktiv
completed - Tamamlanmış
cancelled - Ləğv edilmiş
```

### Checkin Status
```
pending     - Gözləyir
checked_in  - Giriş edilib
checked_out - Çıxış edilib
missed      - Buraxılıb
```

### Handover Status
```
draft     - Qaralama
submitted - Göndərildi
approved  - Təsdiqləndi
rejected  - Rədd edildi
```

---

## 🌱 Seed Data (Test Məlumatları)

```sql
-- Teams
INSERT INTO teams (id, name) VALUES
('team-1', 'APM Team'),
('team-2', 'NOC Team'),
('team-3', 'Support Team');

-- Users (password: "password123")
INSERT INTO users (id, email, password_hash, first_name, last_name, role, team_id) VALUES
('user-admin', 'admin123@example.com', '$2b$10$...', 'Admin', 'User', 'admin', 'team-1'),
('user-1', 'leyla@example.com', '$2b$10$...', 'Leyla', 'Məmmədova', 'employee', 'team-1'),
('user-2', 'ali@example.com', '$2b$10$...', 'Əli', 'Həsənov', 'employee', 'team-1'),
('user-3', 'vuqar@example.com', '$2b$10$...', 'Vüqar', 'Rəhimov', 'supervisor', 'team-2');
```
