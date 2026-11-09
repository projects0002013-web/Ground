# Google sign-in verification (GROUND)

This checklist is for the deployed site: https://projects0002013-web.github.io/Ground/

## Firebase owner settings (outside GitHub)

1. In Firebase Console, select project `ground-f787f`.
2. In Authentication → Sign-in method, confirm Google is enabled.
3. In Authentication → Settings → Authorized domains, confirm `projects0002013-web.github.io` appears **without** `https://` or `/Ground/`.
4. In Firestore → Rules, confirm the currently committed `firestore.rules` is published. Do **not** use unrestricted `allow read, write: if true`.

The website code cannot read or publish these console settings. GitHub Pages deployment success also does not prove Google OAuth works.

## Manual browser acceptance checks

- Open the deployed URL in a regular Chrome/Safari tab. Click **Войти через Google**. A Google account chooser should appear and finish sign-in.
- If the chooser closes, inspect the visible error and the browser console. Check Firebase authorized domain/provider settings first. A popup-close error alone does **not** prove the domain is missing.
- Sign in as account A, complete one lesson, and verify XP / completed lesson survives refresh.
- Sign out, sign in as account B on the same device: account A's lesson and XP must **not** appear.
- Sign back into account A: the saved progress should return.
- Repeat on a second device and in offline → online transitions. Pending attempts should sync once, without duplicate rewards.
- Verify a guest can still use lessons without Google sign-in.
- For failures, record browser, device, exact error code, and which checklist step failed. Never share passwords, access tokens or private user data.

## Automated checks

Run `npm test`, `python3 tests/browser_cloud.py -v`, and `python3 tests/browser_smoke.py -v`. These verify local code behavior, not production Firebase Console settings.

## Release gate

Do not claim account/login flow complete until a real Google sign-in, two-account isolation test, second-device sync, and online/offline retry are validated against production. Keep a backup of the learning progress before manual migration tests.
