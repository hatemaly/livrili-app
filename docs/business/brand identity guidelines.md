<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Livrili Brand Identity Guide</title>
    <style>
        :root {
            --prussian-blue: #003049;
            --fire-brick: #c1121f;
            --papaya-whip: #fdf0d5;
            --barn-red: #780000;
            --air-superiority-blue: #669bbc;
            --white: #ffffff;
            --gray-light: #f5f5f5;
            --gray-medium: #888888;
            --gray-dark: #333333;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--gray-dark);
            background-color: var(--white);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .hero {
            background: linear-gradient(135deg, var(--prussian-blue) 0%, var(--air-superiority-blue) 100%);
            color: var(--white);
            padding: 80px 20px;
            text-align: center;
            margin-bottom: 60px;
        }

        .hero h1 {
            font-size: 3em;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .hero p {
            font-size: 1.3em;
            opacity: 0.9;
        }

        .section {
            margin-bottom: 80px;
        }

        .section-title {
            font-size: 2.5em;
            color: var(--prussian-blue);
            margin-bottom: 30px;
            border-bottom: 3px solid var(--fire-brick);
            padding-bottom: 15px;
        }

        .logo-showcase {
            background-color: var(--gray-light);
            padding: 60px;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            font-size: 48px;
            font-weight: 800;
            letter-spacing: -2px;
        }

        .logo-icon {
            width: 60px;
            height: 60px;
            margin-right: 15px;
            position: relative;
        }

        .logo-box {
            width: 60px;
            height: 60px;
            background-color: var(--fire-brick);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
        }

        .logo-box::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background-color: var(--papaya-whip);
            border-radius: 8px;
        }

        .logo-box::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px;
            color: var(--fire-brick);
            font-weight: bold;
        }

        .logo-text {
            color: var(--prussian-blue);
        }

        .logo-variations {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }

        .logo-var {
            padding: 40px;
            border-radius: 12px;
            text-align: center;
        }

        .logo-var.dark {
            background-color: var(--prussian-blue);
        }

        .logo-var.dark .logo-text {
            color: var(--white);
        }

        .logo-var.light {
            background-color: var(--white);
            border: 2px solid var(--gray-light);
        }

        .color-palette {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .color-swatch {
            border-radius: 12px;
            padding: 40px 20px 20px;
            text-align: center;
            color: var(--white);
            transition: transform 0.3s ease;
        }

        .color-swatch:hover {
            transform: translateY(-5px);
        }

        .color-swatch.primary { background-color: var(--prussian-blue); }
        .color-swatch.secondary { background-color: var(--fire-brick); }
        .color-swatch.accent { background-color: var(--air-superiority-blue); }
        .color-swatch.support { background-color: var(--barn-red); }
        .color-swatch.neutral {
            background-color: var(--papaya-whip);
            color: var(--gray-dark);
        }

        .color-name {
            font-weight: 700;
            font-size: 1.1em;
            margin-bottom: 5px;
        }

        .color-hex {
            font-family: monospace;
            opacity: 0.8;
        }

        .typography {
            margin-bottom: 40px;
        }

        .type-sample {
            margin-bottom: 30px;
            padding: 20px;
            background-color: var(--gray-light);
            border-radius: 8px;
        }

        .type-label {
            font-size: 0.9em;
            color: var(--gray-medium);
            margin-bottom: 10px;
        }

        h1.sample { font-size: 2.5em; font-weight: 700; color: var(--prussian-blue); }
        h2.sample { font-size: 2em; font-weight: 600; color: var(--prussian-blue); }
        h3.sample { font-size: 1.5em; font-weight: 600; color: var(--gray-dark); }
        p.sample { font-size: 1em; line-height: 1.6; color: var(--gray-dark); }

        .brand-values {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .value-card {
            background-color: var(--gray-light);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .value-card:hover {
            background-color: var(--papaya-whip);
            transform: translateY(-5px);
        }

        .value-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }

        .value-title {
            font-size: 1.3em;
            font-weight: 600;
            color: var(--prussian-blue);
            margin-bottom: 10px;
        }

        .applications {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        .app-card {
            background-color: var(--white);
            border: 2px solid var(--gray-light);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
        }

        .business-card {
            background: linear-gradient(135deg, var(--prussian-blue) 0%, var(--air-superiority-blue) 100%);
            color: var(--white);
            padding: 40px;
            border-radius: 12px;
            max-width: 400px;
            margin: 0 auto;
        }

        .bc-logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 30px;
        }

        .bc-info {
            line-height: 1.8;
        }

        .pattern-showcase {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .pattern {
            height: 150px;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
        }

        .pattern-1 {
            background: repeating-linear-gradient(
                45deg,
                var(--prussian-blue),
                var(--prussian-blue) 10px,
                var(--air-superiority-blue) 10px,
                var(--air-superiority-blue) 20px
            );
        }

        .pattern-2 {
            background-color: var(--papaya-whip);
            background-image:
                radial-gradient(circle at 25% 25%, var(--fire-brick) 0%, transparent 25%),
                radial-gradient(circle at 75% 75%, var(--fire-brick) 0%, transparent 25%);
            background-size: 40px 40px;
        }

        .pattern-3 {
            background:
                linear-gradient(90deg, var(--prussian-blue) 50%, transparent 50%),
                linear-gradient(var(--air-superiority-blue) 50%, transparent 50%);
            background-size: 20px 20px;
        }

        .icon-set {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
            justify-content: center;
            padding: 40px;
            background-color: var(--gray-light);
            border-radius: 12px;
        }

        .icon {
            width: 60px;
            height: 60px;
            background-color: var(--fire-brick);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 24px;
            transition: all 0.3s ease;
        }

        .icon:hover {
            background-color: var(--prussian-blue);
            transform: scale(1.1);
        }

        .voice-tone {
            background-color: var(--papaya-whip);
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 40px;
        }

        .voice-attributes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .attribute {
            text-align: center;
            padding: 20px;
            background-color: var(--white);
            border-radius: 8px;
        }

        .attribute-title {
            font-weight: 600;
            color: var(--prussian-blue);
            margin-bottom: 5px;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2em;
            }

            .section-title {
                font-size: 1.8em;
            }

            .logo {
                font-size: 36px;
            }

            .logo-icon {
                width: 45px;
                height: 45px;
            }
        }
    </style>

</head>
<body>
    <!-- Hero Section -->
    <div class="hero">
        <h1>Livrili Brand Identity</h1>
        <p>Connecting Retailers & Suppliers Across Algeria</p>
    </div>

    <div class="container">
        <!-- Logo Section -->
        <section class="section">
            <h2 class="section-title">Logo & Identity</h2>

            <div class="logo-showcase">
                <div class="logo">
                    <div class="logo-icon">
                        <div class="logo-box"></div>
                    </div>
                    <span class="logo-text">Livrili</span>
                </div>
            </div>

            <div class="logo-variations">
                <div class="logo-var dark">
                    <div class="logo" style="font-size: 32px;">
                        <div class="logo-icon" style="width: 40px; height: 40px;">
                            <div class="logo-box" style="width: 40px; height: 40px;"></div>
                        </div>
                        <span class="logo-text">Livrili</span>
                    </div>
                    <p style="margin-top: 20px; opacity: 0.8;">Dark Background</p>
                </div>
                <div class="logo-var light">
                    <div class="logo" style="font-size: 32px;">
                        <div class="logo-icon" style="width: 40px; height: 40px;">
                            <div class="logo-box" style="width: 40px; height: 40px;"></div>
                        </div>
                        <span class="logo-text">Livrili</span>
                    </div>
                    <p style="margin-top: 20px; color: var(--gray-medium);">Light Background</p>
                </div>
            </div>
        </section>

        <!-- Color Palette -->
        <section class="section">
            <h2 class="section-title">Color Palette</h2>

            <div class="color-palette">
                <div class="color-swatch primary">
                    <div class="color-name">Prussian Blue</div>
                    <div class="color-hex">#003049</div>
                    <p style="margin-top: 10px; font-size: 0.9em;">Primary - Trust & Professionalism</p>
                </div>
                <div class="color-swatch secondary">
                    <div class="color-name">Fire Brick</div>
                    <div class="color-hex">#C1121F</div>
                    <p style="margin-top: 10px; font-size: 0.9em;">Secondary - Energy & Action</p>
                </div>
                <div class="color-swatch accent">
                    <div class="color-name">Air Blue</div>
                    <div class="color-hex">#669BBC</div>
                    <p style="margin-top: 10px; font-size: 0.9em;">Accent - Clarity & Support</p>
                </div>
                <div class="color-swatch support">
                    <div class="color-name">Barn Red</div>
                    <div class="color-hex">#780000</div>
                    <p style="margin-top: 10px; font-size: 0.9em;">Support - Emphasis</p>
                </div>
                <div class="color-swatch neutral">
                    <div class="color-name">Papaya Whip</div>
                    <div class="color-hex">#FDF0D5</div>
                    <p style="margin-top: 10px; font-size: 0.9em;">Neutral - Warmth & Approachability</p>
                </div>
            </div>
        </section>

        <!-- Typography -->
        <section class="section">
            <h2 class="section-title">Typography</h2>

            <div class="typography">
                <div class="type-sample">
                    <div class="type-label">Heading 1 - Bold 700</div>
                    <h1 class="sample">Empowering Algeria's Retail Future</h1>
                </div>
                <div class="type-sample">
                    <div class="type-label">Heading 2 - Semibold 600</div>
                    <h2 class="sample">Simplified Ordering for Every Shop</h2>
                </div>
                <div class="type-sample">
                    <div class="type-label">Heading 3 - Semibold 600</div>
                    <h3 class="sample">Connect. Order. Grow.</h3>
                </div>
                <div class="type-sample">
                    <div class="type-label">Body Text - Regular 400</div>
                    <p class="sample">Livrili is Algeria's trusted B2B marketplace, connecting retailers with suppliers through a seamless digital platform. We simplify procurement, ensure reliable delivery, and help businesses grow together.</p>
                </div>
            </div>
        </section>

        <!-- Brand Values -->
        <section class="section">
            <h2 class="section-title">Brand Values</h2>

            <div class="brand-values">
                <div class="value-card">
                    <div class="value-icon">🤝</div>
                    <div class="value-title">Trust</div>
                    <p>Building reliable relationships between retailers and suppliers</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">⚡</div>
                    <div class="value-title">Efficiency</div>
                    <p>Streamlining procurement with smart technology</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">🌍</div>
                    <div class="value-title">Local First</div>
                    <p>Understanding and serving Algeria's unique market needs</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">📈</div>
                    <div class="value-title">Growth</div>
                    <p>Empowering businesses to scale and succeed</p>
                </div>
            </div>
        </section>

        <!-- Voice & Tone -->
        <section class="section">
            <h2 class="section-title">Voice & Tone</h2>

            <div class="voice-tone">
                <h3 style="color: var(--prussian-blue); margin-bottom: 20px;">Our Communication Style</h3>
                <p style="margin-bottom: 20px;">Livrili speaks with confidence and warmth, balancing professionalism with approachability. We understand the challenges of running a retail business and position ourselves as a trusted partner, not just a platform.</p>

                <div class="voice-attributes">
                    <div class="attribute">
                        <div class="attribute-title">Professional</div>
                        <p>yet Friendly</p>
                    </div>
                    <div class="attribute">
                        <div class="attribute-title">Clear</div>
                        <p>yet Comprehensive</p>
                    </div>
                    <div class="attribute">
                        <div class="attribute-title">Supportive</div>
                        <p>yet Empowering</p>
                    </div>
                    <div class="attribute">
                        <div class="attribute-title">Local</div>
                        <p>yet Modern</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Visual Patterns -->
        <section class="section">
            <h2 class="section-title">Visual Elements</h2>

            <div class="pattern-showcase">
                <div class="pattern pattern-1"></div>
                <div class="pattern pattern-2"></div>
                <div class="pattern pattern-3"></div>
            </div>

            <h3 style="margin-bottom: 20px; color: var(--prussian-blue);">Icon System</h3>
            <div class="icon-set">
                <div class="icon">📦</div>
                <div class="icon">🚚</div>
                <div class="icon">💳</div>
                <div class="icon">📊</div>
                <div class="icon">🏪</div>
                <div class="icon">⏰</div>
            </div>
        </section>

        <!-- Applications -->
        <section class="section">
            <h2 class="section-title">Brand Applications</h2>

            <div class="applications">
                <div class="app-card">
                    <h3 style="color: var(--prussian-blue); margin-bottom: 20px;">Business Card</h3>
                    <div class="business-card">
                        <div class="bc-logo">Livrili</div>
                        <div class="bc-info">
                            <strong>Ahmed Benali</strong><br>
                            Account Manager<br><br>
                            📞 +213 555 0123<br>
                            ✉️ ahmed@livrili.shop<br>
                            🌐 livrili.shop
                        </div>
                    </div>
                </div>

                <div class="app-card">
                    <h3 style="color: var(--prussian-blue); margin-bottom: 20px;">Digital Assets</h3>
                    <div style="background-color: var(--gray-light); padding: 40px; border-radius: 8px;">
                        <div style="background-color: var(--white); padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                                <div class="logo" style="font-size: 24px;">
                                    <div class="logo-icon" style="width: 30px; height: 30px;">
                                        <div class="logo-box" style="width: 30px; height: 30px;"></div>
                                    </div>
                                    <span class="logo-text">Livrili</span>
                                </div>
                            </div>
                            <div style="height: 4px; background: linear-gradient(90deg, var(--fire-brick) 0%, var(--air-superiority-blue) 100%); border-radius: 2px; margin-bottom: 20px;"></div>
                            <p style="font-size: 0.9em; color: var(--gray-medium);">Welcome to Algeria's #1 B2B Marketplace</p>
                        </div>
                    </div>
                </div>

                <div class="app-card">
                    <h3 style="color: var(--prussian-blue); margin-bottom: 20px;">Delivery Vehicle</h3>
                    <div style="background: linear-gradient(135deg, var(--prussian-blue) 0%, var(--air-superiority-blue) 100%); padding: 40px; border-radius: 8px; color: var(--white); text-align: center;">
                        <div style="font-size: 48px; font-weight: 800; margin-bottom: 10px;">Livrili</div>
                        <p style="font-size: 1.1em;">Fast • Reliable • Trusted</p>
                        <div style="margin-top: 20px; font-size: 2em;">🚚</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Usage Guidelines -->
        <section class="section">
            <h2 class="section-title">Usage Guidelines</h2>

            <div style="background-color: var(--gray-light); padding: 40px; border-radius: 12px;">
                <h3 style="color: var(--prussian-blue); margin-bottom: 20px;">Do's</h3>
                <ul style="list-style: none; margin-bottom: 30px;">
                    <li style="margin-bottom: 10px;">✅ Maintain consistent spacing around the logo</li>
                    <li style="margin-bottom: 10px;">✅ Use approved color combinations</li>
                    <li style="margin-bottom: 10px;">✅ Ensure readability with proper contrast</li>
                    <li style="margin-bottom: 10px;">✅ Use Arabic/French translations consistently</li>
                </ul>

                <h3 style="color: var(--barn-red); margin-bottom: 20px;">Don'ts</h3>
                <ul style="list-style: none;">
                    <li style="margin-bottom: 10px;">❌ Don't stretch or distort the logo</li>
                    <li style="margin-bottom: 10px;">❌ Don't use unapproved color combinations</li>
                    <li style="margin-bottom: 10px;">❌ Don't place logo on busy backgrounds</li>
                    <li style="margin-bottom: 10px;">❌ Don't alter the typography</li>
                </ul>
            </div>
        </section>
    </div>

</body>
</html>
