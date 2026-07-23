import { useState, useEffect, useRef, useMemo } from "react";
import { onAuth, signInGoogle, getRedirect, signUpEmail, signInEmail, getIdToken, logout as fbLogout, saveUserData, loadUserData } from "./firebase.js";
import { PROXY_URL } from "./config.js";

/* ═══════════════════════════════════════════════════════════
   NutriAI v2 — AI Ovqatlanish Kuzatuvchi
   ═══════════════════════════════════════════════════════════ */

// ─── I18N ────────────────────────────────────────────────
const I18N = {
  uz: {
    welcome: "NutriAI ga xush kelibsiz!",
    welcomeDesc: "Ovqatingizni suratga oling — AI bir zumda kaloriya va ozuqa moddalarini hisoblaydi",
    start: "Boshlash", next: "Davom etish", back: "Orqaga",
    name: "Ismingiz", gender: "Jins", male: "Erkak", female: "Ayol",
    meetYou: "Tanishaylik", bodyStats: "Jismoniy ko'rsatkichlar",
    birthYear: "Tug'ilgan yilingiz", height: "Bo'yingiz (sm)", weight: "Vazningiz (kg)", targetWeight: "Maqsad vazn (kg)",
    activityGoal: "Faollik va maqsad", activity: "Jismoniy faollik", goal: "Maqsadingiz",
    restrictions: "Cheklovlar (ixtiyoriy)",
    ready: "Tayyor", yourTargets: "Sizning kunlik maqsadlaringiz", caloriesPerDay: "kaloriya / kun",
    launchApp: "Ilovani boshlash", hello: "Salom", friend: "Do'stim", days: "kun",
    remaining: "Yana {n} kcal", exceeded: "{n} kcal oshdi",
    protein: "Oqsil", fat: "Yog'", carbs: "Uglev", fiber: "Tolalar",
    proteinFull: "Oqsil", carbsFull: "Uglevodlar",
    healthScore: "Bugungi salomatlik bahosi", basedOn: "{n} ta ovqat asosida",
    addMeal: "Ovqat qo'shish", photo: "Rasm", text: "Matn", search: "Qidiruv", favorites: "Sevimli",
    todayMeals: "Bugungi ovqatlar", noMeals: "Hali ovqat qo'shilmagan", tapButton: "Pastdagi + tugmasini bosing",
    analyze: "AI bilan tahlil qilish", analyzing: "AI tahlil qilmoqda...", save: "Saqlash", total: "Jami",
    water: "Suv", glasses: "stakan", weightLog: "Vazn tarixi", addWeight: "Vazn qo'shish",
    home: "Bosh sahifa", calendar: "Kalendar", coach: "Murabbiy", trophy: "Yutuqlar", profile: "Profil",
    settings: "Sozlamalar", language: "Til", darkMode: "Qorong'u rejim", notifications: "Bildirishnomalar",
    units: "O'lchov birliklari", export: "Ma'lumotlarni eksport", deleteAccount: "Barcha ma'lumotni o'chirish",
    on: "Yoqilgan", off: "O'chirilgan",
    dailyTargets: "Kunlik maqsadlar", weeklyStats: "Umumiy statistika",
    avgCalories: "O'rtacha kaloriya", mealCount: "Ovqatlar soni", bestScore: "Eng yaxshi baho", streak: "Ketma-ket kunlar",
    noData: "Ma'lumot yo'q",
    breakfast: "Nonushta", lunch: "Tushlik", dinner: "Kechki ovqat", snack: "Yengil tamaddi",
    askCoach: "Dietologdan so'rang...",
    coachIntro: "Salom! Men sizning shaxsiy dietologingizman. Ovqatlanish haqida istalgan savol bering.",
    takePhoto: "Rasm tanlash", photoHint: "Ovqat rasmini yuklang — AI uni taniydi",
    searchFood: "Ovqat qidirish...", quickAdd: "Tez qo'shish",
    dailySummary: "Kunlik xulosa", generateSummary: "Kunlik xulosa olish",
    lose: "Vazn yo'qotish", maintain: "Saqlash", gain: "Vazn oshirish",
    sedentary: "Kam harakatli", light: "O'rtacha faol", moderate: "Faol", veryActive: "Juda faol",
    sedentaryD: "Ofis ishi", lightD: "Haftada 1-3 mashq", moderateD: "Haftada 3-5 mashq", veryActiveD: "Har kuni mashq",
    placeholderMeal: "Masalan: bir kosa palov, non, ko'k choy",
    confirmReset: "Barcha ma'lumotlar o'chiriladi. Davom etasizmi?",
    signInTitle: "Hisobingizga kiring",
    signInDesc: "Ma'lumotlaringiz bulutda saqlanadi va barcha qurilmalaringizda sinxronlanadi",
    continueGoogle: "Google bilan davom etish",
    signingIn: "Kirilmoqda...",
    signInErr: "Kirishda xatolik. Qaytadan urinib ko'ring.",
    logout: "Hisobdan chiqish",
    emailF: "Email", passwordF: "Parol", nameF: "Ismingiz",
    loginBtn: "Kirish", registerBtn: "Ro'yxatdan o'tish",
    toRegister: "Hisobingiz yo'qmi? Ro'yxatdan o'ting",
    toLogin: "Hisobingiz bormi? Kiring", orDivider: "yoki",
    errEmail: "Email manzil noto'g'ri.",
    errWeakPass: "Parol kamida 6 ta belgidan iborat bo'lsin.",
    errInUse: "Bu email allaqachon ro'yxatdan o'tgan. Kiring.",
    errWrong: "Email yoki parol noto'g'ri.",
  },
  ru: {
    welcome: "Добро пожаловать в NutriAI!",
    welcomeDesc: "Сфотографируйте еду — ИИ мгновенно посчитает калории и БЖУ",
    start: "Начать", next: "Далее", back: "Назад",
    name: "Ваше имя", gender: "Пол", male: "Мужской", female: "Женский",
    meetYou: "Знакомство", bodyStats: "Физические показатели",
    birthYear: "Год рождения", height: "Рост (см)", weight: "Вес (кг)", targetWeight: "Целевой вес (кг)",
    activityGoal: "Активность и цель", activity: "Физическая активность", goal: "Ваша цель",
    restrictions: "Ограничения (необязательно)",
    ready: "Готово", yourTargets: "Ваши дневные цели", caloriesPerDay: "калорий / день",
    launchApp: "Начать", hello: "Привет", friend: "Друг", days: "дн.",
    remaining: "Ещё {n} ккал", exceeded: "Превышено на {n} ккал",
    protein: "Белки", fat: "Жиры", carbs: "Углев", fiber: "Клетч",
    proteinFull: "Белки", carbsFull: "Углеводы",
    healthScore: "Оценка питания сегодня", basedOn: "На основе {n} приёмов",
    addMeal: "Добавить еду", photo: "Фото", text: "Текст", search: "Поиск", favorites: "Избранное",
    todayMeals: "Приёмы пищи сегодня", noMeals: "Пока ничего не добавлено", tapButton: "Нажмите + внизу",
    analyze: "Анализ с ИИ", analyzing: "ИИ анализирует...", save: "Сохранить", total: "Итого",
    water: "Вода", glasses: "стаканов", weightLog: "История веса", addWeight: "Добавить вес",
    home: "Главная", calendar: "Календарь", coach: "Тренер", trophy: "Награды", profile: "Профиль",
    settings: "Настройки", language: "Язык", darkMode: "Тёмная тема", notifications: "Уведомления",
    units: "Единицы", export: "Экспорт данных", deleteAccount: "Удалить все данные",
    on: "Вкл", off: "Выкл",
    dailyTargets: "Дневные цели", weeklyStats: "Общая статистика",
    avgCalories: "Средние калории", mealCount: "Приёмов пищи", bestScore: "Лучшая оценка", streak: "Дней подряд",
    noData: "Нет данных",
    breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус",
    askCoach: "Спросите диетолога...",
    coachIntro: "Привет! Я ваш личный диетолог. Задайте любой вопрос о питании.",
    takePhoto: "Выбрать фото", photoHint: "Загрузите фото еды — ИИ её распознает",
    searchFood: "Поиск блюда...", quickAdd: "Быстрое добавление",
    dailySummary: "Итог дня", generateSummary: "Получить итог дня",
    lose: "Похудение", maintain: "Поддержание", gain: "Набор массы",
    sedentary: "Малоподвижный", light: "Умеренный", moderate: "Активный", veryActive: "Очень активный",
    sedentaryD: "Офисная работа", lightD: "1-3 трен./нед", moderateD: "3-5 трен./нед", veryActiveD: "Ежедневно",
    placeholderMeal: "Например: тарелка плова, лепёшка, зелёный чай",
    confirmReset: "Все данные будут удалены. Продолжить?",
    signInTitle: "Войдите в аккаунт",
    signInDesc: "Ваши данные сохранятся в облаке и синхронизируются на всех устройствах",
    continueGoogle: "Продолжить с Google",
    signingIn: "Вход...",
    signInErr: "Ошибка входа. Попробуйте снова.",
    logout: "Выйти",
    emailF: "Эл. почта", passwordF: "Пароль", nameF: "Ваше имя",
    loginBtn: "Войти", registerBtn: "Регистрация",
    toRegister: "Нет аккаунта? Зарегистрируйтесь",
    toLogin: "Есть аккаунт? Войдите", orDivider: "или",
    errEmail: "Неверный email.",
    errWeakPass: "Пароль минимум 6 символов.",
    errInUse: "Этот email уже зарегистрирован. Войдите.",
    errWrong: "Неверный email или пароль.",
  },
  en: {
    welcome: "Welcome to NutriAI!",
    welcomeDesc: "Snap a photo of your meal — AI instantly calculates calories and macros",
    start: "Get started", next: "Continue", back: "Back",
    name: "Your name", gender: "Gender", male: "Male", female: "Female",
    meetYou: "Let's meet", bodyStats: "Body stats",
    birthYear: "Birth year", height: "Height (cm)", weight: "Weight (kg)", targetWeight: "Target weight (kg)",
    activityGoal: "Activity & goal", activity: "Activity level", goal: "Your goal",
    restrictions: "Restrictions (optional)",
    ready: "All set", yourTargets: "Your daily targets", caloriesPerDay: "calories / day",
    launchApp: "Launch app", hello: "Hello", friend: "friend", days: "days",
    remaining: "{n} kcal left", exceeded: "{n} kcal over",
    protein: "Protein", fat: "Fat", carbs: "Carbs", fiber: "Fiber",
    proteinFull: "Protein", carbsFull: "Carbs",
    healthScore: "Today's health score", basedOn: "Based on {n} meals",
    addMeal: "Add meal", photo: "Photo", text: "Text", search: "Search", favorites: "Favorites",
    todayMeals: "Today's meals", noMeals: "Nothing logged yet", tapButton: "Tap + below",
    analyze: "Analyze with AI", analyzing: "AI is analyzing...", save: "Save", total: "Total",
    water: "Water", glasses: "glasses", weightLog: "Weight history", addWeight: "Log weight",
    home: "Home", calendar: "Calendar", coach: "Coach", trophy: "Awards", profile: "Profile",
    settings: "Settings", language: "Language", darkMode: "Dark mode", notifications: "Notifications",
    units: "Units", export: "Export data", deleteAccount: "Delete all data",
    on: "On", off: "Off",
    dailyTargets: "Daily targets", weeklyStats: "Overall stats",
    avgCalories: "Avg calories", mealCount: "Meals logged", bestScore: "Best score", streak: "Day streak",
    noData: "No data",
    breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
    askCoach: "Ask your dietitian...",
    coachIntro: "Hi! I'm your personal dietitian. Ask me anything about nutrition.",
    takePhoto: "Choose photo", photoHint: "Upload a meal photo — AI will identify it",
    searchFood: "Search food...", quickAdd: "Quick add",
    dailySummary: "Daily summary", generateSummary: "Get daily summary",
    lose: "Lose weight", maintain: "Maintain", gain: "Gain weight",
    sedentary: "Sedentary", light: "Lightly active", moderate: "Active", veryActive: "Very active",
    sedentaryD: "Desk job", lightD: "1-3 workouts/wk", moderateD: "3-5 workouts/wk", veryActiveD: "Daily training",
    placeholderMeal: "e.g. bowl of plov, flatbread, green tea",
    confirmReset: "All data will be erased. Continue?",
    signInTitle: "Sign in",
    signInDesc: "Your data is saved to the cloud and synced across all your devices",
    continueGoogle: "Continue with Google",
    signingIn: "Signing in...",
    signInErr: "Sign-in failed. Please try again.",
    logout: "Log out",
    emailF: "Email", passwordF: "Password", nameF: "Your name",
    loginBtn: "Sign in", registerBtn: "Sign up",
    toRegister: "No account? Sign up",
    toLogin: "Have an account? Sign in", orDivider: "or",
    errEmail: "Invalid email address.",
    errWeakPass: "Password must be at least 6 characters.",
    errInUse: "This email is already registered. Sign in.",
    errWrong: "Wrong email or password.",
  },
};

