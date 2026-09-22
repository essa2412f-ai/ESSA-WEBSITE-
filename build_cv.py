"""Builds Essa Muhammad's CV (A4, two pages) in the blue ES.DEV style. Run: python3 build_cv.py"""
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
from PIL import Image
import io, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.environ.get('CV_FONTS', '/home/claude/cvf/')
SI = os.environ.get('CV_ICONS', '/home/claude/si/package/icons/')
for n, p in [('Head', 'bricolage-bold.ttf'), ('HeadM', 'bricolage-medium.ttf'), ('Body', 'figtree-regular.ttf'),
             ('BodyM', 'figtree-medium.ttf'), ('BodyB', 'figtree-bold.ttf'), ('Mono', 'jbmono-regular.ttf'), ('MonoM', 'jbmono-medium.ttf')]:
    pdfmetrics.registerFont(TTFont(n, FONTS + p))

# palette (the mockup's blue system)
INK = HexColor('#0B1E3F'); TEXT = HexColor('#3E4B62'); MUTED = HexColor('#7B879C'); ACCENT = HexColor('#1F5BE3')
PAGE = HexColor('#F3F6FC'); CARD = HexColor('#FFFFFF'); LINE = HexColor('#DCE4F3'); TILE = HexColor('#E4EBFB')
NAVY = HexColor('#0B1E3F'); ONDARK = HexColor('#F2F5FF'); DARKMUTED = HexColor('#8FA3CF'); WHITE = HexColor('#FFFFFF')

W, H = A4
OUT = os.path.join(HERE, 'essa-cv.pdf')
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Essa Muhammad — Web Developer CV'); c.setAuthor('Essa Muhammad'); c.setSubject('Curriculum vitae')

# ---------------------------------------------------------------- helpers
def text(x, y, s, font='Body', size=10, color=TEXT, align='left'):
    c.setFont(font, size); c.setFillColor(color)
    {'right': c.drawRightString, 'center': c.drawCentredString}.get(align, c.drawString)(x, y, s)

def wrap(s, font, size, width):
    words, lines, cur = s.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def para(x, y, s, font='Body', size=10, color=TEXT, width=300, leading=14):
    for line in wrap(s, font, size, width):
        text(x, y, line, font, size, color); y -= leading
    return y

def label(x, y, s, color=MUTED, size=7.2, align='left'):
    text(x, y, s.upper(), 'MonoM', size, color, align)

def rule(x1, x2, y, color=LINE, w=0.6):
    c.setStrokeColor(color); c.setLineWidth(w); c.line(x1, y, x2, y)

def card(x, y, w, h, fill=CARD, stroke=LINE, r=8):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(0.7); c.roundRect(x, y, w, h, r, stroke=1, fill=1)

def dot(x, y, color=ACCENT, r=1.8):
    c.setFillColor(color); c.circle(x, y, r, stroke=0, fill=1)

LINE_ICONS = {
  'mail': '<path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm-.5 1.5L12 13l8.5-5.5"/>',
  'phone': '<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
  'whatsapp': '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19L4 20Z"/><path d="M9.3 8.7c-.3 1 .3 2.4 1.6 3.7s2.8 2 3.8 1.7l.7-1.2-1.6-1-.8.6c-.6-.2-1.7-1.3-1.9-1.9l.6-.8-1-1.6-1.4.5Z"/>',
  'instagram': '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".6"/>',
  'pin': '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/>',
  'briefcase': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>',
  'layers': '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  'folder': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  'cap': '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
  'code': '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  'user': '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
  'spark': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  'monitor': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  'star': '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
}

def hexstr(col):
    return col if isinstance(col, str) else '#%02X%02X%02X' % (int(col.red * 255), int(col.green * 255), int(col.blue * 255))

def brand_path(name):
    return re.search(r'<path d="([^"]+)"', open(SI + name + '.svg').read()).group(1)

def icon(name, x, y, size, color, brand=False):
    col = hexstr(color)
    if brand:
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%s" d="%s"/></svg>' % (col, brand_path(name))
    else:
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" '
               'stroke-linecap="round" stroke-linejoin="round">%s</svg>') % (col, LINE_ICONS[name])
    d = svg2rlg(io.BytesIO(svg.encode())); sc = size / 24.0
    d.width, d.height = size, size; d.scale(sc, sc); renderPDF.draw(d, c, x, y)

