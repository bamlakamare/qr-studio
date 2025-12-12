# QR Code Studio

**QR Code Studio** is a powerful, highly customizable QR code generator built with Next.js. It allows users to create aesthetic "Scan Me" cards, customize every aspect of the design (colors, fonts, patterns), and export high-quality images for print or web use.

🔗 **Live Demo:** <https://qr-studio.sweaven.dev/>

## 🚀 Features

- **Real-time Preview:** See changes instantly as you edit URL, colors, and text.
- **Deep Customization:**
  - **Card Styling:** Change card colors, backgrounds, and shadows.
  - **Backgrounds:** Choose solid colors, predefined patterns (dots, grids, lines), or upload your own image.
  - **Typography:** Customize the "SCAN ME" text, font family, weight, size, and color.
  - **Indicators:** Add directional arrows (Triangle, Chevron, Bar) to guide users.
- **Advanced Export Options:**
  - **Download Studio:** Export just the raw QR, the full card, or a custom selection.
  - **Transparency:** Full support for transparent backgrounds in PNG exports.
  - **High Resolution:** Generates crisp images using `html2canvas`.
- **Developer API:** A built-in Server-Side Image Generation API (`/api/qr`) to generate QR images programmatically via URL parameters.
- **Embed Mode:** A simplified view (`?view=embed`) designed for iframes and integrations.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **Image Generation (Client):** `html2canvas` for browser-side screenshots.
- **Image Generation (Server):** `@vercel/og` / `next/og` for the API endpoint.
- **QR Core:** Uses `api.qrserver.com` for the raw QR data matrix.

## 📦 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/qr-code-studio.git
   cd qr-code-studio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000> with your browser to see the result.

## 🔌 API Documentation

This project includes a server-side API route that generates PNG images on the fly. This is perfect for embedding dynamic QR codes in emails, mobile apps, or other websites.

### Endpoint

`GET /api/qr`

### Parameters

| Parameter | Type   | Default        | Description                                              |
|----------|--------|----------------|----------------------------------------------------------|
| `url`    | string | `https://...`  | The destination URL for the QR code.                    |
| `bg`     | hex    | `transparent`  | Page background color.                                  |
| `card`   | hex    | `#18181b`      | Color of the card container. Set to `transparent` to hide. |
| `qcolor` | hex    | `#000000`      | Color of the QR dots.                                   |
| `qbg`    | hex    | `#ffffff`      | Background color immediately behind the QR code.        |
| `text`   | string | `SCAN ME`      | Header text. Leave empty to hide.                       |
| `tcolor` | hex    | `#ffffff`      | Text color.                                             |
| `tsize`  | number | `32`           | Text size in pixels.                                    |
| `acolor` | hex    | `#ffffff`      | Arrow indicator color.                                  |
| `astyle` | string | `triangle`     | Arrow style: `triangle`, `chevron`, `bar`, or `none`.   |

### Example Usage

#### HTML `<img>` tag

```html
<img
  src="https://qr-studio.sweaven.dev/api/qr?url=https://google.com&text=VISIT&card=%23000000&tcolor=%23ffffff"
  alt="QR Code"
/>
```

#### Mobile App (React Native)

```javascript
<Image
  source={{ uri: 'https://qr-studio.sweaven.dev/api/qr?url=https://mysite.com&bg=transparent' }}
  style={{ width: 320, height: 400 }}
/>
```

## 🧩 Integration / Embeds

You can embed the studio's visual card directly into another website using an iframe.

### URL Pattern

```text
https://qr-studio.sweaven.dev/?view=embed&...params
```

Simply add `view=embed` to the URL query string to hide the editor sidebar and show only the card. All API parameters listed above also work as URL parameters for the frontend to pre-fill the state.

### HTML Example

```html
<iframe
  src="https://qr-studio.sweaven.dev/?view=embed&url=https://example.com&text=Promo"
  width="400"
  height="500"
  style="border:none;"
></iframe>
```

## 📄 License

This project is open source and available under the MIT License.
