/* فروش‌یار — سرویس‌ورکر آفلاین */
const CACHE = "froshyar-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  /* ناوبری (index.html): همیشه نسخه تازه از فایل‌های روی دستگاه.
     کش‌شدن HTML نسخه‌های قبلی باعث «گیر کردن روی صفحه اسپلش» بعد از
     آپدیت APK می‌شد — HTML قدیمی به فایل‌های JS نسخه قبل اشاره می‌کرد
     که دیگر روی دستگاه وجود ندارند؛ پس ناوبری network-first است. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            try {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            } catch (_) {}
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match("/index.html"))
        )
    );
    return;
  }

  /* فایل‌های استاتیک: اول کش، بعد شبکه — فقط پاسخ سالم کش می‌شود
     (کش‌شدن پاسخ ۴۰۴ نسخه‌های قبلی باعث خرابی بوت می‌شد) */
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            try {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            } catch (_) {}
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