def tile(x, y, size, name, color=ACCENT, bg=TILE, brand=False, r=6):
    c.setFillColor(bg); c.roundRect(x, y, size, size, r, stroke=0, fill=1)
    icon(name, x + size * 0.22, y + size * 0.22, size * 0.56, color, brand)

def section(x, right, y, title, note='', ic='star'):
    """icon tile + heading, note on the right, hairline above"""
    rule(x, right, y + 14, LINE, 0.7)
    tile(x, y - 8, 24, ic)
    text(x + 32, y - 1, title, 'Head', 13.5, INK)
    if note: label(right, y - 1, note, ACCENT, 7.4, 'right')
    return y - 26

def swoosh(x, y, w, h, color, alpha=0.5, flip=False):
    """a soft curved shape for corners"""
    c.saveState(); c.setFillColor(Color(color.red, color.green, color.blue, alpha=alpha))
    p = c.beginPath()
    if not flip:
        p.moveTo(x, y + h); p.curveTo(x + w * 0.4, y + h, x + w * 0.7, y + h * 0.7, x + w, y + h * 0.15)
        p.lineTo(x + w, y + h); p.close()
    else:
        p.moveTo(x, y); p.curveTo(x + w * 0.3, y + h * 0.4, x + w * 0.6, y + h * 0.9, x + w, y + h); p.lineTo(x, y + h); p.close()
    c.drawPath(p, stroke=0, fill=1); c.restoreState()

# ================================================================ PAGE 1
SIDE = 196
c.setFillColor(PAGE); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(NAVY); c.rect(0, 0, SIDE, H, stroke=0, fill=1)
swoosh(0, H - 120, SIDE, 120, HexColor('#1F5BE3'), 0.35)
swoosh(0, 0, SIDE, 150, HexColor('#1F5BE3'), 0.28, flip=True)
c.setFillColor(Color(0.12, 0.36, 0.89, alpha=0.10)); c.circle(SIDE - 10, 40, 70, stroke=0, fill=1)

# photo (the real one, on a subtle blue frame)
im = Image.open(os.path.join(HERE, 'essa-profile.png')).convert('RGBA')
bg = Image.new('RGBA', im.size, (24, 48, 92, 255)); bg.alpha_composite(im); ph = bg.convert('RGB')
from PIL import ImageEnhance; ph = ImageEnhance.Brightness(ph).enhance(1.06).crop((60, 0, im.width - 60, int(im.width * 1.05)))
px, py, pw, phh = 24, H - 24 - 176, SIDE - 48, 176
c.saveState(); c.setFillColor(Color(1, 1, 1, alpha=0.12)); c.roundRect(px - 3, py - 3, pw + 6, phh + 6, 14, stroke=0, fill=1); c.restoreState()
c.saveState(); c.setFillAlpha(1); p = c.beginPath(); p.roundRect(px, py, pw, phh, 12); c.clipPath(p, stroke=0)
c.drawImage(ImageReader(ph), px, py, pw, phh, preserveAspectRatio=True, anchor='c'); c.restoreState()

y = py - 32
text(24, y, 'ESSA', 'Head', 27, ONDARK); y -= 27
text(24, y, 'MUHAMMAD', 'Head', 27, HexColor('#6E96FF')); y -= 15
label(24, y, 'Web Developer  ·  Karachi, Pakistan', DARKMUTED, 6.9); y -= 30

def side_title(y, s):
    text(24, y, s.upper(), 'BodyB', 9.5, ONDARK); rule(24, SIDE - 24, y - 8, HexColor('#2B4478'), 0.7); return y - 26

y = side_title(y, 'Contact')
for ic, k, v in [('mail', 'Email', 'essamuhammad5056@gmail.com'), ('phone', 'Phone', '0344 2611643'), ('whatsapp', 'WhatsApp', '+92 344 2611643'),
                 ('instagram', 'Instagram', '@essa.webdev'), ('pin', 'Location', 'Nazimabad, Karachi')]:
    tile(24, y - 11, 22, ic, HexColor('#7FA2FF'), HexColor('#1B3468'), r=6)
    label(54, y + 2, k, DARKMUTED, 6.6); text(54, y - 9, v, 'BodyM', 8.8 if len(v) < 22 else 7.4, ONDARK); y -= 30
y -= 4

y = side_title(y, 'Tech Stack')
stack = [('UI/UX', None, '#7FA2FF'), ('React', 'react', '#61DAFB'), ('PHP', 'php', '#9AA0E8'), ('HTML5', 'html5', '#FF7A55'), ('CSS3', 'css', '#4DA3FF'),
         ('JavaScript', 'javascript', '#F7DF1E'), ('jQuery', 'jquery', '#4DA3FF'), ('Bootstrap', 'bootstrap', '#B08CFF'), ('WordPress', 'wordpress', '#5CB8FF')]