// ─── UZBEK FOOD DATABASE ────────────────────────────────
const FOOD_DB = [
  { id: 1, uz: "Palov (osh)", ru: "Плов", en: "Plov", emoji: "🍛", portion: "300g", cal: 490, p: 17, f: 18, c: 62, fi: 3, score: 6.5 },
  { id: 2, uz: "Lag'mon", ru: "Лагман", en: "Lagman", emoji: "🍜", portion: "400g", cal: 420, p: 20, f: 14, c: 52, fi: 4, score: 7 },
  { id: 3, uz: "Somsa (go'shtli)", ru: "Самса", en: "Samsa", emoji: "🥟", portion: "1 dona · 120g", cal: 380, p: 13, f: 22, c: 33, fi: 1.5, score: 4.5 },
  { id: 4, uz: "Manti", ru: "Манты", en: "Manti", emoji: "🥟", portion: "4 dona · 320g", cal: 480, p: 24, f: 20, c: 50, fi: 2.5, score: 6.5 },
  { id: 5, uz: "Shashlik (mol)", ru: "Шашлык", en: "Shashlik", emoji: "🍢", portion: "2 sixcha · 200g", cal: 430, p: 42, f: 28, c: 2, fi: 0, score: 7 },
  { id: 6, uz: "Mastava", ru: "Мастава", en: "Mastava", emoji: "🍲", portion: "350g", cal: 260, p: 12, f: 9, c: 33, fi: 3, score: 8 },
  { id: 7, uz: "Chuchvara", ru: "Чучвара", en: "Chuchvara", emoji: "🥟", portion: "300g", cal: 340, p: 16, f: 13, c: 40, fi: 2, score: 6.5 },
  { id: 8, uz: "No'xat sho'rva", ru: "Нохат шурпа", en: "Chickpea soup", emoji: "🍲", portion: "350g", cal: 290, p: 15, f: 10, c: 36, fi: 7, score: 8.5 },
  { id: 9, uz: "Obi non", ru: "Лепёшка", en: "Flatbread", emoji: "🫓", portion: "1/4 non · 80g", cal: 220, p: 7, f: 2, c: 44, fi: 2, score: 6 },
  { id: 10, uz: "Qatiq", ru: "Катык", en: "Katyk", emoji: "🥛", portion: "200ml", cal: 110, p: 8, f: 5, c: 9, fi: 0, score: 8.5 },
  { id: 11, uz: "Suzma", ru: "Сузьма", en: "Suzma", emoji: "🥣", portion: "100g", cal: 145, p: 12, f: 9, c: 4, fi: 0, score: 8 },
  { id: 12, uz: "Achchiq-chuchuk", ru: "Ачик-чучук", en: "Tomato salad", emoji: "🥗", portion: "150g", cal: 45, p: 1.5, f: 1, c: 8, fi: 2.5, score: 9.5 },
  { id: 13, uz: "Norin", ru: "Норин", en: "Norin", emoji: "🍝", portion: "300g", cal: 410, p: 26, f: 16, c: 42, fi: 2, score: 6.5 },
  { id: 14, uz: "Dimlama", ru: "Димлама", en: "Dimlama", emoji: "🥘", portion: "350g", cal: 320, p: 20, f: 15, c: 28, fi: 5, score: 8 },
  { id: 15, uz: "Ko'k choy", ru: "Зелёный чай", en: "Green tea", emoji: "🍵", portion: "250ml", cal: 2, p: 0, f: 0, c: 0, fi: 0, score: 10 },
  { id: 16, uz: "Qaynatilgan tuxum", ru: "Варёное яйцо", en: "Boiled egg", emoji: "🥚", portion: "1 dona · 55g", cal: 78, p: 6.5, f: 5.3, c: 0.6, fi: 0, score: 9 },
  { id: 17, uz: "Tovuq ko'kragi", ru: "Куриная грудка", en: "Chicken breast", emoji: "🍗", portion: "150g", cal: 248, p: 46, f: 5.4, c: 0, fi: 0, score: 9.5 },
  { id: 18, uz: "Guruch (oq)", ru: "Варёный рис", en: "White rice", emoji: "🍚", portion: "200g", cal: 260, p: 5.4, f: 0.6, c: 57, fi: 0.8, score: 6 },
  { id: 19, uz: "Grechka", ru: "Гречка", en: "Buckwheat", emoji: "🌾", portion: "200g", cal: 220, p: 8, f: 2, c: 42, fi: 5.5, score: 9 },
  { id: 20, uz: "Olma", ru: "Яблоко", en: "Apple", emoji: "🍎", portion: "1 dona · 180g", cal: 94, p: 0.5, f: 0.3, c: 25, fi: 4.3, score: 9.5 },
  { id: 21, uz: "Banan", ru: "Банан", en: "Banana", emoji: "🍌", portion: "1 dona · 120g", cal: 107, p: 1.3, f: 0.4, c: 27, fi: 3.1, score: 8.5 },
  { id: 22, uz: "Non + choy", ru: "Лепёшка с чаем", en: "Bread & tea", emoji: "🫓", portion: "80g + 250ml", cal: 222, p: 7, f: 2, c: 44, fi: 2, score: 5.5 },
  { id: 23, uz: "Sho'rva (mol go'shtli)", ru: "Шурпа", en: "Shurpa", emoji: "🍲", portion: "400g", cal: 310, p: 22, f: 16, c: 20, fi: 3.5, score: 8 },
  { id: 24, uz: "Tvorog (5%)", ru: "Творог 5%", en: "Cottage cheese", emoji: "🧀", portion: "150g", cal: 180, p: 25, f: 7.5, c: 4.5, fi: 0, score: 9 },
];

const MEAL_TYPES = {
  breakfast: { icon: "🌅", color: "#f59e0b" },
  lunch: { icon: "☀️", color: "#22c55e" },
  dinner: { icon: "🌙", color: "#6366f1" },
  snack: { icon: "🍎", color: "#ec4899" },
};

const ACTIVITY = [
  { key: "sedentary", factor: 1.2 },
  { key: "light", factor: 1.375 },
  { key: "moderate", factor: 1.55 },
  { key: "veryActive", factor: 1.725 },
];

const GOALS = [
  { key: "lose", icon: "📉", offset: -500 },
  { key: "maintain", icon: "⚖️", offset: 0 },
  { key: "gain", icon: "📈", offset: 300 },
];

const RESTRICTIONS = [
  { key: "halal", uz: "Halol", ru: "Халяль", en: "Halal", icon: "☪️" },
  { key: "vegetarian", uz: "Vegetarian", ru: "Вегетар.", en: "Vegetarian", icon: "🥬" },
  { key: "vegan", uz: "Vegan", ru: "Веган", en: "Vegan", icon: "🌱" },
  { key: "lactose", uz: "Laktozasiz", ru: "Без лактозы", en: "Lactose-free", icon: "🥛" },
  { key: "gluten", uz: "Glutensiz", ru: "Без глютена", en: "Gluten-free", icon: "🌾" },
];

// ─── Themes ──────────────────────────────────────────────
const THEMES = {
  light: {
    bg: "linear-gradient(180deg,#f0fdf4 0%,#ecfdf5 50%,#f0fdf4 100%)",
    headerBg: "linear-gradient(180deg,#dcfce7 0%,#f0fdf4 100%)",
    card: "#ffffff", cardBorder: "rgba(22,163,74,0.07)",
    text: "#14532d", text2: "#1f2937", muted: "#8b9a8b",
    input: "#f8fdf8", inputBorder: "#d4e8d4",
    navBg: "rgba(255,255,255,0.92)", divider: "#f1f5f1",
    shadow: "0 1px 3px rgba(22,101,52,0.06),0 8px 24px rgba(22,101,52,0.05)",
    ringTrack: "rgba(22,163,74,0.1)", chipBg: "#f0fdf4", totalBg: "#f0fdf4",
    tipBg: "#fffbeb", tipBorder: "#fef3c7", tipText: "#92400e",
    streakBg: "linear-gradient(135deg,#fff7ed,#ffedd5)", streakBorder: "#fed7aa", streakText: "#9a3412",
    avatarBg: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  },
  dark: {
    bg: "linear-gradient(180deg,#021a0a 0%,#04220e 50%,#021a0a 100%)",
    headerBg: "linear-gradient(180deg,#0a2e16 0%,#021a0a 100%)",
    card: "#0a2614", cardBorder: "rgba(74,222,128,0.1)",
    text: "#dcfce7", text2: "#e8f5e8", muted: "#6b8a6b",
    input: "#08200f", inputBorder: "#1a3d24",
    navBg: "rgba(3,25,11,0.95)", divider: "#123018",
    shadow: "0 1px 3px rgba(0,0,0,0.4),0 8px 24px rgba(0,0,0,0.3)",
    ringTrack: "rgba(74,222,128,0.12)", chipBg: "#0d2e17", totalBg: "#0d3319",
    tipBg: "#3b2f0a", tipBorder: "#5c4a10", tipText: "#fde68a",
    streakBg: "#2e1a08", streakBorder: "#4a2c0e", streakText: "#fdba74",
    avatarBg: "#123a1d",
  },
};

