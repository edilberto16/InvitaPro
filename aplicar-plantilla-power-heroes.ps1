$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Get-Location
$adminPath = Join-Path $project 'app/admin/invitaciones/page.tsx'
$cssPath = Join-Path $project 'app/globals.css'

if (!(Test-Path $adminPath) -or !(Test-Path $cssPath)) {
  throw 'Ejecuta este script desde la raíz de InvitaPro, donde existen app/admin/invitaciones/page.tsx y app/globals.css.'
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item $adminPath "$adminPath.bak-$stamp"
Copy-Item $cssPath "$cssPath.bak-$stamp"

$admin = Get-Content $adminPath -Raw -Encoding UTF8

# Busca la plantilla por su ID, sin depender del nombre, acentos,
# descripcion, espacios o del estado actual del catalogo.
$powerEntry = "{id:'superheroes',name:'Power Heroes',collection:'infantil',badge:'Disponible',available:true,color:'#e22d32',description:'Heroes de colores, energia, rayos y accion para cumpleanos.',layout:'hero'},"
$pattern = "\{id:'superheroes'[^`r`n]*\},"

if ([regex]::IsMatch($admin, $pattern)) {
  $admin = [regex]::Replace($admin, $pattern, $powerEntry, 1)
} elseif ($admin.Contains("id:'superheroes'")) {
  throw 'Se encontro el ID superheroes, pero su formato ocupa varias lineas. Comparte ese bloque para ajustarlo.'
} else {
  # Si la version actual no contiene la entrada, la agrega antes
  # de la primera plantilla empresarial.
  $corporatePattern = "\{id:'corporativo'"
  if ([regex]::IsMatch($admin, $corporatePattern)) {
    $admin = [regex]::Replace(
      $admin,
      $corporatePattern,
      "$powerEntry`r`n  {id:'corporativo'",
      1
    )
  } else {
    throw 'No se encontro TEMPLATE_CATALOG ni la entrada corporativo. No se modifico el proyecto.'
  }
}

Set-Content $adminPath $admin -Encoding UTF8

$css = Get-Content $cssPath -Raw -Encoding UTF8
$marker = '/* Plantilla Power Heroes v1.9.1 */'
if (!$css.Contains($marker)) {
  $powerCss = @'

/* Plantilla Power Heroes v1.9.1
   Inspirada en equipos de héroes de colores, sin logotipos ni personajes protegidos. */
.theme-preview-superheroes .template-mini-preview {
  color: #fff;
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(255,255,255,.92) 48% 51%, transparent 52%),
    linear-gradient(112deg,
      #e4252c 0 20%,
      #1769d2 20% 40%,
      #f2c318 40% 60%,
      #ee5aa1 60% 80%,
      #17191f 80% 100%);
}
.theme-preview-superheroes .template-mini-preview::before {
  width: 170px;
  height: 170px;
  top: -118px;
  right: -58px;
  border: 10px solid rgba(255,255,255,.22);
  box-shadow: 0 0 0 10px rgba(255,255,255,.06);
}
.theme-preview-superheroes .template-mini-preview::after {
  width: 120px;
  height: 120px;
  bottom: -76px;
  left: -38px;
  border-width: 8px;
}
.theme-preview-superheroes .template-mini-preview strong {
  font-family: Arial Black, Arial, sans-serif;
  font-style: italic;
  letter-spacing: -.08em;
  text-shadow: 3px 3px 0 #111, 0 0 18px rgba(255,255,255,.8);
}

.theme-superheroes {
  --hero-red: #e3292f;
  --hero-blue: #1268d3;
  --hero-yellow: #f2c21a;
  --hero-pink: #e95d9f;
  --hero-black: #11151b;
  --hero-silver: #eef2f5;
  color: #f7f9fb;
  background: #0d1118;
}
.theme-superheroes .premium-hero {
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(255,255,255,.18), transparent 24%),
    linear-gradient(118deg,
      var(--hero-red) 0 20%,
      var(--hero-blue) 20% 40%,
      var(--hero-yellow) 40% 60%,
      var(--hero-pink) 60% 80%,
      var(--hero-black) 80% 100%);
}
.theme-superheroes .premium-hero::before {
  content: '';
  position: absolute;
  inset: -20%;
  z-index: 0;
  background:
    repeating-conic-gradient(from 8deg at 50% 50%, rgba(255,255,255,.17) 0 3deg, transparent 3deg 17deg);
  animation: powerHeroSpin 28s linear infinite;
  pointer-events: none;
}
.theme-superheroes .premium-hero::after {
  content: '⚡';
  position: absolute;
  right: 7%;
  top: 10%;
  z-index: 1;
  color: rgba(255,255,255,.78);
  font-size: clamp(90px, 15vw, 230px);
  filter: drop-shadow(0 0 22px rgba(255,255,255,.75));
  transform: rotate(10deg);
  pointer-events: none;
}
.theme-superheroes .premium-hero-background {
  filter: saturate(1.18) contrast(1.12);
  mix-blend-mode: luminosity;
  opacity: .62;
}
.theme-superheroes .premium-hero-overlay {
  background:
    linear-gradient(180deg, rgba(5,8,13,.12), rgba(5,8,13,.84)),
    linear-gradient(115deg, rgba(227,41,47,.26), transparent 36%, rgba(18,104,211,.24));
}
.theme-superheroes .premium-kicker,
.theme-superheroes .premium-small-title {
  color: var(--hero-yellow);
  letter-spacing: .22em;
}
.theme-superheroes .premium-hero h1,
.theme-superheroes .premium-intro-block h2,
.theme-superheroes .premium-section-heading h2,
.theme-superheroes .premium-location-card h2,
.theme-superheroes .premium-rsvp-card h2 {
  font-family: Arial Black, Impact, Arial, sans-serif;
  font-style: italic;
  font-weight: 900;
  letter-spacing: -.055em;
  text-transform: uppercase;
}
.theme-superheroes .premium-hero h1 {
  max-width: 1040px;
  text-shadow: 5px 5px 0 rgba(0,0,0,.72), 0 0 32px rgba(255,255,255,.34);
  transform: skewX(-4deg);
}
.theme-superheroes .premium-hero-date {
  border: 2px solid rgba(255,255,255,.7);
  border-radius: 10px;
  background: rgba(8,12,18,.48);
  box-shadow: 6px 6px 0 rgba(0,0,0,.32);
}
.theme-superheroes .premium-scroll-link,
.theme-superheroes .garden-calendar-button {
  border: 2px solid #fff;
  border-radius: 8px;
  color: #111;
  background: var(--hero-yellow);
  box-shadow: 5px 5px 0 var(--hero-red);
  text-transform: uppercase;
}
.theme-superheroes .premium-intro-block,
.theme-superheroes .premium-details-section,
.theme-superheroes .premium-gallery-section,
.theme-superheroes .premium-rsvp-section {
  color: #eaf0f6;
  background:
    linear-gradient(135deg, rgba(255,255,255,.035) 25%, transparent 25%) 0 0/34px 34px,
    #0d1118;
}
.theme-superheroes .premium-intro-block h2,
.theme-superheroes .premium-section-heading h2,
.theme-superheroes .premium-location-card h2,
.theme-superheroes .premium-rsvp-card h2 {
  color: #fff;
  text-shadow: 3px 3px 0 var(--hero-blue);
}
.theme-superheroes .premium-copy,
.theme-superheroes .premium-gallery-section .premium-section-heading > p:last-child {
  color: #bfc9d4;
}
.theme-superheroes .premium-countdown-section {
  border: 0;
  background:
    linear-gradient(115deg, rgba(227,41,47,.92), rgba(18,104,211,.92)),
    #11151b;
}
.theme-superheroes .premium-countdown-grid {
  gap: 14px;
}
.theme-superheroes .premium-countdown-grid article {
  min-height: 150px;
  border: 3px solid #fff;
  border-radius: 16px 4px 16px 4px;
  color: #fff;
  background: rgba(7,10,15,.52);
  box-shadow: 7px 7px 0 rgba(0,0,0,.32);
  transform: skewX(-3deg);
}
.theme-superheroes .premium-countdown-grid article:nth-child(2) {
  border-color: var(--hero-yellow);
}
.theme-superheroes .premium-countdown-grid article:nth-child(3) {
  border-color: var(--hero-pink);
}
.theme-superheroes .premium-detail-grid article {
  min-height: 250px;
  border: 2px solid #2d3948;
  border-radius: 16px 4px 16px 4px;
  color: #eaf0f6;
  background: linear-gradient(145deg, #18202b, #0d1118);
  box-shadow: 8px 8px 0 rgba(18,104,211,.28);
}
.theme-superheroes .premium-detail-grid article:nth-child(2) {
  box-shadow: 8px 8px 0 rgba(242,194,26,.30);
}
.theme-superheroes .premium-detail-grid article:nth-child(3) {
  box-shadow: 8px 8px 0 rgba(233,93,159,.28);
}
.theme-superheroes .premium-detail-icon {
  border-radius: 8px;
  color: #111;
  background: var(--hero-yellow);
}
.theme-superheroes .premium-program-section {
  background:
    linear-gradient(120deg, rgba(8,12,18,.91), rgba(8,12,18,.80)),
    repeating-linear-gradient(135deg, var(--hero-red) 0 18px, var(--hero-blue) 18px 36px);
}
.theme-superheroes .premium-timeline article > span {
  border: 3px solid #fff;
  color: #111;
  background: var(--hero-yellow);
  box-shadow: 4px 4px 0 var(--hero-red);
}
.theme-superheroes .premium-gallery-grid figure {
  border: 4px solid #fff;
  border-radius: 18px 4px 18px 4px;
  box-shadow: 9px 9px 0 var(--hero-blue);
  transform: rotate(-1deg);
}
.theme-superheroes .premium-gallery-grid figure:nth-child(even) {
  box-shadow: 9px 9px 0 var(--hero-red);
  transform: rotate(1deg);
}
.theme-superheroes .premium-location-section {
  background:
    radial-gradient(circle at 20% 30%, rgba(242,194,26,.22), transparent 22%),
    linear-gradient(135deg, #151c26, #080b10);
}
.theme-superheroes .premium-location-card,
.theme-superheroes .premium-rsvp-card {
  border: 3px solid #fff;
  border-radius: 20px 5px 20px 5px;
  color: #eaf0f6;
  background: linear-gradient(145deg, rgba(27,36,48,.96), rgba(10,14,20,.96));
  box-shadow: 10px 10px 0 var(--hero-red);
}
.theme-superheroes .premium-location-actions a,
.theme-superheroes .rsvp-submit {
  border: 2px solid #fff;
  border-radius: 8px;
  color: #111;
  background: var(--hero-yellow);
  box-shadow: 5px 5px 0 var(--hero-blue);
  text-transform: uppercase;
}
.theme-superheroes .premium-location-actions a.secondary {
  color: #fff;
  background: var(--hero-red);
}
.theme-superheroes .rsvp-choice {
  border: 2px solid #354356;
  border-radius: 12px 3px 12px 3px;
  color: #dce5ee;
  background: #121923;
}
.theme-superheroes .rsvp-choice.selected {
  border-color: var(--hero-yellow);
  box-shadow: 5px 5px 0 rgba(242,194,26,.28);
}
.theme-superheroes .premium-footer {
  min-height: 340px;
  background:
    linear-gradient(135deg, transparent 0 48%, rgba(255,255,255,.08) 49% 51%, transparent 52%),
    linear-gradient(112deg, var(--hero-red), var(--hero-blue) 38%, var(--hero-black) 72%);
}
.theme-superheroes .pass-card-brand {
  background:
    linear-gradient(125deg, rgba(227,41,47,.90), rgba(18,104,211,.88)),
    #11151b;
}
.theme-superheroes .personalized-premium-pass-card {
  border: 3px solid #fff;
  border-radius: 18px 4px 18px 4px;
  box-shadow: 10px 10px 0 var(--hero-yellow);
}
.theme-superheroes .personalized-pass-grid article,
.theme-superheroes .personalized-pass-code {
  color: #eaf0f6;
  background: #121923;
}
.theme-superheroes .personalized-pass-grid strong,
.theme-superheroes .personalized-pass-code strong {
  color: var(--hero-yellow);
}
.theme-superheroes .invitation-opening-screen {
  background: #080b10;
}
.theme-superheroes .opening-screen-shade {
  background:
    linear-gradient(135deg, transparent 0 47%, rgba(255,255,255,.15) 48% 51%, transparent 52%),
    linear-gradient(180deg, rgba(8,11,16,.20), rgba(8,11,16,.88));
}
.theme-superheroes .opening-screen-content h1 {
  font-family: Arial Black, Impact, Arial, sans-serif;
  font-style: italic;
  text-transform: uppercase;
  text-shadow: 5px 5px 0 var(--hero-blue), 0 0 24px rgba(255,255,255,.34);
}
.theme-superheroes .opening-screen-content button {
  border-radius: 8px;
  color: #111;
  background: var(--hero-yellow);
  box-shadow: 6px 6px 0 var(--hero-red);
}
@keyframes powerHeroSpin {
  to { transform: rotate(360deg); }
}
@media (max-width: 760px) {
  .theme-superheroes .premium-hero::after {
    right: -3%;
    top: 14%;
    font-size: 96px;
    opacity: .5;
  }
  .theme-superheroes .premium-hero h1 {
    font-size: clamp(48px, 15vw, 78px);
  }
  .theme-superheroes .premium-countdown-grid article {
    min-height: 108px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .theme-superheroes .premium-hero::before {
    animation: none;
  }
}
'@
  $css += $powerCss
  Set-Content $cssPath $css -Encoding UTF8
}

Write-Host ''
Write-Host 'Plantilla Power Heroes instalada correctamente.' -ForegroundColor Green
Write-Host 'Respaldos creados:' -ForegroundColor Cyan
Write-Host " - $adminPath.bak-$stamp"
Write-Host " - $cssPath.bak-$stamp"
Write-Host ''
Write-Host 'Siguiente paso: pnpm run dev' -ForegroundColor Yellow