xx = 24
for name, mark, col in stack:
    wdt = pdfmetrics.stringWidth(name, 'BodyM', 7.6) + 27
    if xx + wdt > SIDE - 24: xx = 24; y -= 23
    c.setFillColor(HexColor('#1B3468')); c.roundRect(xx, y - 7, wdt, 18, 9, stroke=0, fill=1)
    if mark: icon(mark, xx + 7, y - 2.5, 9, col, brand=True)
    else: icon('spark', xx + 7, y - 2.5, 9, col)
    text(xx + 20, y - 1, name, 'BodyM', 7.6, ONDARK); xx += wdt + 5
y -= 30

y = side_title(y, 'Capabilities')
for s in ['Responsive Websites', 'Front-End Development', 'WordPress Development', 'React Development', 'Clean UI', 'Website Usability']:
    icon('check', 24, y - 2, 10, '#7FA2FF'); text(38, y, s, 'Body', 8.8, ONDARK); y -= 15.5

label(24, 24, 'es.dev  ·  portfolio 2026', DARKMUTED)

# ---- right column
L, R = SIDE + 30, W - 30
y = H - 50
label(L, y, 'Curriculum vitae', ACCENT); label(R, y, 'Available for web development opportunities', MUTED, 6.8, 'right')
y -= 30
text(L, y, 'Web Developer', 'Head', 30, INK); y -= 24
y = para(L, y, 'I build modern, responsive and user-friendly websites, with a focus on clean code, great design and a strong user experience.',
         'HeadM', 13, INK, R - L, 17.5)
y -= 4
y = para(L, y, 'Web developer with 2 years of practical experience creating modern, responsive and user-friendly websites. Skilled in HTML, CSS, JavaScript, WordPress and React. I enjoy turning ideas into real websites and I always look for opportunities to learn and grow.',
         'Body', 10.4, TEXT, R - L, 15)
y -= 18

y = section(L, R, y, 'Experience', '2 years', 'briefcase')
text(L, y, 'Web Developer', 'BodyB', 11.5, INK); y -= 17
for s in ['Developed and maintained responsive websites using HTML, CSS and JavaScript.',
          'Built and customized WordPress websites according to project requirements.',
          'Worked with React to create modern component-based user interfaces.',
          'Focused on clean UI, responsive layouts and website usability.']:
    dot(L + 3, y + 3.2); y = para(L + 14, y, s, 'Body', 10.2, TEXT, R - L - 14, 14.2) - 5
y -= 16

y = section(L, R, y, 'What I can do for you', 'Services', 'layers')
cols = [('monitor', None, 'Business & portfolio websites', 'Responsive websites built by hand with HTML, CSS and JavaScript: clean, fast to use and comfortable on every screen size.', ['HTML', 'CSS', 'JavaScript']),
        ('wordpress', 'brand', 'WordPress websites', "WordPress sites built and customized to your project's requirements, from the first page to the finished site.", ['WordPress']),
        ('react', 'brand', 'React interfaces', 'Modern, component-based user interfaces built with React, with the same focus on clean UI and usability.', ['React', 'JavaScript'])]
cw = (R - L - 20) / 3; CH = 190
for i, (ic, kind, t, d, st) in enumerate(cols):
    x = L + i * (cw + 10)
    card(x, y - CH + 12, cw, CH)
    if kind: icon(ic, x + 12, y - 16, 22, ACCENT, brand=True)
    else: icon(ic, x + 12, y - 16, 22, ACCENT)
    ty = y - 32
    for line in wrap(t, 'BodyB', 10, cw - 22): text(x + 12, ty, line, 'BodyB', 10, INK); ty -= 12.5
    para(x + 12, ty - 3, d, 'Body', 8.3, TEXT, cw - 22, 11.2)
    # stack line, bottom-aligned in every card (same baseline across the three cards)
    lines = wrap(' · '.join(st).upper(), 'MonoM', 7, cw - 24)
    rule(x + 12, x + cw - 12, y - CH + 40 + 11 * (len(lines) - 1), LINE, 0.6)
    for k, line in enumerate(reversed(lines)):
        text(x + 12, y - CH + 26 + 11 * k, line, 'MonoM', 7, ACCENT)
