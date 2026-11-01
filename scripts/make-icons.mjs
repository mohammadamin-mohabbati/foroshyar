/* تولید همه آیکون‌ها و اسپلش‌ها از لوگوی اصلی فروش‌یار — با sharp */
import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "/home/z/my-project/upload/pasted_image_1792756984398.png";
const PUB = "/home/z/my-project/public";
const ASSETS = "/home/z/my-project/assets";
const APP = "/home/z/my-project/src/app";

mkdirSync(ASSETS, { recursive: true });

const logo = sharp(SRC);

// رنگ پس‌زمینه لوگو (پیکسل گوشه تصویر) برای آیکون ماسک‌شونده
const { data, info } = await logo
  .clone()
  .extract({ left: 6, top: 6, width: 1, height: 1 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const bg = `rgb(${data[0]},${data[1]},${data[2]})`;
console.log("logo background:", bg, "size:", info.width + "x" + info.height);

// ---------- آیکون‌های PWA و وب ----------
async function square(size, out) {
  await sharp(SRC).resize(size, size, { fit: "cover" }).png().toFile(out);
}
await square(1024, `${ASSETS}/icon.png`); // منبع @capacitor/assets
await square(512, `${PUB}/icon-512.png`);
await square(512, `${PUB}/icon.png`);
await square(192, `${PUB}/icon-192.png`);
await square(180, `${PUB}/apple-touch-icon.png`);

// favicon در اپ روتر
await square(64, `${APP}/favicon.png`);

// ---------- ماسک‌شونده (سیستم‌عامل دایره برش می‌زند) ----------
const m = 512;
const inner = 384; // لوگو با حاشیه امن
const pad = Math.round((m - inner) / 2);
await sharp({
  create: { width: m, height: m, channels: 4, background: bg },
})
  .composite([
    {
      input: await sharp(SRC).resize(inner, inner).png().toBuffer(),
      left: pad,
      top: pad,
    },
  ])
  .png()
  .toFile(`${PUB}/icon-maskable-512.png`);

// ---------- پیش‌زمینه/پس‌زمینه آیکون اندروید ----------
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: bg },
})
  .png()
  .toFile(`${ASSETS}/icon-background.png`);
const fg = 640; // محدوده امن آیکون اندروید
const fgPad = Math.round((1024 - fg) / 2);
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    {
      input: await sharp(SRC).resize(fg, fg).png().toBuffer(),
      left: fgPad,
      top: fgPad,
    },
  ])
  .png()
  .toFile(`${ASSETS}/icon-foreground.png`);

// ---------- اسپلش اندروید (سبز عمیق + لوگو وسط) ----------
const SP = 2732;
const sl = 760;
const slPad = Math.round((SP - sl) / 2);
for (const name of ["splash.png", "splash-dark.png"]) {
  await sharp({
    create: { width: SP, height: SP, channels: 4, background: "#0B5D50" },
  })
    .composite([
      {
        input: await sharp(SRC).resize(sl, sl).png().toBuffer(),
        left: slPad,
        top: slPad,
      },
    ])
    .png()
    .toFile(`${ASSETS}/${name}`);
}

console.log("✓ همه آیکون‌ها ساخته شدند");
