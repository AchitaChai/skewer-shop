# 🏪 ร้านลูกชิ้นปิ้ง & น้ำ — บันทึกรายรับรายจ่าย

แอปบันทึกรายรับรายจ่ายสำหรับร้านลูกชิ้นปิ้งและเมนูน้ำ รองรับ Windows + iPhone

---

## ✅ ฟีเจอร์

- บันทึกรายรับ/รายจ่าย แยกหมวด ลูกชิ้น vs น้ำ
- สรุปกำไร/ขาดทุนรายวัน
- ติดตามสต็อกวัตถุดิบ พร้อมแจ้งเตือนเมื่อของเหลือน้อย
- รายงานรายสัปดาห์ / รายเดือน / กำหนดเอง พร้อมกราฟ
- ลบข้อมูลเก่าอัตโนมัติ (เลือกได้ 1 / 3 / 6 / 12 เดือน หรือไม่ลบ)
- Export / Import ข้อมูลเป็น JSON
- เปลี่ยนภาษา ไทย / English ได้
- Sync ข้ามอุปกรณ์ผ่าน Firebase (optional)

---

## 🚀 วิธี Deploy บน GitHub Pages (ฟรี)

### ขั้นตอนที่ 1 — สร้าง GitHub Repository

1. เปิด [github.com](https://github.com) แล้ว Login
2. กดปุ่ม **New** (สีเขียว) มุมบนขวา
3. ตั้งชื่อ repository เช่น `skewer-shop`
4. เลือก **Public**
5. กด **Create repository**

### ขั้นตอนที่ 2 — อัปโหลดไฟล์

1. ในหน้า repository ใหม่ กด **uploading an existing file**
2. ลากไฟล์ทั้งหมดใส่ (ต้องรักษาโครงสร้าง folder ด้วย)
   ```
   index.html
   css/style.css
   js/app.js
   README.md
   ```
3. กด **Commit changes**

### ขั้นตอนที่ 3 — เปิด GitHub Pages

1. ไปที่ **Settings** ของ repository
2. เลื่อนลงหา **Pages** (เมนูซ้าย)
3. ใต้ **Branch** เลือก `main` แล้วกด **Save**
4. รอ 1-2 นาที แอปจะเปิดได้ที่:
   ```
   https://[username].github.io/skewer-shop/
   ```

### ขั้นตอนที่ 4 — เพิ่มไอคอนบน iPhone

1. เปิด URL แอปใน **Safari** บน iPhone
2. กดปุ่ม **Share** (รูปกล่องมีลูกศรขึ้น)
3. เลือก **Add to Home Screen**
4. กด **Add**

ตอนนี้แอปจะอยู่ที่หน้าจอหลัก เปิดได้เหมือนแอปปกติ 🎉

---

## 🔄 ตั้งค่า Firebase (Sync ข้ามอุปกรณ์)

ถ้าอยากให้ข้อมูลซิงก์ระหว่าง Windows และ iPhone ทำตามขั้นตอนนี้:

### 1. สร้าง Firebase Project

1. ไปที่ [console.firebase.google.com](https://console.firebase.google.com)
2. กด **Add project**
3. ตั้งชื่อ project เช่น `skewer-shop`
4. ปิด Google Analytics (ไม่จำเป็น) แล้วกด **Create project**

### 2. เปิด Firestore Database

1. เมนูซ้าย เลือก **Firestore Database**
2. กด **Create database**
3. เลือก **Start in test mode** (ใช้ได้ 30 วัน)
4. เลือก region ใกล้สุด เช่น `asia-southeast1`
5. กด **Enable**

### 3. คัดลอก Firebase Config

1. ไปที่ **Project settings** (รูปเฟือง)
2. เลื่อนลงหา **Your apps** → กด **Web** (`</>`)
3. ตั้งชื่อ app แล้วกด **Register app**
4. คัดลอก config object ที่ได้ เช่น:
   ```js
   {
     "apiKey": "AIzaSy...",
     "authDomain": "skewer-shop.firebaseapp.com",
     "projectId": "skewer-shop",
     "storageBucket": "skewer-shop.appspot.com",
     "messagingSenderId": "123456789",
     "appId": "1:123456789:web:abc123"
   }
   ```

### 4. ใส่ Config ในแอป

1. เปิดแอป → กดปุ่ม ⚙️ ตั้งค่า
2. วาง config ในช่อง **Firebase Config**
3. กด **💾 บันทึก**
4. ทำซ้ำบน iPhone — ข้อมูลจะ sync ทันที

---

## 💾 การสำรองข้อมูล

- **ข้อมูลในเครื่อง**: เก็บใน localStorage ของ browser
- **อัตโนมัติ**: ลบข้อมูลเก่าตามที่ตั้งไว้ทุกครั้งที่เปิดแอป
- **Manual Backup**: กด ⚙️ → Export JSON → บันทึกไฟล์ไว้
- **Restore**: กด ⚙️ → Import JSON → เลือกไฟล์

---

## 📁 โครงสร้างไฟล์

```
skewer-shop/
├── index.html       ← หน้าหลัก
├── css/
│   └── style.css    ← สไตล์ทั้งหมด
├── js/
│   └── app.js       ← logic ทั้งหมด
└── README.md        ← คู่มือนี้
```