y -= CH + 22

y = section(L, R, y, 'Featured project', '01 / Live', 'folder')
text(L, y, 'Candy Cloudz', 'Head', 17, INK)
label(R, y + 1, 'candycloudtest.syntaxdynamics.com', ACCENT, 7.2, 'right')
c.linkURL('https://candycloudtest.syntaxdynamics.com', (L, y - 4, R, y + 14), relative=0)
y -= 16
y = para(L, y, 'A responsive website designed and developed from start to finish, built to look and work well on phones, tablets and desktops.', 'Body', 10.2, TEXT, R - L, 14.2)
y -= 10
for k, v in [('Role', 'Design & Development'), ('Type', 'Responsive Website'), ('Status', 'Live')]:
    rule(L, R, y - 6, LINE, 0.5)
    label(L, y, k); text(L + 64, y, v, 'BodyM', 10, INK); y -= 20

rule(L, R, 34, LINE, 0.6)
label(L, 22, 'Essa Muhammad  ·  essamuhammad5056@gmail.com', MUTED, 6.6); label(R, 22, 'ES.DEV · Page 1 / 2', MUTED, 6.6, 'right')
c.showPage()

# ================================================================ PAGE 2
c.setFillColor(PAGE); c.rect(0, 0, W, H, stroke=0, fill=1)
swoosh(W - 260, H - 90, 260, 90, HexColor('#1F5BE3'), 0.14)
swoosh(0, H - 60, 180, 60, HexColor('#1F5BE3'), 0.10, flip=True)
L, R = 30, W - 30
text(L, H - 40, 'ESSA', 'Head', 15, INK); text(L + pdfmetrics.stringWidth('ESSA ', 'Head', 15), H - 40, 'MUHAMMAD', 'Head', 15, ACCENT)
label(R, H - 38, 'Web Developer  ·  Karachi  ·  essamuhammad5056@gmail.com', MUTED, 6.8, 'right')
rule(L, R, H - 56, LINE, 0.7)
y = H - 86

y = section(L, R, y, 'Tech stack — what I build with', '09 technologies', 'code')
TECH = [('UI/UX', None, '#1F5BE3', 'Interfaces designed around clarity, interaction and user experience.', ['Wireframes', 'Responsive Design', 'Interaction Design', 'Prototyping']),
        ('React', 'react', '#3FA9C9', 'Component-driven interfaces for modern interactive web experiences.', ['Components', 'Responsive UI', 'API Integration', 'Interactive Experiences']),
        ('PHP', 'php', '#777BB4', 'Server-side development for dynamic websites and custom functionality.', ['Backend Logic', 'Forms', 'API Integration', 'Database Integration']),
        ('HTML', 'html5', '#E34F26', 'Clean semantic foundations for accessible and responsive websites.', ['Semantic Structure', 'Accessibility', 'SEO Structure', 'Responsive Markup']),
        ('CSS', 'css', '#1572B6', 'Modern styling, responsive layouts and polished visual experiences.', ['Responsive Design', 'Flexbox & Grid', 'Animations', 'Custom Styling']),
        ('JavaScript', 'javascript', '#C9B400', 'Interactive behavior and advanced front-end experiences.', ['DOM Interaction', 'Animations', 'APIs', 'Custom Functionality']),
        ('jQuery', 'jquery', '#0769AD', 'Efficient interaction and maintenance for existing web experiences.', ['DOM Manipulation', 'Events', 'AJAX', 'Legacy Projects']),
        ('Bootstrap', 'bootstrap', '#7952B3', 'Responsive interface development using a reliable component system.', ['Responsive Grid', 'Components', 'Layouts', 'Rapid Development']),
        ('WordPress', 'wordpress', '#21759B', 'Flexible websites built around manageable content and custom functionality.', ['Custom Websites', 'Theme Customization', 'WooCommerce', 'Performance'])]