const GREEN = "#16a34a", GREEN_LT = "#22c55e", AMBER = "#f59e0b";
const INDIGO = "#6366f1", PINK = "#ec4899", RED = "#ef4444", BLUE = "#3b82f6";

// ─── Helpers ─────────────────────────────────────────────
function calcTargets(p) {
  const age = new Date().getFullYear() - (Number(p.birthYear) || 1998);
  const w = Number(p.weight) || 70, h = Number(p.height) || 175;
  const bmr = p.gender === "male"
    ? 10 * w + 6.25 * h - 5 * age + 5
    : 10 * w + 6.25 * h - 5 * age - 161;
  const f = ACTIVITY.find((a) => a.key === p.activity)?.factor || 1.375;
  const off = GOALS.find((g) => g.key === p.goal)?.offset || 0;
  const calories = Math.max(1200, Math.round(bmr * f + off));
  return {
    calories,
    protein: Math.round((calories * 0.3) / 4),
    fat: Math.round((calories * 0.25) / 9),
    carbs: Math.round((calories * 0.45) / 4),
    fiber: 30,
    water: Math.max(6, Math.round((w * 0.033 * 1000) / 250)),
  };
}

const fmt = (n) => Math.round(n || 0).toLocaleString();
const dayKey = (d) => new Date(d).toDateString();

// Har ovqat uchun noyob id — tez ketma-ket qo'shilsa ham to'qnashmaydi
let _idCounter = 0;
const newId = () => `${Date.now()}-${_idCounter++}-${Math.random().toString(36).slice(2, 6)}`;

async function store(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}
async function load(key, fallback) {
  try {
    const r = localStorage.getItem(key);
    return r != null ? JSON.parse(r) : fallback;
  } catch { return fallback; }
}

// ─── AI: Google Gemini API (bepul tarif) — kalit foydalanuvchi brauzerida saqlanadi ─
const API_KEY_STORAGE = "nutriai:apikey";
export const getApiKey = () => { try { return localStorage.getItem(API_KEY_STORAGE) || ""; } catch { return ""; } };
export const setApiKey = (k) => { try { k ? localStorage.setItem(API_KEY_STORAGE, k) : localStorage.removeItem(API_KEY_STORAGE); } catch { /* noop */ } };

// Bir nechta model — biri topilmasa (404) yoki kvotasi tugasa (429) keyingisiga o'tadi.
// Har modelning bepul kvotasi alohida.
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// Anthropic uslubidagi messages'ni Gemini "contents" formatiga o'girish
function toGeminiContents(messages) {
  return messages.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    let parts;
    if (typeof m.content === "string") {
      parts = [{ text: m.content }];
    } else if (Array.isArray(m.content)) {
      parts = m.content.map((b) => {
        if (b.type === "text") return { text: b.text };
        if (b.type === "image") return { inline_data: { mime_type: b.source.media_type, data: b.source.data } };
        return { text: "" };
      });
    } else {
      parts = [{ text: String(m.content ?? "") }];
    }
    return { role, parts };
  });
}

function readGemini(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const out = parts.map((p) => p.text || "").join("");
  if (!out) throw new Error("BO'SH JAVOB (ehtimol xavfsizlik filtri)");
  return out;
}

// (A) Foydalanuvchining o'z kaliti bilan to'g'ridan-to'g'ri Gemini
async function callGeminiDirect(contents, generationConfig, key) {
  const body = JSON.stringify({ contents, generationConfig });
  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (resp.ok) return readGemini(await resp.json());
    if (resp.status === 404 || resp.status === 429) {
      let d = ""; try { const j = await resp.json(); d = j?.error?.message || ""; } catch { /* noop */ }
      lastErr = new Error(`API_${resp.status}${d ? ": " + d.slice(0, 90) : ""}`);
      continue;
    }
    let detail = ""; try { const j = await resp.json(); detail = j?.error?.message || ""; } catch { /* noop */ }
    throw new Error(`API_${resp.status}${detail ? ": " + detail.slice(0, 120) : ""}`);
  }
  throw lastErr || new Error("API_ERR");
}

// (B) Backend proksi (egasining kaliti) — Firebase token bilan
async function callProxy(contents, generationConfig) {
  const token = await getIdToken();
  if (!token) throw new Error("Avval hisobingizga kiring");
  const resp = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ contents, generationConfig }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error?.message ? `API_${resp.status}: ${String(data.error.message).slice(0, 120)}` : `API_${resp.status}`);
  return readGemini(data);
}

async function callAI(messages, maxTokens = 1200) {
  const contents = toGeminiContents(messages);
  const generationConfig = { maxOutputTokens: maxTokens, temperature: 0.4 };
  const key = getApiKey();
  if (key) return callGeminiDirect(contents, generationConfig, key); // o'z kaliti bo'lsa
  if (PROXY_URL) return callProxy(contents, generationConfig);        // aks holda backend
  throw new Error("NO_API_KEY");
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  return JSON.parse(s >= 0 ? clean.slice(s, e + 1) : clean);
}

