# Product

## Register

product

## Users

TalimPlus — O'zbekistondagi xususiy o'quv markazlari uchun boshqaruv tizimi (CRM). Foydalanuvchilar markaz xodimlari bo'lib, rollarga bo'lingan va har biri o'z ish oqimida ishlaydi:

- **Administrator / markaz egasi** — statistika, to'lovlar, ish haqi, xarajatlar va tasdiqlash uchun to'lovlarni nazorat qiladi. Konteksti: moliyaviy qaror qabul qilish, umumiy boshqaruv.
- **Qabul (reception)** — leadlar bilan ishlash, yangi o'quvchilarni ro'yxatga olish, kunlik qabul jarayoni. Konteksti: tez-tez takrorlanadigan, tezkor kiritish ishlari.
- **O'qituvchi** — guruhlar, davomat va o'z profili. Konteksti: o'quv jarayoni, o'z guruhlariga cheklangan ko'rinish.
- Qo'shimcha: **menejer** va **super_admin** rollari (operatsion va to'liq boshqaruv).

Bajariladigan asosiy ish (job to be done): o'quv markazining o'quvchilari, guruhlari va pul oqimini bir joydan, rolga mos ravishda ishonchli boshqarish.

## Product Purpose

TalimPlus o'quv markazining kundalik operatsiyalarini raqamlashtiradi: lead → qabul → faol o'quvchi → to'lov/ish haqi → statistika zanjirini bitta tizimda birlashtiradi. Muvaffaqiyat mezoni: markaz egasi moliyaviy holatni bir qarashda tushunadi, qabul xodimi minimal bosishlar bilan o'quvchi qo'shadi, o'qituvchi davomatni tez belgilaydi — hech kim ortiqcha o'rgatishga muhtoj bo'lmaydi.

Dizayn yo'nalishi: joriy teal (`#01c0c8`) brend identifikatsiyasi saqlangan holda, layout, karta, tipografiya va spacing Materio (Vuetify admin) darajasiga ko'tariladi — zamonaviy, toza va izchil product ko'rinishi.

## Brand Personality

Uch so'z: **ishonchli, tartibli, professional**.

Ovoz va ohang: xotirjam, ishbilarmon, ortiqcha da'vosiz. Moliyaviy va boshqaruv ma'lumotlariga jiddiy, ammo og'irlashtirmasdan yondashadi. Interfeys foydalanuvchiga "bu tizim mening pulim va o'quvchilarimni to'g'ri boshqaradi" degan ishonch berishi kerak. O'zbekcha matn birinchi o'rinda — tabiiy, sodda til.

## Anti-references

- **Eski/og'ir enterprise (1C, SAP kabi)** — zich, kulrang, chalkash cheksiz jadvalli, o'rganish uchun qo'llanma talab qiladigan boshqaruv tizimlari. TalimPlus bunday bo'lmasligi kerak.
- **O'yinchoqdek, rang-barang** — ortiqcha yorqin ranglar, dekorativ gradientlar, bolalarga mo'ljallangandek yengil-yelpi ko'rinish. Brend jiddiy, lekin o'yinchoq emas.
- **Umumiy AI/SaaS shabloni** — xarakatersiz, "har qanday admin panelidek" bootstrap ko'rinish; hero-metrika kliшeleri, bir xil karta setkalari.

## Design Principles

1. **Ishonch moliyadan boshlanadi.** To'lov, ish haqi, xarajat va balans raqamlari eng aniq va bir ma'noli ko'rinadigan elementlar bo'lishi kerak — kontrast, tekislash va formatlashda hech qanday ikkilanish bo'lmasin.
2. **Rol — bu kontekst.** Har bir foydalanuvchi faqat o'z ish oqimini ko'radi. Interfeys har bir rol uchun maxsus qurilgandek his qildirsin, bitta ulkan universal ekran emas.
3. **Tezlik — hurmat belgisi.** Qabul kabi takroriy ish qiladigan foydalanuvchilar uchun bosishlar soni kamaytiriladi, produktiv zichlik saqlanadi. Kunlik ishni sekinlashtiradigan hech narsa qolmasin.
4. **Xotirjam zichlik.** 1C/SAP og'irligisiz yetarli ma'lumot ko'rsatiladi — bo'sh joy va hierarxiya yukni ko'taradi, ranglar emas.
5. **O'zbekcha birinchi.** Matn, sana, raqam va valyuta formatlari auditoriyaga tabiiy; til va kontekst mahalliy.

## Accessibility & Inclusion

- Maqsad daraja: **WCAG 2.1 AA** (aniq talab bildirilmagan — product CRM uchun oqilona default).
- Matn kontrasti: asosiy matn ≥4.5:1, katta matn/status chiplari ≥3:1. Ayniqsa moliyaviy raqamlar va holat ("faol", "to'xtatilgan", "kutilmoqda") ranglari faqat rangga tayanmasin — matn/ikonka bilan mustahkamlansin.
- `prefers-reduced-motion` qo'llab-quvvatlanadi: animatsiyalar reduced rejimda crossfade yoki darhol o'tishga tushadi.
- Rang ko'rligi: holat va statuslar rang + belgi (ikonka/matn) bilan birga ifodalanadi.
