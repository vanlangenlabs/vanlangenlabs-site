from pathlib import Path

import qrcode
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
VCARD_PATH = ROOT / "docs" / "pwr" / "pwrpack.vcf"
LOGO_PATH = ROOT / "docs" / "pwr" / "pwr-logo.png"
VCARD_QR_PATH = ROOT / "docs" / "pwr" / "vcard.png"
VCARD_URL_QR_PATH = ROOT / "docs" / "pwr" / "vcard-url.png"
VCARD_URL = "https://vanlangen.org/pwr/pwrpack.vcf"

QR_SIZE = 1200
BASE_QR_SIZE = 300
BASE_LOGO_BOX_SIZE = 68
BASE_LOGO_PADDING = 8
BASE_LOGO_BOX_RADIUS = 6

SCALE = QR_SIZE / BASE_QR_SIZE
LOGO_BOX_SIZE = round(BASE_LOGO_BOX_SIZE * SCALE)
LOGO_PADDING = round(BASE_LOGO_PADDING * SCALE)
LOGO_BOX_RADIUS = round(BASE_LOGO_BOX_RADIUS * SCALE)


def make_qr_image(vcard_text: str) -> Image.Image:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(vcard_text)
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    return image.resize((QR_SIZE, QR_SIZE), Image.Resampling.NEAREST)


def make_logo_overlay() -> Image.Image:
    overlay = Image.new("RGBA", (LOGO_BOX_SIZE, LOGO_BOX_SIZE), (255, 255, 255, 0))
    mask = Image.new("L", (LOGO_BOX_SIZE, LOGO_BOX_SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, LOGO_BOX_SIZE, LOGO_BOX_SIZE),
        radius=LOGO_BOX_RADIUS,
        fill=255,
    )

    background = Image.new("RGBA", (LOGO_BOX_SIZE, LOGO_BOX_SIZE), "white")
    overlay.paste(background, (0, 0), mask)

    logo_size = LOGO_BOX_SIZE - LOGO_PADDING * 2
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_scale = min(logo_size / logo.width, logo_size / logo.height)
    logo_width = round(logo.width * logo_scale)
    logo_height = round(logo.height * logo_scale)
    logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    logo_x = (LOGO_BOX_SIZE - logo.width) // 2
    logo_y = (LOGO_BOX_SIZE - logo.height) // 2
    overlay.alpha_composite(logo, (logo_x, logo_y))

    return overlay


def save_qr_png(data: str, output_path: Path) -> None:
    qr_image = make_qr_image(data)
    logo_overlay = make_logo_overlay()

    overlay_x = (QR_SIZE - LOGO_BOX_SIZE) // 2
    overlay_y = (QR_SIZE - LOGO_BOX_SIZE) // 2
    qr_image.alpha_composite(logo_overlay, (overlay_x, overlay_y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    qr_image.convert("RGB").save(output_path, "PNG", optimize=True)
    print(f"Generated {output_path.relative_to(ROOT)}")


def main() -> None:
    vcard_text = VCARD_PATH.read_text(encoding="utf-8").strip()
    save_qr_png(vcard_text, VCARD_QR_PATH)
    save_qr_png(VCARD_URL, VCARD_URL_QR_PATH)


if __name__ == "__main__":
    main()