gw = (R - L - 20) / 3; GH = 106
for i, (name, mark, col, desc, focus) in enumerate(TECH):
    x = L + (i % 3) * (gw + 10); yy = y - (i // 3) * (GH + 10)
    card(x, yy - GH + 14, gw, GH)
    hc = HexColor(col); c.setFillColor(Color(hc.red, hc.green, hc.blue, alpha=0.14)); c.roundRect(x + 10, yy - 12, 24, 24, 6, stroke=0, fill=1)
    if mark: icon(mark, x + 15.5, yy - 6.5, 13, col, brand=True)
    else: icon('spark', x + 15.5, yy - 6.5, 13, col)
    text(x + 42, yy - 1, name, 'BodyB', 10.5, INK)
    label(x + gw - 10, yy - 1, '0%d' % (i + 1), MUTED, 7, 'right')
    ty = para(x + 10, yy - 27, desc, 'Body', 8, TEXT, gw - 20, 10.4)
    ty -= 2
    for f in focus:
        dot(x + 13, ty + 2.6, ACCENT, 1.5); text(x + 20, ty, f, 'BodyM', 7.8, INK); ty -= 10
y -= 3 * (GH + 10) - 4

y = section(L, R, y, 'Education', '', 'cap')
c.setStrokeColor(LINE); c.setLineWidth(1.2); c.line(L + 4, y + 4, L + 4, y - 46)
for title, state, note in [('Intermediate', 'In progress', 'Continuing alongside web development work.'), ('9th & 10th Grade', 'Completed', 'Secondary education.')]:
    dot(L + 4, y + 3.5, ACCENT, 3.2)
    text(L + 16, y, title, 'BodyB', 10.5, INK); label(R, y, state, ACCENT if state == 'In progress' else MUTED, 7, 'right')
    text(L + 16, y - 13, note, 'Body', 8.8, TEXT); y -= 30
y -= 2

y = section(L, R, y, 'Capabilities', '', 'check')
xx = L
for cp in ['Responsive Websites', 'Front-End Development', 'WordPress Development', 'React Development', 'Clean UI', 'Website Usability']:
    wdt = pdfmetrics.stringWidth(cp, 'BodyM', 8) + 18
    if xx + wdt > R: xx = L; y -= 24
    c.setFillColor(TILE); c.roundRect(xx, y - 6, wdt, 20, 10, stroke=0, fill=1)
    text(xx + 9, y, cp, 'BodyM', 8, ACCENT); xx += wdt + 6
y -= 34

y = section(L, R, y, 'What happens next', 'How I work', 'user')
steps = ['You send me a message with what you need.', 'I reply by email or WhatsApp with questions and a plan.', 'We agree on scope, timeline and price before any work starts.']
sw = (R - L) / 3
for i, st in enumerate(steps):
    x = L + i * sw
    if i: c.setStrokeColor(LINE); c.setLineWidth(0.7); c.line(x - 8, y + 6, x - 8, y - 40)
    c.setFillColor(TILE); c.roundRect(x, y - 8, 26, 20, 5, stroke=0, fill=1)
    text(x + 13, y - 2, '0%d' % (i + 1), 'BodyB', 10, ACCENT, 'center')
    para(x, y - 24, st, 'Body', 8.6, TEXT, sw - 22, 11.4)
y -= 60

# closing band
band_y = 44; bh = 74
c.setFillColor(HexColor('#E8EEFB')); c.setStrokeColor(HexColor('#CFDCF5')); c.roundRect(L, band_y, R - L, bh, 10, stroke=1, fill=1)
text(L + 20, band_y + bh - 24, "Have an idea? Let's turn it into something real.", 'Head', 14, INK)
icon('mail', L + 20, band_y + 18, 11, ACCENT); text(L + 36, band_y + 20, 'essamuhammad5056@gmail.com', 'BodyM', 8.8, INK)
icon('whatsapp', L + 190, band_y + 18, 11, ACCENT); text(L + 206, band_y + 20, '+92 344 2611643', 'BodyM', 8.8, INK)
icon('instagram', L + 292, band_y + 18, 11, ACCENT); text(L + 308, band_y + 20, '@essa.webdev', 'BodyM', 8.8, INK)
c.setFillColor(ACCENT); c.roundRect(R - 20 - 124, band_y + 21, 124, 32, 16, stroke=0, fill=1)
text(R - 20 - 62, band_y + 32.5, 'AVAILABLE FOR WORK', 'BodyB', 8, WHITE, 'center')
c.linkURL('mailto:essamuhammad5056@gmail.com', (L + 20, band_y + 16, L + 180, band_y + 36), relative=0)
c.linkURL('https://www.instagram.com/essa.webdev/', (L + 292, band_y + 16, L + 400, band_y + 36), relative=0)

rule(L, R, 34, LINE, 0.6)
label(L, 22, 'Essa Muhammad  ·  essamuhammad5056@gmail.com', MUTED, 6.6); label(R, 22, 'ES.DEV · Page 2 / 2', MUTED, 6.6, 'right')
c.showPage(); c.save()
print('saved', OUT)
