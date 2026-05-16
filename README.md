# Academy Seminarium (E-Learning Marketplace) 🎓

Academy Seminarium is a modern, scalable, and fully functional E-Learning Marketplace (Udemy clone). It provides a platform where industry experts (Instructors) can create and monetize high-quality video courses, while Students get a seamless, distraction-free environment to purchase and consume educational content.

## 🚀 Key Features

### For Students 🧑‍🎓
* **Public Catalog & Discovery:** Browse courses by category, view ratings, and watch free preview lectures before purchasing.
* **Secure Checkout:** Buy courses safely via Stripe payment integration (Lifetime access).
* **Focused Learning Environment:** A custom-built, split-screen video player with interactive curriculum navigation.
* **Progress Tracking:** Automatic lecture completion tracking and progress calculation.
* **Feedback System:** Rate courses (1-5 stars) and leave detailed reviews to help others.

### For Instructors 👨‍🏫
* **Instructor Dashboard:** A dedicated workspace to manage your educational business.
* **Curriculum Builder:** Create a structured course hierarchy (Course ➡️ Section ➡️ Lecture).
* **Direct Media Uploads:** Upload video files directly to Cloudflare R2 / AWS S3 for fast, stateless streaming.
* **Sales & Enrollment Analytics:** Track how many students have purchased your courses.

### For Administrators 👑
* **Content Moderation:** Review instructor submissions. Courses require Admin approval (`PUBLISHED` status) before appearing on the public storefront.
* **Taxonomy Management:** Create and manage global course categories (e.g., IT, Design, Marketing).
* **System Oversight:** Full access to user management, roles (RBAC), and system audit logs.

## 🛠 Tech Stack

**Frontend (Client App):**
* [React 18](https://reactjs.org/) (Vite)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Zustand](https://github.com/pmndrs/zustand) (State Management)
* React Router v6

**Backend (REST API):**
* [Node.js](https://nodejs.org/) & Express.js
* [Prisma ORM](https://www.prisma.io/)
* [PostgreSQL](https://www.postgresql.org/)
* AWS S3 SDK (Cloudflare R2 Integration for Video Hosting)
* Stripe API (Payments & Webhooks)

**Architecture & Security:**
* **Monorepo Structure:** npm workspaces for shared types and schemas.
* **End-to-End Type Safety:** `Zod` validation schemas shared between frontend and backend.
* **Stateless Authentication:** Double-Token JWT architecture (Access Token in memory + HttpOnly Refresh Token).
* **Robust Database Design:** 3rd Normal Form (3NF) PostgreSQL schema with cascade deletion and strict relational integrity.





🏃‍♂️ Спринт 1: Фундамент Бекенду (Backend Foundation)
Мета: Підготувати базу даних, захист та API для створення контенту інструкторами.

Task 1.1: Оновлення бази даних. Розгортання нової схеми Prisma (із Course, Section, Lecture, Enrollment) та створення базового сід-файлу (seed) для глобальних Категорій.

Task 1.2: Валідація даних. Створення Zod-схем у пакеті shared для безпечної перевірки вхідних даних при створенні курсів та лекцій.

Task 1.3: API Курсів (Course). Написання CRUD-роутів для створення курсу (тільки для INSTRUCTOR), його редагування та отримання списку власних курсів.

Task 1.4: API Конструктора (Curriculum). Написання роутів для створення Розділів (Section) та додавання Лекцій (Lecture) всередину розділів.

Task 1.5: Завантаження медіа. Налаштування бекенд-генерації тимчасових посилань (Presigned URLs) для прямого завантаження важких відеофайлів на Cloudflare R2 / AWS S3, минаючи сам Node.js сервер.

🏃‍♂️ Спринт 2: Публічна Вітрина (Public Marketplace - Frontend)
Мета: Створити "обличчя" платформи, де неавторизовані користувачі та студенти зможуть знаходити курси.

Task 2.1: Головна сторінка. Розробка Landing Page з банерами, списком категорій та сіткою "Популярні курси".

Task 2.2: Каталог і Пошук. Сторінка списку всіх опублікованих курсів (PUBLISHED) із працюючою фільтрацією за категорією, пошуком за назвою та сортуванням.

Task 2.3: Сторінка продажу курсу (Course Page). Публічна сторінка конкретного курсу. Виведення метаданих (ціна, автор, рейтинг), блоку "Чого ви навчитеся" та списку лекцій (Curriculum preview), де відео заблоковані, окрім тих, що мають статус isPreview: true.

🏃‍♂️ Спринт 3: Панель Інструктора (Instructor Dashboard - Frontend)
Мета: Дати авторам зручний інтерфейс для завантаження відео та управління своїм бізнесом.

Task 3.1: Дашборд Інструктора. Окрема зона (Layout), де автор бачить список своїх чернеток та активних курсів.

Task 3.2: Форма створення курсу. Інтерфейс для введення назви, вибору категорії, встановлення ціни та завантаження обкладинки курсу.

Task 3.3: Curriculum Builder UI. Візуальний конструктор структури курсу. Можливість додавати розділи та прикріплювати до них лекції.

Task 3.4: Uploader відео. Інтеграція фронтенд-компонента для завантаження відеолекцій на R2 із відображенням прогрес-бару завантаження.

Task 3.5: Модерація. Кнопка "Submit for Review", яка змінює статус курсу на PENDING (після чого Адмін може його підтвердити).

🏃‍♂️ Спринт 4: Монетизація та Платежі (Stripe & Paywall)
Мета: Інтегрувати прийом грошей та автоматизувати видачу доступу до відео.

Task 4.1: Інтеграція Stripe (Backend). Написання логіки генерації платіжних сесій (Checkout Session) для конкретного курсу.

Task 4.2: Оформлення замовлення (Frontend). Кнопка "Купити" на сторінці курсу, яка безпечно перенаправляє студента на сторінку оплати Stripe.

Task 4.3: Stripe Webhooks. Створення захищеного ендпоінту на бекенді, який слухає сигнали від Stripe про успішну оплату.

Task 4.4: Paywall Logic (Магія продажів). Після отримання вебхуку — автоматичне створення запису Transaction (чек) та Enrollment (квиток доступу) для студента.

🏃‍♂️ Спринт 5: Середовище Навчання (Learning Experience)
Мета: Дати студенту максимально комфортний інструмент для перегляду куплених відео.

Task 5.1: "Моє навчання" (My Learning). Сторінка-бібліотека студента, де виводяться картки лише тих курсів, які він успішно купив (через Enrollment).

Task 5.2: Course Player UI. Розробка екрану споживання (Split-screen): великий відеоплеєр зліва, навігація по лекціях (акордеон) справа.

Task 5.3: Захист контенту. Фронтенд- і бекенд-перевірка прав доступу перед рендером плеєра (щоб відео не можна було відкрити за прямим посиланням без покупки).

Task 5.4: Трекінг прогресу. Механізм відправки "пінгів" на бекенд під час перегляду відео для збереження секунди зупинки (watchedSec) та відмітки лекції як пройденої (isCompleted).

Task 5.5: Відгуки та Рейтинг. Форма для залишення 1-5 зірок та текстового коментаря після проходження частини курсу. Перерахунок середнього рейтингу курсу.

## 📦 Project Structure (Monorepo)

```text
Academy-seminarium/
├── apps/
│   ├── elearn-backend/     # Express REST API (Business logic, Prisma, Auth)
│   └── elearn-front/       # React SPA (User Interfaces)
├── packages/
│   └── shared/             # Shared Zod schemas, TypeScript interfaces
├── package.json            # Monorepo configuration
└── README.md