// ─── UI primitives ───────────────────────────────────────
function Ring({ value, max, size = 200, sw = 16, color, track, children }) {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const pct = Math.min((value || 0) / (max || 1), 1);
  const [a, setA] = useState(0);
  useEffect(() => {
    let f; const t0 = performance.now();
    const run = (now) => {
      const t = Math.min((now - t0) / 900, 1);
      setA((1 - Math.pow(1 - t, 3)) * pct);
      if (t < 1) f = requestAnimationFrame(run);
    };
    f = requestAnimationFrame(run);
    return () => cancelAnimationFrame(f);
  }, [pct]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - a)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function Bar({ value, max, color, label, T }) {
  const pct = Math.min(((value || 0) / (max || 1)) * 100, 100);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
        <span style={{ fontWeight: 700, color: T.text2 }}>{label}</span>
        <span style={{ color: T.muted }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: T.ringTrack, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 4, background: color, width: `${pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function Score({ v }) {
  const c = v >= 8 ? GREEN : v >= 5 ? "#eab308" : RED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 11px",
      borderRadius: 20, fontSize: 13, fontWeight: 800, background: c + "22", color: c,
    }}>
      {v >= 8 ? "★" : v >= 5 ? "◆" : "▼"} {Number(v).toFixed(1)}
    </span>
  );
}

function WeightChart({ data, T }) {
  if (data.length < 2) return null;
  const W = 300, H = 90, pad = 10;
  const ws = data.map((d) => d.w);
  const min = Math.min(...ws) - 0.5, max = Math.max(...ws) + 0.5;
  const pts = data.map((d, i) => [
    pad + (i / (data.length - 1)) * (W - pad * 2),
    H - pad - ((d.w - min) / (max - min || 1)) * (H - pad * 2),
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90, display: "block" }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN_LT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GREEN_LT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wgrad)" />
      <path d={path} fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 2.5}
          fill={i === pts.length - 1 ? GREEN : T.card} stroke={GREEN} strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function NutriAI() {
  const [screen, setScreen] = useState("splash");
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState("uz");
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("home");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(undefined); // undefined = tekshirilmoqda, null = kirmagan
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [emailV, setEmailV] = useState("");
  const [passV, setPassV] = useState("");
  const [nameV, setNameV] = useState("");

  const [profile, setProfile] = useState({
    name: "", gender: "male", birthYear: 1998, height: 175,
    weight: 75, targetWeight: 70, activity: "light", goal: "lose", restrictions: [],
  });
  const [meals, setMeals] = useState([]);
  const [waterLog, setWaterLog] = useState({});
  const [weights, setWeights] = useState([]);
  const [favorites, setFavorites] = useState([1, 9, 15]);
  const [streak, setStreak] = useState(0);

  const [modal, setModal] = useState(null);
  const [mealTab, setMealTab] = useState("photo");
  const [mealText, setMealText] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [imgData, setImgData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [justAdded, setJustAdded] = useState(null); // bazadan qo'shilganda qisqa "✓" belgisi

  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  const [selectedDay, setSelectedDay] = useState(null);
  const [daySummary, setDaySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(() => !!getApiKey());

  const t = I18N[lang];
  const T = THEMES[dark ? "dark" : "light"];
  const targets = useMemo(() => calcTargets(profile), [profile]);

  // ── Auth holatini kuzatish ──
  useEffect(() => onAuth((u) => {
    setUser(u ? { uid: u.uid, name: u.displayName, email: u.email, photo: u.photoURL } : null);
  }), []);

  // ── Redirect (telefon) orqali kirishdan qaytgan xatoni ushlash ──
  useEffect(() => {
    getRedirect().catch((e) => {
      console.error("Google redirect sign-in error:", e?.code, e?.message);
      setAuthError((e?.code || "") + " — " + t.signInErr);
    });
  }, []);

  // ── Foydalanuvchi ma'lumotini yuklash (bulut → lokal zaxira) ──
  useEffect(() => {
    let cancelled = false;
    if (user === undefined) return;              // auth hali tekshirilmoqda → splash
    if (user === null) { setScreen("login"); setLoaded(true); return; }
    (async () => {
      let saved = null;
      try { saved = await loadUserData(user.uid); } catch { /* offline */ }
      const localCache = await load("nutriai:state", null);
      if (!saved && localCache) saved = localCache; // eski lokal ma'lumotni birinchi kirishda ko'chirish
      if (cancelled) return;

      if (saved) {
        if (saved.profile) setProfile(saved.profile);
        if (saved.meals) {
          const imgMap = {};
          (localCache?.meals || []).forEach((m) => { if (m.img) imgMap[m.id] = m.img; });
          setMeals(saved.meals.map((m) => ({ ...m, time: new Date(m.time), img: m.img || imgMap[m.id] || null })));
        }
        if (saved.waterLog) setWaterLog(saved.waterLog);
        if (saved.weights) setWeights(saved.weights);
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.lang) setLang(saved.lang);
        setDark(!!saved.dark);
        setScreen(saved.onboarded ? "app" : "onboarding");
      } else {
        if (user.name) setProfile((p) => ({ ...p, name: p.name || user.name.split(" ")[0] }));
        setScreen("onboarding");
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // ── Saqlash: lokal zaxira (rasmlar bilan) + bulut (debounced) ──
  useEffect(() => {
    if (!loaded || screen === "splash" || screen === "login" || !user) return;
    const state = {
      profile, meals, waterLog, weights, favorites, lang, dark,
      onboarded: screen === "app",
    };
    store("nutriai:state", state);
    const id = setTimeout(() => { saveUserData(user.uid, state).catch(() => {}); }, 800);
    return () => clearTimeout(id);
  }, [profile, meals, waterLog, weights, favorites, lang, dark, screen, loaded, user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, chatLoading]);

  // ── Derived ──
  const today = dayKey(new Date());
  const todayMeals = meals.filter((m) => dayKey(m.time) === today);
  const tot = todayMeals.reduce((a, m) => ({
    calories: a.calories + m.cal, protein: a.protein + m.p,
    fat: a.fat + m.f, carbs: a.carbs + m.c, fiber: a.fiber + m.fi,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });
  const todayWater = waterLog[today] || 0;
  const remaining = targets.calories - tot.calories;
  const todayScore = todayMeals.length ? todayMeals.reduce((s, m) => s + m.score, 0) / todayMeals.length : 0;

  useEffect(() => {
    let s = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (meals.some((m) => dayKey(m.time) === dayKey(d))) s++;
      else if (i > 0) break;
    }
    setStreak(s);
  }, [meals]);

  useEffect(() => { setDaySummary(null); }, [todayMeals.length]);

  // ── AI ──
  const langName = { uz: "Uzbek", ru: "Russian", en: "English" }[lang];
  const restrictionText = profile.restrictions.length
    ? profile.restrictions.map((r) => RESTRICTIONS.find((x) => x.key === r)?.en).join(", ") : "none";

  const sysRules = `You are a professional nutrition analyst with deep knowledge of Uzbek and Central Asian cuisine (palov, lag'mon, somsa, manti, shashlik, mastava, chuchvara, norin, dimlama, shorva, non, qatiq, suzma, achchiq-chuchuk).
User dietary restrictions: ${restrictionText}.
Rules:
- Estimate realistic portion sizes typical for Uzbekistan.
- Reply with VALID JSON ONLY. No markdown fences, no extra text.
- Write "meal_name", each item "name", and "recommendation" in ${langName}.
- health_score is 1-10 (10 = very healthy). recommendation max 22 words.
JSON schema: {"meal_name":"string","items":[{"name":"string","portion":"string e.g. 250g","calories":number,"protein":number,"fat":number,"carbs":number,"fiber":number}],"total":{"calories":number,"protein":number,"fat":number,"carbs":number,"fiber":number},"health_score":number,"recommendation":"string"}`;

  const errMsg = () => {
    if (!getApiKey()) return lang === "uz" ? "AI uchun Profil → Sozlamalar → «AI kaliti» dan Google Gemini API kalitini kiriting (bepul: aistudio.google.com/apikey)."
      : lang === "ru" ? "Для ИИ введите ключ Google Gemini API: Профиль → Настройки → «AI kaliti» (бесплатно: aistudio.google.com/apikey)."
      : "To use AI, add your free Google Gemini API key in Profile → Settings → \"AI kaliti\" (aistudio.google.com/apikey).";
    return lang === "uz" ? "Tahlil qilib bo'lmadi. Qaytadan urinib ko'ring yoki qo'lda kiriting."
      : lang === "ru" ? "Не удалось проанализировать. Попробуйте снова." : "Analysis failed. Try again.";
  };

  const analyzePhoto = async () => {
    if (!imgData) return;
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const text = await callAI([{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imgData } },
          { type: "text", text: `${sysRules}\n\nAnalyze every visible food item in this photo.` },
        ],
      }]);
      setAiResult(parseJSON(text));
    } catch (e) { console.error("analyzePhoto:", e); setAiError(errMsg() + (e?.message ? `  [${e.message}]` : "")); }
    setAiLoading(false);
  };

  const analyzeText = async () => {
    if (!mealText.trim()) return;
    setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const text = await callAI([{
        role: "user",
        content: `${sysRules}\n\nUser described their meal: "${mealText}"\nAnalyze it.`,
      }]);
      setAiResult(parseJSON(text));
    } catch (e) { console.error("analyzeText:", e); setAiError(errMsg() + (e?.message ? `  [${e.message}]` : "")); }
    setAiLoading(false);
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        setImgData(cv.toDataURL("image/jpeg", 0.72).split(",")[1]);
        setAiResult(null); setAiError(null);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const recalcTotal = (items) => {
    const tt = items.reduce((a, it) => ({
      calories: a.calories + it.calories, protein: a.protein + it.protein,
      fat: a.fat + it.fat, carbs: a.carbs + it.carbs, fiber: a.fiber + it.fiber,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });
    Object.keys(tt).forEach((k) => (tt[k] = +tt[k].toFixed(1)));
    return tt;
  };

  const adjustItem = (i, delta) => {
    setAiResult((r) => {
      const items = r.items.map((it, idx) => {
        if (idx !== i) return it;
        const base = it._base || { ...it };
        const k = Math.max(0.25, Math.min(4, (it._k || 1) + delta));
        return {
          ...it, _base: base, _k: k,
          calories: Math.round(base.calories * k),
          protein: +(base.protein * k).toFixed(1),
          fat: +(base.fat * k).toFixed(1),
          carbs: +(base.carbs * k).toFixed(1),
          fiber: +(base.fiber * k).toFixed(1),
          portion: `${base.portion} × ${k.toFixed(2).replace(/\.?0+$/, "")}`,
        };
      });
      return { ...r, items, total: recalcTotal(items) };
    });
  };

  const removeItem = (i) => {
    setAiResult((r) => {
      const items = r.items.filter((_, idx) => idx !== i);
      if (!items.length) return null;
      return { ...r, items, total: recalcTotal(items) };
    });
  };

  const saveMeal = () => {
    if (!aiResult) return;
    setMeals((prev) => [{
      id: newId(), type: mealType, name: aiResult.meal_name,
      items: aiResult.items,
      cal: aiResult.total.calories, p: aiResult.total.protein,
      f: aiResult.total.fat, c: aiResult.total.carbs, fi: aiResult.total.fiber,
      score: aiResult.health_score, rec: aiResult.recommendation,
      img: imgData ? `data:image/jpeg;base64,${imgData}` : null,
      time: new Date(),
    }, ...prev]);
    closeMeal();
  };

  const addFromDB = (food) => {
    setMeals((prev) => [{
      id: newId(), type: mealType, name: food[lang],
      items: [{ name: food[lang], portion: food.portion, calories: food.cal, protein: food.p, fat: food.f, carbs: food.c, fiber: food.fi }],
      cal: food.cal, p: food.p, f: food.f, c: food.c, fi: food.fi,
      score: food.score, rec: null, emoji: food.emoji, time: new Date(),
    }, ...prev]);
    // Modal ochiq qoladi — foydalanuvchi ketma-ket bir necha ovqat qo'sha oladi.
    // Qisqa "qo'shildi" belgisi:
    setJustAdded(food.id);
    setTimeout(() => setJustAdded((v) => (v === food.id ? null : v)), 900);
  };

  const closeMeal = () => {
    setModal(null); setAiResult(null); setMealText("");
    setImgData(null); setAiError(null); setSearchQ("");
  };

  const toggleFav = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const setWater = (n) =>
    setWaterLog((w) => ({ ...w, [today]: Math.max(0, Math.min(20, n)) }));

  const addWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 400) return;
    setWeights((p) => [...p, { w, d: new Date().toISOString() }].slice(-60));
    setProfile((p) => ({ ...p, weight: w }));
    setNewWeight(""); setModal(null);
  };

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    const history = [...chat, { role: "user", content: q }];
    setChat(history); setChatInput(""); setChatLoading(true);
    try {
      const ctx = `You are a warm, practical dietitian inside a nutrition app. Reply in ${langName}. Under 120 words, concrete and actionable, plain text (no markdown). You know Uzbek cuisine well.
User: ${profile.gender}, ${new Date().getFullYear() - profile.birthYear} y/o, ${profile.height}cm, ${profile.weight}kg, goal: ${profile.goal}, restrictions: ${restrictionText}.
Daily targets: ${targets.calories} kcal, ${targets.protein}g protein, ${targets.fat}g fat, ${targets.carbs}g carbs.
Eaten today: ${fmt(tot.calories)} kcal, ${fmt(tot.protein)}g protein, ${fmt(tot.fat)}g fat, ${fmt(tot.carbs)}g carbs. Meals: ${todayMeals.map((m) => m.name).join(", ") || "none yet"}.
Never diagnose; suggest seeing a doctor for medical concerns.`;
      const msgs = history.map((m, i) => i === 0 ? { role: "user", content: `${ctx}\n\nUser: ${m.content}` } : m);
      const text = await callAI(msgs, 700);
      setChat([...history, { role: "assistant", content: text }]);
    } catch {
      setChat([...history, { role: "assistant", content: errMsg() }]);
    }
    setChatLoading(false);
  };

  const getDailySummary = async () => {
    if (!todayMeals.length) return;
    setSummaryLoading(true);
    try {
      const text = await callAI([{
        role: "user",
        content: `You are a friendly nutrition coach. Reply in ${langName}, under 100 words, warm and supportive, plain text only (no markdown).
Give: 1) short summary of the day, 2) one thing done well, 3) one thing to improve, 4) a motivating tip for tomorrow.
Targets: ${targets.calories} kcal / ${targets.protein}g P / ${targets.fat}g F / ${targets.carbs}g C / ${targets.fiber}g fiber.
Eaten: ${fmt(tot.calories)} kcal / ${fmt(tot.protein)}g P / ${fmt(tot.fat)}g F / ${fmt(tot.carbs)}g C / ${fmt(tot.fiber)}g fiber.
Water: ${todayWater}/${targets.water} glasses.
Meals: ${todayMeals.map((m) => `${m.name} (${m.cal}kcal, score ${m.score})`).join("; ")}.`,
      }], 500);
      setDaySummary(text);
    } catch { setDaySummary(errMsg()); }
    setSummaryLoading(false);
  };

  // ── Auth handlers ──
  const handleGoogle = async () => {
    setSigningIn(true); setAuthError(null);
    try { await signInGoogle(); }
    catch (e) {
      console.error("Google sign-in error:", e?.code, e?.message);
      setAuthError((e?.code ? e.code + " — " : "") + t.signInErr);
      setSigningIn(false);
    }
  };

  const authErrText = (code) => {
    if (code === "auth/invalid-email") return t.errEmail;
    if (code === "auth/weak-password") return t.errWeakPass;
    if (code === "auth/email-already-in-use") return t.errInUse;
    if (["auth/wrong-password", "auth/user-not-found", "auth/invalid-credential"].includes(code)) return t.errWrong;
    return (code ? code + " — " : "") + t.signInErr;
  };

  const handleEmailAuth = async () => {
    if (!emailV.trim() || !passV || signingIn) return;
    setSigningIn(true); setAuthError(null);
    try {
      if (authMode === "register") await signUpEmail(emailV.trim(), passV, nameV.trim());
      else await signInEmail(emailV.trim(), passV);
      // muvaffaqiyat → onAuth ekranni almashtiradi
    } catch (e) {
      console.error("Email auth error:", e?.code, e?.message);
      setAuthError(authErrText(e?.code));
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try { localStorage.removeItem("nutriai:state"); } catch { /* noop */ }
    try { await fbLogout(); } catch { /* noop */ }
    setMeals([]); setWeights([]); setWaterLog({}); setFavorites([1, 9, 15]);
    setChat([]); setDaySummary(null); setStep(0);
    setProfile({
      name: "", gender: "male", birthYear: 1998, height: 175,
      weight: 75, targetWeight: 70, activity: "light", goal: "lose", restrictions: [],
    });
  };

  // ── Styles ──
  const S = {
    app: {
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: T.bg, position: "relative", color: T.text2,
    },
    card: { background: T.card, borderRadius: 20, padding: 18, boxShadow: T.shadow, border: `1px solid ${T.cardBorder}` },
    btn: {
      background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", border: "none",
      borderRadius: 14, padding: "14px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      width: "100%", boxShadow: "0 4px 14px rgba(22,163,74,.3)",
    },
    btnGhost: {
      background: "transparent", color: GREEN, border: `2px solid ${GREEN}`, borderRadius: 14,
      padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%",
    },
    input: {
      width: "100%", padding: "13px 15px", borderRadius: 12, fontSize: 16,
      border: `1.5px solid ${T.inputBorder}`, outline: "none",
      background: T.input, color: T.text2, boxSizing: "border-box",
    },
    h2: { fontSize: 23, fontWeight: 800, color: T.text, marginBottom: 16 },
    label: { fontSize: 13.5, fontWeight: 700, color: T.text2, display: "block", marginBottom: 7 },
  };

  const css = `
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.25);opacity:1}}
    @keyframes logo{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
    *{box-sizing:border-box;margin:0}
    body{margin:0;background:${dark ? "#021a0a" : "#f0fdf4"}}
    ::-webkit-scrollbar{width:0;height:0}
    input,textarea,button{font-family:'DM Sans','Segoe UI',system-ui,sans-serif}
    input:focus,textarea:focus{border-color:${GREEN}!important}
    button:active{transform:scale(.97)}
    button:focus-visible{outline:2px solid ${GREEN};outline-offset:2px}
    .login-inp::placeholder{color:rgba(255,255,255,.5)}
    .login-inp:focus{border-color:#4ade80!important}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  `;

  // ═══ SPLASH ═══
  if (screen === "splash") {
    return (
      <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(150deg,#052e16,#14532d,#166534)" }}>
        <style>{css}</style>
        <div style={{ width: 100, height: 100, borderRadius: 28, background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "0 8px 32px rgba(34,197,94,.45)", animation: "logo 1.6s ease-in-out infinite" }}>🥗</div>
        <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 800, marginTop: 22, letterSpacing: -1.2 }}>
          Nutri<span style={{ color: "#4ade80" }}>AI</span>
        </h1>
        <p style={{ color: "#86efac", fontSize: 15, marginTop: 6, fontWeight: 500 }}>Aqlli ovqatlanish yordamchingiz</p>
      </div>
    );
  }

  // ═══ LOGIN ═══
  if (screen === "login") {
    return (
      <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 26px", background: "linear-gradient(150deg,#052e16,#14532d,#166534)" }}>
        <style>{css}</style>
        <div style={{ width: 88, height: 88, borderRadius: 26, background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 8px 32px rgba(34,197,94,.45)" }}>🥗</div>
        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginTop: 18, letterSpacing: -1 }}>
          Nutri<span style={{ color: "#4ade80" }}>AI</span>
        </h1>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 24, textAlign: "center" }}>{t.signInTitle}</h2>
        <p style={{ color: "#bbf7d0", fontSize: 14.5, lineHeight: 1.6, marginTop: 8, textAlign: "center", maxWidth: 340 }}>{t.signInDesc}</p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
          {Object.entries({ uz: "O'zbek", ru: "Русский", en: "English" }).map(([k, v]) => (
            <button key={k} onClick={() => setLang(k)} style={{
              padding: "8px 15px", borderRadius: 20, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: `2px solid ${lang === k ? "#4ade80" : "rgba(255,255,255,.25)"}`,
              background: lang === k ? "rgba(74,222,128,.15)" : "transparent", color: lang === k ? "#4ade80" : "#d1fae5",
            }}>{v}</button>
          ))}
        </div>

        <button onClick={handleGoogle} disabled={signingIn} style={{
          marginTop: 30, width: "100%", maxWidth: 360, padding: "14px 20px", borderRadius: 14,
          border: "none", cursor: "pointer", background: "#fff", color: "#1f2937",
          fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 11, boxShadow: "0 4px 18px rgba(0,0,0,.25)", opacity: signingIn ? .7 : 1,
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {signingIn ? t.signingIn : t.continueGoogle}
        </button>

        {/* Ajratgich */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 360, marginTop: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.2)" }} />
          <span style={{ color: "#a7f3d0", fontSize: 12.5 }}>{t.orDivider}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.2)" }} />
        </div>

        {(() => {
          const li = {
            width: "100%", maxWidth: 360, padding: "13px 15px", borderRadius: 12, fontSize: 15,
            border: "1.5px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)",
            color: "#fff", outline: "none", boxSizing: "border-box", marginTop: 10,
          };
          return (
            <>
              {authMode === "register" && (
                <input className="login-inp" style={li} placeholder={t.nameF} value={nameV}
                  onChange={(e) => setNameV(e.target.value)} />
              )}
              <input className="login-inp" style={li} type="email" inputMode="email" autoComplete="email"
                placeholder={t.emailF} value={emailV} onChange={(e) => setEmailV(e.target.value)} />
              <input className="login-inp" style={li} type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                placeholder={t.passwordF} value={passV}
                onChange={(e) => setPassV(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()} />
              <button onClick={handleEmailAuth} disabled={signingIn} style={{
                marginTop: 12, width: "100%", maxWidth: 360, padding: "13px 20px", borderRadius: 12,
                border: "none", cursor: "pointer", background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff", fontSize: 15.5, fontWeight: 700, opacity: signingIn ? 0.7 : 1,
              }}>
                {signingIn ? t.signingIn : authMode === "register" ? t.registerBtn : t.loginBtn}
              </button>
              <button onClick={() => { setAuthMode((m) => (m === "login" ? "register" : "login")); setAuthError(null); }} style={{
                marginTop: 14, background: "none", border: "none", color: "#bbf7d0",
                fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline",
              }}>
                {authMode === "login" ? t.toRegister : t.toLogin}
              </button>
            </>
          );
        })()}

        {authError && (
          <p style={{ marginTop: 14, color: "#fecaca", fontSize: 13.5, textAlign: "center", maxWidth: 360 }}>⚠️ {authError}</p>
        )}
      </div>
    );
  }

  // ═══ ONBOARDING ═══
  if (screen === "onboarding") {
    const steps = [
      <div key="0" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 76, marginBottom: 14 }}>🥗</div>
        <h1 style={{ fontSize: 27, fontWeight: 800, color: T.text, marginBottom: 10, lineHeight: 1.25 }}>{t.welcome}</h1>
        <p style={{ color: T.muted, fontSize: 15.5, lineHeight: 1.6, marginBottom: 26 }}>{t.welcomeDesc}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 26 }}>
          {Object.entries({ uz: "O'zbek", ru: "Русский", en: "English" }).map(([k, v]) => (
            <button key={k} onClick={() => setLang(k)} style={{
              padding: "9px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: `2px solid ${lang === k ? GREEN : T.inputBorder}`,
              background: lang === k ? T.chipBg : "transparent", color: lang === k ? GREEN : T.muted,
            }}>{v}</button>
          ))}
        </div>
        <button style={S.btn} onClick={() => setStep(1)}>{t.start} →</button>
      </div>,

      <div key="1" style={{ padding: "28px 24px" }}>
        <p style={{ fontSize: 13, color: GREEN, fontWeight: 800, marginBottom: 4 }}>1/4</p>
        <h2 style={S.h2}>{t.meetYou}</h2>
        <label style={S.label}>{t.name}</label>
        <input style={S.input} placeholder="Bekzod" value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <label style={{ ...S.label, marginTop: 18 }}>{t.gender}</label>
        <div style={{ display: "flex", gap: 12 }}>
          {[["male", "👨", t.male], ["female", "👩", t.female]].map(([k, ic, lb]) => (
            <button key={k} onClick={() => setProfile({ ...profile, gender: k })} style={{
              flex: 1, padding: 16, borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 700,
              border: `2px solid ${profile.gender === k ? GREEN : T.inputBorder}`,
              background: profile.gender === k ? T.chipBg : T.card,
              color: profile.gender === k ? GREEN : T.muted,
            }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 4 }}>{ic}</span>{lb}
            </button>
          ))}
        </div>
        <button style={{ ...S.btn, marginTop: 28 }} onClick={() => setStep(2)}>{t.next} →</button>
      </div>,

      <div key="2" style={{ padding: "28px 24px" }}>
        <p style={{ fontSize: 13, color: GREEN, fontWeight: 800, marginBottom: 4 }}>2/4</p>
        <h2 style={S.h2}>{t.bodyStats}</h2>
        {[["birthYear", t.birthYear], ["height", t.height], ["weight", t.weight], ["targetWeight", t.targetWeight]].map(([k, lb]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={S.label}>{lb}</label>
            <input style={S.input} type="number" inputMode="numeric" value={profile[k]}
              onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button style={S.btnGhost} onClick={() => setStep(1)}>← {t.back}</button>
          <button style={S.btn} onClick={() => setStep(3)}>{t.next} →</button>
        </div>
      </div>,

      <div key="3" style={{ padding: "28px 24px" }}>
        <p style={{ fontSize: 13, color: GREEN, fontWeight: 800, marginBottom: 4 }}>3/4</p>
        <h2 style={S.h2}>{t.activityGoal}</h2>
        <label style={S.label}>{t.activity}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {ACTIVITY.map((a) => (
            <button key={a.key} onClick={() => setProfile({ ...profile, activity: a.key })} style={{
              padding: "13px 15px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: `2px solid ${profile.activity === a.key ? GREEN : T.inputBorder}`,
              background: profile.activity === a.key ? T.chipBg : T.card,
            }}>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: T.text2 }}>{t[a.key]}</span>
              <span style={{ fontSize: 12.5, color: T.muted }}>{t[a.key + "D"]}</span>
            </button>
          ))}
        </div>
        <label style={S.label}>{t.goal}</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {GOALS.map((g) => (
            <button key={g.key} onClick={() => setProfile({ ...profile, goal: g.key })} style={{
              flex: 1, padding: "14px 6px", borderRadius: 14, cursor: "pointer", textAlign: "center",
              border: `2px solid ${profile.goal === g.key ? GREEN : T.inputBorder}`,
              background: profile.goal === g.key ? T.chipBg : T.card,
            }}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{g.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>{t[g.key]}</span>
            </button>
          ))}
        </div>
        <label style={S.label}>{t.restrictions}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {RESTRICTIONS.map((r) => {
            const on = profile.restrictions.includes(r.key);
            return (
              <button key={r.key} onClick={() => setProfile((p) => ({
                ...p, restrictions: on ? p.restrictions.filter((x) => x !== r.key) : [...p.restrictions, r.key],
              }))} style={{
                padding: "8px 14px", borderRadius: 20, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                border: `2px solid ${on ? GREEN : T.inputBorder}`,
                background: on ? T.chipBg : T.card, color: on ? GREEN : T.muted,
              }}>{r.icon} {r[lang]}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
          <button style={S.btnGhost} onClick={() => setStep(2)}>← {t.back}</button>
          <button style={S.btn} onClick={() => setStep(4)}>{t.next} →</button>
        </div>
      </div>,

      <div key="4" style={{ padding: "28px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: GREEN, fontWeight: 800, marginBottom: 4 }}>4/4</p>
        <h2 style={{ ...S.h2, marginBottom: 6 }}>{t.ready}, {profile.name || t.friend}! 🎉</h2>
        <p style={{ color: T.muted, fontSize: 14.5, marginBottom: 20 }}>{t.yourTargets}</p>
        <div style={{ ...S.card, marginBottom: 18, padding: 24 }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: GREEN, lineHeight: 1 }}>{fmt(targets.calories)}</div>
          <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 18 }}>{t.caloriesPerDay}</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[[t.proteinFull, targets.protein, GREEN], [t.fat, targets.fat, AMBER], [t.carbsFull, targets.carbs, INDIGO]].map(([l, v, c]) => (
              <div key={l}>
                <div style={{ fontSize: 21, fontWeight: 800, color: c }}>{v}g</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.divider}`, fontSize: 13.5, color: T.muted }}>
            💧 {targets.water} {t.glasses} · 🌾 {targets.fiber}g {t.fiber}
          </div>
        </div>
        <button style={S.btn} onClick={() => { setScreen("app"); setTab("home"); }}>{t.launchApp} 🚀</button>
      </div>,
    ];

    return (
      <div style={{ ...S.app, overflow: "auto" }}>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "22px 0 0" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                background: i <= step ? GREEN : T.inputBorder, transition: "all .3s",
              }} />
            ))}
          </div>
          <div key={step} style={{ animation: "fadeIn .35s ease-out" }}>{steps[step]}</div>
        </div>
      </div>
    );
  }

  // ═══ MAIN APP ═══
  const now = new Date();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const fdw = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const calDays = [...Array(fdw).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const mealsOn = (d) => meals.filter((m) => dayKey(m.time) === dayKey(new Date(now.getFullYear(), now.getMonth(), d)));
  const dayColor = (d) => {
    const ms = mealsOn(d);
    if (!ms.length) return null;
    const pct = ms.reduce((s, m) => s + m.cal, 0) / targets.calories;
    return pct >= 0.85 && pct <= 1.15 ? GREEN_LT : pct < 0.7 || pct > 1.3 ? RED : "#eab308";
  };
  const q = searchQ.toLowerCase();
  const filteredFoods = FOOD_DB.filter((f) => f[lang].toLowerCase().includes(q) || f.uz.toLowerCase().includes(q));
  const weekDays = lang === "ru" ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    : lang === "en" ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    : ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

  return (
    <div style={S.app}>
      <style>{css}</style>

      {/* ═══ MEAL MODAL ═══ */}
      {modal === "meal" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && closeMeal()}>
          <div style={{ width: "100%", maxWidth: 430, maxHeight: "92vh", overflow: "auto", background: T.card, borderRadius: "24px 24px 0 0", padding: "16px 20px 34px", animation: "slideUp .3s ease-out" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.inputBorder, margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: 21, fontWeight: 800, color: T.text, marginBottom: 14 }}>{t.addMeal}</h3>

            <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
              {Object.entries(MEAL_TYPES).map(([k, mt]) => (
                <button key={k} onClick={() => setMealType(k)} style={{
                  padding: "7px 13px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: `2px solid ${mealType === k ? mt.color : T.inputBorder}`,
                  background: mealType === k ? mt.color + "1e" : "transparent",
                  color: mealType === k ? mt.color : T.muted,
                }}>{mt.icon} {t[k]}</button>
              ))}
            </div>

            <div style={{ display: "flex", background: T.input, borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {[["photo", "📸", t.photo], ["text", "✏️", t.text], ["search", "🔍", t.search], ["fav", "⭐", t.favorites]].map(([k, ic, lb]) => (
                <button key={k} onClick={() => { setMealTab(k); setAiResult(null); setAiError(null); }} style={{
                  flex: 1, padding: "9px 3px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700,
                  background: mealTab === k ? T.card : "transparent",
                  color: mealTab === k ? GREEN : T.muted,
                  boxShadow: mealTab === k ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                }}>{ic} {lb}</button>
              ))}
            </div>

            {/* PHOTO */}
            {mealTab === "photo" && (
              <div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPickImage} style={{ display: "none" }} />
                {imgData ? (
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
                    <img src={`data:image/jpeg;base64,${imgData}`} alt="" style={{ width: "100%", display: "block", maxHeight: 250, objectFit: "cover" }} />
                    <button onClick={() => { setImgData(null); setAiResult(null); }} style={{
                      position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 16,
                      border: "none", background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 18, cursor: "pointer",
                    }}>×</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: "100%", padding: "36px 20px", borderRadius: 16, cursor: "pointer",
                    border: `2px dashed ${T.inputBorder}`, background: T.input, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>{t.takePhoto}</div>
                    <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>{t.photoHint}</div>
                  </button>
                )}
                {imgData && !aiResult && (
                  <button style={{ ...S.btn, opacity: aiLoading ? .7 : 1 }} onClick={analyzePhoto} disabled={aiLoading}>
                    {aiLoading ? `⏳ ${t.analyzing}` : `🤖 ${t.analyze}`}
                  </button>
                )}
              </div>
            )}

            {/* TEXT */}
            {mealTab === "text" && (
              <div>
                <textarea style={{ ...S.input, minHeight: 92, resize: "vertical" }}
                  placeholder={t.placeholderMeal} value={mealText}
                  onChange={(e) => setMealText(e.target.value)} />
                <button style={{ ...S.btn, marginTop: 10, opacity: aiLoading ? .7 : 1 }} onClick={analyzeText} disabled={aiLoading}>
                  {aiLoading ? `⏳ ${t.analyzing}` : `🤖 ${t.analyze}`}
                </button>
              </div>
            )}

            {/* SEARCH */}
            {mealTab === "search" && (
              <div>
                <input style={S.input} placeholder={t.searchFood} value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)} />
                <div style={{ marginTop: 12, maxHeight: 340, overflow: "auto" }}>
                  {filteredFoods.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: `1px solid ${T.divider}` }}>
                      <span style={{ fontSize: 25 }}>{f.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text2 }}>{f[lang]}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>{f.portion} · {f.cal} kcal · {t.protein} {f.p}g</div>
                      </div>
                      <button onClick={() => toggleFav(f.id)} style={{ background: "none", border: "none", fontSize: 17, cursor: "pointer", opacity: favorites.includes(f.id) ? 1 : .25 }}>⭐</button>
                      <button onClick={() => addFromDB(f)} style={{
                        width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
                        background: justAdded === f.id ? GREEN_LT : GREEN, color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0,
                      }}>{justAdded === f.id ? "✓" : "+"}</button>
                    </div>
                  ))}
                  {!filteredFoods.length && <p style={{ textAlign: "center", color: T.muted, padding: 24 }}>{t.noData}</p>}
                </div>
              </div>
            )}

            {/* FAVORITES */}
            {mealTab === "fav" && (
              <div>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>{t.quickAdd}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {FOOD_DB.filter((f) => favorites.includes(f.id)).map((f) => (
                    <button key={f.id} onClick={() => addFromDB(f)} style={{
                      padding: 14, borderRadius: 16, cursor: "pointer", textAlign: "left",
                      border: `2px solid ${justAdded === f.id ? GREEN : T.cardBorder}`, background: T.input,
                    }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{f.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text2, lineHeight: 1.25 }}>{f[lang]}</div>
                      <div style={{ fontSize: 12, color: GREEN, fontWeight: 800, marginTop: 4 }}>{justAdded === f.id ? "✓ +1" : `${f.cal} kcal`}</div>
                    </button>
                  ))}
                </div>
                {!favorites.length && <p style={{ textAlign: "center", color: T.muted, padding: 24, fontSize: 14 }}>🔍 → ⭐</p>}
              </div>
            )}

            {aiError && (
              <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: RED + "18", color: RED, fontSize: 13.5, lineHeight: 1.5 }}>
                ⚠️ {aiError}
              </div>
            )}

            {/* AI RESULT */}
            {aiResult && (
              <div style={{ marginTop: 18, padding: 16, borderRadius: 18, border: `2px solid ${GREEN}44`, background: T.input, animation: "fadeIn .35s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: 0, flex: 1 }}>{aiResult.meal_name}</h4>
                  <Score v={aiResult.health_score} />
                </div>

                {aiResult.items?.map((it, i) => (
                  <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? `1px solid ${T.divider}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text2 }}>{it.name}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>{it.portion}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <button onClick={() => adjustItem(i, -0.25)} style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${T.inputBorder}`, background: T.card, color: T.text2, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>−</button>
                        <div style={{ textAlign: "center", minWidth: 52 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: GREEN }}>{it.calories}</div>
                          <div style={{ fontSize: 9.5, color: T.muted }}>kcal</div>
                        </div>
                        <button onClick={() => adjustItem(i, 0.25)} style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${T.inputBorder}`, background: T.card, color: T.text2, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>+</button>
                        <button onClick={() => removeItem(i)} style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: RED + "1a", color: RED, cursor: "pointer", fontSize: 14 }}>×</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
                      {t.protein} {it.protein}g · {t.fat} {it.fat}g · {t.carbs} {it.carbs}g
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: T.totalBg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, color: T.text }}>{t.total}</span>
                    <span style={{ fontWeight: 800, fontSize: 19, color: GREEN }}>{fmt(aiResult.total.calories)} kcal</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {[[t.protein, aiResult.total.protein, GREEN], [t.fat, aiResult.total.fat, AMBER], [t.carbs, aiResult.total.carbs, INDIGO], [t.fiber, aiResult.total.fiber, PINK]].map(([l, v, c]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 800, color: c, fontSize: 14 }}>{Math.round(v)}g</div>
                        <div style={{ fontSize: 10.5, color: T.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {aiResult.recommendation && (
                  <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 12, background: T.tipBg, border: `1px solid ${T.tipBorder}`, fontSize: 13.5, color: T.tipText, lineHeight: 1.5 }}>
                    💡 {aiResult.recommendation}
                  </div>
                )}

                <button style={{ ...S.btn, marginTop: 14 }} onClick={saveMeal}>✅ {t.save}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ WEIGHT MODAL ═══ */}
      {modal === "weight" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={{ ...S.card, width: "100%", maxWidth: 340, animation: "fadeIn .25s" }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 14 }}>⚖️ {t.addWeight}</h3>
            <input style={S.input} type="number" step="0.1" inputMode="decimal" autoFocus
              placeholder={String(profile.weight)} value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWeight()} />
            <button style={{ ...S.btn, marginTop: 14 }} onClick={addWeight}>{t.save}</button>
          </div>
        </div>
      )}

      {/* ═══ CONTENT ═══ */}
      <div style={{ paddingBottom: 86, minHeight: "100vh" }}>

        {/* ───── HOME ───── */}
        {tab === "home" && (
          <div style={{ animation: "fadeIn .35s ease-out" }}>
            <div style={{ padding: "18px 22px 12px", background: T.headerBg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13.5, color: T.muted }}>{t.hello},</p>
                  <h1 style={{ fontSize: 25, fontWeight: 800, color: T.text, margin: 0 }}>{profile.name || t.friend} 👋</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 16, background: "linear-gradient(135deg,#ff6b35,#ff8c42)", color: "#fff", fontWeight: 800, fontSize: 13.5, boxShadow: "0 2px 10px rgba(255,107,53,.35)" }}>
                  🔥 {streak} {t.days}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 14px" }}>
              <Ring value={tot.calories} max={targets.calories} size={196} sw={15}
                color={tot.calories > targets.calories ? RED : GREEN} track={T.ringTrack}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 35, fontWeight: 800, color: T.text, lineHeight: 1 }}>{fmt(tot.calories)}</div>
                  <div style={{ fontSize: 12.5, color: T.muted }}>/ {fmt(targets.calories)} kcal</div>
                  <div style={{ marginTop: 5, fontSize: 12.5, fontWeight: 700, color: remaining > 0 ? GREEN : RED }}>
                    {remaining > 0 ? t.remaining.replace("{n}", fmt(remaining)) : t.exceeded.replace("{n}", fmt(-remaining))}
                  </div>
                </div>
              </Ring>
            </div>

            <div style={{ padding: "0 18px", marginBottom: 12 }}>
              <div style={{ ...S.card, display: "flex", gap: 13 }}>
                <Bar value={tot.protein} max={targets.protein} color={GREEN} label={t.protein} T={T} />
                <Bar value={tot.fat} max={targets.fat} color={AMBER} label={t.fat} T={T} />
                <Bar value={tot.carbs} max={targets.carbs} color={INDIGO} label={t.carbs} T={T} />
                <Bar value={tot.fiber} max={targets.fiber} color={PINK} label={t.fiber} T={T} />
              </div>
            </div>

            {/* Water */}
            <div style={{ padding: "0 18px", marginBottom: 12 }}>
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text }}>💧 {t.water}</div>
                    <div style={{ fontSize: 12.5, color: T.muted }}>{todayWater} / {targets.water} {t.glasses}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setWater(todayWater - 1)} style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${T.inputBorder}`, background: T.input, color: T.text2, fontSize: 18, cursor: "pointer" }}>−</button>
                    <button onClick={() => setWater(todayWater + 1)} style={{ width: 34, height: 34, borderRadius: 11, border: "none", background: BLUE, color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Array.from({ length: targets.water }, (_, i) => (
                    <button key={i} onClick={() => setWater(i + 1 === todayWater ? i : i + 1)} style={{
                      width: 24, height: 30, borderRadius: 6, cursor: "pointer",
                      border: `1.5px solid ${i < todayWater ? BLUE : T.inputBorder}`,
                      background: i < todayWater ? BLUE : "transparent", transition: "all .2s",
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Health score + AI summary */}
            {todayMeals.length > 0 && (
              <div style={{ padding: "0 18px", marginBottom: 12 }}>
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{t.healthScore}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{t.basedOn.replace("{n}", todayMeals.length)}</div>
                    </div>
                    <Score v={todayScore} />
                  </div>
                  {!daySummary && !summaryLoading && (
                    <button onClick={getDailySummary} style={{
                      marginTop: 12, width: "100%", padding: 10, borderRadius: 12, cursor: "pointer",
                      border: `1.5px dashed ${GREEN}66`, background: "transparent", color: GREEN,
                      fontSize: 13.5, fontWeight: 700,
                    }}>🤖 {t.generateSummary}</button>
                  )}
                  {summaryLoading && <div style={{ textAlign: "center", padding: 14, color: T.muted, fontSize: 13.5 }}>⏳ {t.analyzing}</div>}
                  {daySummary && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.divider}`, fontSize: 13.5, lineHeight: 1.65, color: T.text2, whiteSpace: "pre-wrap" }}>{daySummary}</div>
                  )}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ padding: "0 18px", marginBottom: 16, display: "flex", gap: 10 }}>
              {[["📸", t.photo, "photo", GREEN], ["✏️", t.text, "text", BLUE], ["⭐", t.quickAdd, "fav", AMBER]].map(([ic, lb, k, c]) => (
                <button key={k} onClick={() => { setMealTab(k); setModal("meal"); }} style={{
                  flex: 1, ...S.card, padding: "16px 6px", cursor: "pointer", textAlign: "center",
                  border: `2px dashed ${c}55`,
                }}>
                  <span style={{ fontSize: 24, display: "block", marginBottom: 5 }}>{ic}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{lb}</span>
                </button>
              ))}
            </div>

            {/* Today's meals */}
            <div style={{ padding: "0 18px 16px" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 11 }}>{t.todayMeals}</h3>
              {!todayMeals.length ? (
                <div style={{ ...S.card, textAlign: "center", padding: 30, color: T.muted }}>
                  <div style={{ fontSize: 38, marginBottom: 8 }}>🍽️</div>
                  <p style={{ fontSize: 14.5, fontWeight: 600 }}>{t.noMeals}</p>
                  <p style={{ fontSize: 12.5, marginTop: 2 }}>{t.tapButton}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {todayMeals.map((m) => (
                    <div key={m.id} style={{ ...S.card, padding: 13, display: "flex", gap: 12, alignItems: "center" }}>
                      {m.img ? (
                        <img src={m.img} alt="" style={{ width: 48, height: 48, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 13, background: MEAL_TYPES[m.type].color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, flexShrink: 0 }}>
                          {m.emoji || MEAL_TYPES[m.type].icon}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text2, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                        <div style={{ fontSize: 11.5, color: T.muted }}>
                          {t[m.type]} · {new Date(m.time).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })} · {t.protein} {Math.round(m.p)}g
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15.5, color: GREEN }}>{fmt(m.cal)}</div>
                        <div style={{ fontSize: 10.5, color: T.muted }}>kcal</div>
                      </div>
                      <button onClick={() => setMeals((p) => p.filter((x) => x.id !== m.id))} style={{
                        width: 24, height: 24, borderRadius: 8, border: "none", background: "transparent",
                        color: T.muted, cursor: "pointer", fontSize: 17, flexShrink: 0,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───── CALENDAR ───── */}
        {tab === "calendar" && (
          <div style={{ padding: 18, animation: "fadeIn .35s ease-out" }}>
            <h2 style={S.h2}>📅 {t.calendar}</h2>
            <div style={S.card}>
              <div style={{ textAlign: "center", fontWeight: 800, fontSize: 15.5, color: T.text, marginBottom: 14, textTransform: "capitalize" }}>
                {now.toLocaleDateString(lang, { month: "long", year: "numeric" })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" }}>
                {weekDays.map((d) => (
                  <div key={d} style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, padding: 5 }}>{d}</div>
                ))}
                {calDays.map((d, i) => (
                  <button key={i} onClick={() => d && setSelectedDay(d === selectedDay ? null : d)} disabled={!d} style={{
                    width: "100%", aspectRatio: "1", borderRadius: 10, border: "none",
                    cursor: d ? "pointer" : "default", position: "relative", fontSize: 13.5,
                    background: d === now.getDate() ? GREEN : selectedDay === d ? T.chipBg : "transparent",
                    color: d === now.getDate() ? "#fff" : T.text2,
                    fontWeight: d === now.getDate() ? 800 : 500,
                  }}>
                    {d || ""}
                    {d && dayColor(d) && (
                      <div style={{ width: 5, height: 5, borderRadius: 3, background: d === now.getDate() ? "#fff" : dayColor(d), position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedDay && (
              <div style={{ marginTop: 14 }}>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: T.text, marginBottom: 9, textTransform: "capitalize" }}>
                  {selectedDay} {now.toLocaleDateString(lang, { month: "long" })}
                </h3>
                {!mealsOn(selectedDay).length ? (
                  <div style={{ ...S.card, textAlign: "center", padding: 22, color: T.muted, fontSize: 14 }}>{t.noData}</div>
                ) : mealsOn(selectedDay).map((m) => (
                  <div key={m.id} style={{ ...S.card, marginBottom: 7, padding: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.emoji || MEAL_TYPES[m.type].icon} {m.name}
                    </span>
                    <span style={{ fontWeight: 800, color: GREEN, flexShrink: 0 }}>{fmt(m.cal)} kcal</span>
                  </div>
                ))}
              </div>
            )}

            {/* Weight */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text }}>⚖️ {t.weightLog}</h3>
                <button onClick={() => setModal("weight")} style={{
                  padding: "7px 14px", borderRadius: 20, border: "none", background: GREEN,
                  color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                }}>+ {t.addWeight}</button>
              </div>
              <div style={S.card}>
                {weights.length < 2 ? (
                  <p style={{ textAlign: "center", color: T.muted, padding: 18, fontSize: 14 }}>{t.noData}</p>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{weights[weights.length - 1].w}</span>
                        <span style={{ fontSize: 14, color: T.muted, marginLeft: 4 }}>kg</span>
                      </div>
                      {(() => {
                        const d = weights[weights.length - 1].w - weights[0].w;
                        return <span style={{ fontSize: 14, fontWeight: 700, color: d <= 0 ? GREEN : AMBER }}>{d > 0 ? "+" : ""}{d.toFixed(1)} kg</span>;
                      })()}
                    </div>
                    <WeightChart data={weights} T={T} />
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 10 }}>{t.weeklyStats}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {[
                  [t.avgCalories, meals.length ? Math.round(meals.reduce((s, m) => s + m.cal, 0) / new Set(meals.map((m) => dayKey(m.time))).size) : 0, "kcal", GREEN],
                  [t.mealCount, meals.length, "", INDIGO],
                  [t.bestScore, meals.length ? Math.max(...meals.map((m) => m.score)).toFixed(1) : "—", "/10", AMBER],
                  [t.streak, streak, `${t.days} 🔥`, "#ff6b35"],
                ].map(([l, v, u, c]) => (
                  <div key={l} style={{ ...S.card, padding: 15, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: 11.5, color: T.muted }}>{u}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text2, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── COACH ───── */}
        {tab === "coach" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 86px)", animation: "fadeIn .35s ease-out" }}>
            <div style={{ padding: "18px 18px 12px", background: T.headerBg }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>🤖 {t.coach}</h2>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "12px 18px" }}>
              {!chat.length && (
                <div style={{ ...S.card, marginBottom: 12 }}>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: T.text2 }}>{t.coachIntro}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
                    {(lang === "uz"
                      ? ["Maqsadimga qanday ovqatlar mos?", "Kechki ovqatga nima yeyin?", "Oqsilni qanday oshiraman?"]
                      : lang === "ru"
                      ? ["Какие блюда подходят моей цели?", "Что съесть на ужин?", "Как увеличить белок?"]
                      : ["What foods fit my goal?", "What should I eat for dinner?", "How do I get more protein?"]
                    ).map((sug) => (
                      <button key={sug} onClick={() => setChatInput(sug)} style={{
                        padding: "9px 13px", borderRadius: 14, cursor: "pointer", fontSize: 13,
                        border: `1px solid ${T.inputBorder}`, background: T.input, color: T.text2, textAlign: "left",
                      }}>{sug}</button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{
                    maxWidth: "82%", padding: "11px 14px", borderRadius: 16, fontSize: 14.3, lineHeight: 1.55,
                    background: m.role === "user" ? GREEN : T.card,
                    color: m.role === "user" ? "#fff" : T.text2,
                    borderBottomRightRadius: m.role === "user" ? 4 : 16,
                    borderBottomLeftRadius: m.role === "user" ? 16 : 4,
                    boxShadow: m.role === "user" ? "none" : T.shadow,
                    whiteSpace: "pre-wrap",
                  }}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 5, padding: "10px 14px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: T.muted, animation: `pulse 1s ease-in-out ${i * .15}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.divider}`, display: "flex", gap: 8, background: T.card }}>
              <input style={{ ...S.input, flex: 1 }} placeholder={t.askCoach} value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()} />
              <button onClick={sendChat} disabled={chatLoading} style={{
                width: 46, height: 46, borderRadius: 13, border: "none", background: GREEN,
                color: "#fff", fontSize: 19, cursor: "pointer", flexShrink: 0, opacity: chatLoading ? .5 : 1,
              }}>↑</button>
            </div>
          </div>
        )}

        {/* ───── TROPHY ───── */}
        {tab === "trophy" && (
          <div style={{ padding: 18, animation: "fadeIn .35s ease-out" }}>
            <h2 style={{ ...S.h2, marginBottom: 14 }}>🏆 {t.trophy}</h2>
            <div style={{ ...S.card, marginBottom: 18, textAlign: "center", background: T.streakBg, border: `1px solid ${T.streakBorder}` }}>
              <div style={{ fontSize: 46 }}>🔥</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: "#f97316" }}>{streak}</div>
              <div style={{ fontSize: 13.5, color: T.streakText, fontWeight: 700 }}>{t.streak}</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                {[7, 14, 30, 100].map((n) => (
                  <div key={n} style={{
                    padding: "5px 12px", borderRadius: 14, fontSize: 12, fontWeight: 700,
                    background: streak >= n ? GREEN : T.input, color: streak >= n ? "#fff" : T.muted,
                  }}>{streak >= n ? "✓ " : ""}{n}</div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { icon: "🎉", uz: ["Birinchi ovqat", "Birinchi marta ovqat qo'shildi"], ru: ["Первый приём", "Добавлена первая еда"], en: ["First meal", "Logged your first meal"], done: meals.length >= 1 },
                { icon: "🔥", uz: ["Bir hafta", "7 kun ketma-ket"], ru: ["Неделя", "7 дней подряд"], en: ["One week", "7 days in a row"], done: streak >= 7 },
                { icon: "💪", uz: ["Oqsil ustasi", "Kunlik oqsil normasi bajarildi"], ru: ["Мастер белка", "Норма белка за день"], en: ["Protein master", "Hit protein target in a day"], done: tot.protein >= targets.protein },
                { icon: "🌟", uz: ["Sog'lom tanlov", "5 ta ovqat 8+ baho oldi"], ru: ["Здоровый выбор", "5 приёмов с оценкой 8+"], en: ["Healthy choice", "5 meals scored 8+"], done: meals.filter((m) => m.score >= 8).length >= 5 },
                { icon: "💧", uz: ["Suv rejimi", "Kunlik suv normasi bajarildi"], ru: ["Водный режим", "Дневная норма воды"], en: ["Hydrated", "Hit daily water goal"], done: todayWater >= targets.water },
                { icon: "📊", uz: ["Kuzatuvchi", "5 marta vazn qayd etildi"], ru: ["Наблюдатель", "5 записей веса"], en: ["Tracker", "Logged weight 5 times"], done: weights.length >= 5 },
                { icon: "👑", uz: ["Bir oy", "30 kun ketma-ket"], ru: ["Месяц", "30 дней подряд"], en: ["One month", "30 days in a row"], done: streak >= 30 },
                { icon: "🌈", uz: ["Xilma-xillik", "20 xil ovqat sinaldi"], ru: ["Разнообразие", "20 разных блюд"], en: ["Variety", "Tried 20 different foods"], done: new Set(meals.map((m) => m.name)).size >= 20 },
              ].map((a, i) => (
                <div key={i} style={{ ...S.card, padding: 14, display: "flex", gap: 13, alignItems: "center", opacity: a.done ? 1 : .45 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: a.done ? "linear-gradient(135deg,#fef3c7,#fde68a)" : T.input,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>{a.done ? a.icon : "🔒"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: a.done ? T.text : T.muted }}>{a[lang][0]}</div>
                    <div style={{ fontSize: 12.5, color: T.muted }}>{a[lang][1]}</div>
                  </div>
                  {a.done && <div style={{ color: GREEN, fontSize: 19 }}>✅</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───── PROFILE ───── */}
        {tab === "profile" && (
          <div style={{ padding: 18, animation: "fadeIn .35s ease-out" }}>
            <div style={{ ...S.card, textAlign: "center", marginBottom: 14, padding: 26 }}>
              <div style={{
                width: 78, height: 78, borderRadius: "50%", margin: "0 auto 11px", background: T.avatarBg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
                border: `3px solid ${T.card}`, boxShadow: "0 4px 14px rgba(22,163,74,.18)",
              }}>{profile.gender === "male" ? "👨" : "👩"}</div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>{profile.name || t.friend}</h2>
              <p style={{ color: T.muted, fontSize: 13.5, marginTop: 3 }}>
                {t[profile.goal]} · {profile.weight} → {profile.targetWeight} kg
              </p>
              {!!profile.restrictions.length && (
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
                  {profile.restrictions.map((k) => {
                    const r = RESTRICTIONS.find((x) => x.key === k);
                    return <span key={k} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, fontWeight: 700, background: T.chipBg, color: GREEN }}>{r.icon} {r[lang]}</span>;
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 14 }}>
              {(() => {
                const bmi = profile.weight / Math.pow(profile.height / 100, 2);
                const bc = bmi < 18.5 ? BLUE : bmi < 25 ? GREEN : bmi < 30 ? AMBER : RED;
                return [["📏", `${profile.height}`, "sm", T.text], ["⚖️", `${profile.weight}`, "kg", T.text], ["📊", bmi.toFixed(1), "BMI", bc]];
              })().map(([ic, v, l, c]) => (
                <div key={l} style={{ ...S.card, padding: 13, textAlign: "center" }}>
                  <div style={{ fontSize: 19, marginBottom: 3 }}>{ic}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: 11.5, color: T.muted }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: T.text, marginBottom: 12 }}>{t.dailyTargets}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["kcal", targets.calories, GREEN, ""], [t.proteinFull, targets.protein, "#0d9488", "g"], [t.fat, targets.fat, AMBER, "g"], [t.carbsFull, targets.carbs, INDIGO, "g"], [t.fiber, targets.fiber, PINK, "g"], [t.water, targets.water, BLUE, ""]].map(([l, v, c, u]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 5, background: c, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text2 }}>{v}{u}</div>
                      <div style={{ fontSize: 11.5, color: T.muted }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: T.text, marginBottom: 6 }}>{t.settings}</h3>

              <div style={{ padding: "13px 0", borderTop: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: T.text2 }}>🌐 {t.language}</span>
                <div style={{ display: "flex", gap: 5 }}>
                  {["uz", "ru", "en"].map((k) => (
                    <button key={k} onClick={() => setLang(k)} style={{
                      padding: "5px 11px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                      border: `1.5px solid ${lang === k ? GREEN : T.inputBorder}`,
                      background: lang === k ? T.chipBg : "transparent",
                      color: lang === k ? GREEN : T.muted, textTransform: "uppercase",
                    }}>{k}</button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "13px 0", borderTop: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: T.text2 }}>🌙 {t.darkMode}</span>
                <button onClick={() => setDark(!dark)} aria-label={t.darkMode} style={{
                  width: 50, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                  background: dark ? GREEN : T.inputBorder, position: "relative", transition: "background .25s",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute",
                    top: 3, left: dark ? 25 : 3, transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                  }} />
                </button>
              </div>

              <div style={{ padding: "13px 0", borderTop: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: T.text2 }}>🤖 AI kaliti</span>
                <button onClick={() => {
                  const cur = getApiKey();
                  const v = window.prompt(
                    "Google Gemini API kalitini kiriting (AIza...).\nBepul olish: https://aistudio.google.com/apikey\nKalit faqat shu brauzeringizda saqlanadi. Bo'sh qoldirsangiz — o'chiriladi.",
                    cur,
                  );
                  if (v !== null) { setApiKey(v.trim()); setApiKeySet(!!v.trim()); }
                }} style={{
                  padding: "6px 13px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                  border: `1.5px solid ${apiKeySet ? GREEN : T.inputBorder}`,
                  background: apiKeySet ? T.chipBg : "transparent", color: apiKeySet ? GREEN : T.muted,
                }}>{apiKeySet ? "✓ Ulangan" : "Kiritish ›"}</button>
              </div>

              {[["🔔", t.notifications, t.on], ["📏", t.units, "kg · sm"], ["📤", t.export, "CSV · PDF"]].map(([ic, l, v]) => (
                <div key={l} style={{ padding: "13px 0", borderTop: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: T.text2 }}>{ic} {l}</span>
                  <span style={{ fontSize: 13.5, color: T.muted }}>{v} ›</span>
                </div>
              ))}

              {user && (
                <div style={{ padding: "13px 0", borderTop: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text2 }}>👤 {t.logout}</div>
                    {user.email && <div style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
                  </div>
                  <button onClick={handleLogout} style={{
                    padding: "6px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                    border: `1.5px solid ${T.inputBorder}`, background: "transparent", color: T.text2, flexShrink: 0,
                  }}>{t.logout} ›</button>
                </div>
              )}

              <div style={{ padding: "13px 0 0", borderTop: `1px solid ${T.divider}` }}>
                <button onClick={() => {
                  if (window.confirm(t.confirmReset)) {
                    setMeals([]); setWeights([]); setWaterLog({}); setChat([]);
                    setDaySummary(null); setScreen("onboarding"); setStep(0);
                  }
                }} style={{ background: "none", border: "none", color: RED, fontSize: 14.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                  🗑️ {t.deleteAccount}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      {tab === "home" && (
        <button onClick={() => { setMealTab("photo"); setModal("meal"); }} aria-label={t.addMeal} style={{
          position: "fixed", bottom: 84, left: "50%", marginLeft: 142,
          width: 58, height: 58, borderRadius: 29, zIndex: 90,
          background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff",
          border: "none", fontSize: 27, cursor: "pointer",
          boxShadow: "0 6px 22px rgba(22,163,74,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, display: "flex", zIndex: 100,
        background: T.navBg, backdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.cardBorder}`,
        padding: "5px 0 max(env(safe-area-inset-bottom),7px)",
      }}>
        {[["home", "🏠", t.home], ["calendar", "📅", t.calendar], ["coach", "🤖", t.coach], ["trophy", "🏆", t.trophy], ["profile", "👤", t.profile]].map(([k, ic, lb]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "7px 0", cursor: "pointer", border: "none", background: "none",
            color: tab === k ? GREEN : T.muted, fontSize: 9.5, fontWeight: tab === k ? 800 : 500,
          }}>
            <span style={{ fontSize: 21, lineHeight: 1, filter: tab === k ? "none" : "grayscale(65%)" }}>{ic}</span>
            {lb}
          </button>
        ))}
      </nav>
    </div>
  );
}
