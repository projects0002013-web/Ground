"""Browser integration with a test SDK adapter and the actual server scoring engine.
Google OAuth and Firestore Rules additionally require the real emulator / deployment checks.
"""
import json
import os
import shutil
import subprocess
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from browser_smoke import QuietHandler, GroundSmoke

ROOT = Path(__file__).resolve().parents[1]
ENGINE = """const fs=require('node:fs'),s=require('./functions/progress.cjs');const x=JSON.parse(fs.readFileSync(0,'utf8'));try{console.log(JSON.stringify(x.action==='ensureProfile'?s.emptyProfile(x.uid,{name:x.uid,email:x.uid+'@example.test'}):s.apply(x.profile,s.evaluate(x.data))))}catch(e){console.log(JSON.stringify({error:e.message,code:'functions/'+e.code}))}"""
profiles = {}
attempts = {}
lock = threading.Lock()

class CloudHandler(QuietHandler):
    def do_POST(self):
        if self.path != '/__cloud_test':
            self.send_error(404)
            return
        request = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        uid, action, data = request['uid'], request['action'], request['data']
        with lock:
            if not uid:
                result = {'error': 'unauthenticated', 'code': 'functions/unauthenticated'}
            elif action == 'ensureProfile':
                if uid not in profiles:
                    profiles[uid] = self.engine(request)
                    attempts[uid] = {}
                result = {'ok': True}
            elif action == 'read':
                if uid not in profiles or not data['path'].startswith('users/' + uid):
                    result = {'error': 'permission-denied', 'code': 'permission-denied'}
                else:
                    result = list(attempts[uid].values())[::-1][:50] if data['path'].endswith('/attempts') else profiles[uid]
            elif action == 'preferences':
                profiles[uid].update({key: value for key, value in data.items() if key in ['selectedGrade', 'layout', 'nickname', 'onboarded', 'bookRead', 'bookPage', 'scanPage']})
                result = {}
            elif action == 'recordAttempt':
                if data['id'] in attempts[uid]:
                    result = {'result': attempts[uid][data['id']], 'progress': profiles[uid]}
                else:
                    result = self.engine({**request, 'profile': profiles[uid]})
                    if 'error' not in result:
                        profiles[uid] = result.pop('profile')
                        attempts[uid][data['id']] = result['result']
                        result['progress'] = profiles[uid]
            else:
                result = {'error': 'unknown'}
            payload = json.dumps(result).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def engine(self, request):
        process = subprocess.run(['node', '-e', ENGINE], cwd=ROOT, input=json.dumps(request), text=True, capture_output=True, check=True)
        return json.loads(process.stdout)

class GroundCloudBrowser(unittest.TestCase):
    click = GroundSmoke.click
    nav = GroundSmoke.nav
    onboard = GroundSmoke.onboard
    finish = GroundSmoke.finish

    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(CloudHandler, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'), headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def device(self, width=390):
        context = self.browser.new_context(viewport={'width': width, 'height': 844}, service_workers='block')
        context.route('**/js/firebase-sdk.js', lambda route: route.fulfill(path=str(ROOT / 'tests/fixtures/cloud/sdk.mjs'), content_type='text/javascript'))
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda error: self.errors.append(str(error)))
        page.goto(self.url)
        self.contexts.append(context)
        return context, page

    def setUp(self):
        with lock:
            profiles.clear()
            attempts.clear()
        self.errors = []
        self.contexts = []
        self.context, self.page = self.device()

    def tearDown(self):
        for context in self.contexts:
            context.close()
        self.assertEqual(self.errors, [])

    def state(self):
        return self.page.evaluate("()=>JSON.parse(localStorage.getItem(window.GroundCloud.current().user?'ground.v2.user.'+window.GroundCloud.current().user.uid:'ground.v2'))")

    def login(self, uid='alice'):
        self.page.evaluate('(uid)=>window.testNextUser={uid,displayName:uid,email:uid+"@example.test",photoURL:""}', uid)
        expect(self.page.locator('[data-action="google-login"]').first).to_be_enabled()
        self.click('google-login')
        self.page.wait_for_function('()=>window.GroundCloud.current().phase==="synced"')

    def wait_xp(self, xp):
        self.page.wait_for_function('(xp)=>JSON.parse(localStorage.getItem("ground.v2.user."+window.GroundCloud.current().user.uid)).xp===xp', arg=xp)

    def test_google_profile_reload_two_devices_and_account_isolation(self):
        self.onboard()
        self.context.add_init_script('if(!localStorage.getItem("test.guestseeded")){const p=JSON.parse(localStorage.getItem("ground.v2"));p.xp=17;localStorage.setItem("ground.v2",JSON.stringify(p));localStorage.setItem("test.guestseeded","1");}')
        self.page.reload()
        self.nav('profile')
        self.login()
        self.assertEqual(self.state()['xp'], 0)
        self.nav('home')
        self.click('start-lesson')
        self.finish()
        self.wait_xp(30)
        self.assertEqual(self.state()['genes'], 5)
        self.assertEqual(self.state()['lastResult']['rewardXP'], 30)
        self.page.reload()
        self.page.wait_for_function('()=>window.GroundCloud.current().phase==="synced"')
        self.wait_xp(30)
        old_page, old_context = self.page, self.context
        self.context, self.page = self.device(1280)
        self.login()
        self.wait_xp(30)
        self.nav('road')
        self.page.locator('[data-id="1"].road-node').click()
        self.finish()
        self.page.wait_for_function('()=>window.GroundCloud.current().pending===0')
        self.assertEqual(self.state()['xp'], 30)
        self.assertEqual(self.state()['lastResult']['rewardXP'], 0)
        self.nav('profile')
        self.click('google-logout')
        self.page.wait_for_function('()=>!window.GroundCloud.current().user')
        self.login('bob')
        self.assertEqual(self.state()['xp'], 0)
        self.assertEqual(self.state()['completed'], {})
        self.context, self.page = old_context, old_page
        self.nav('profile')
        self.click('google-logout')
        self.page.wait_for_function('()=>!window.GroundCloud.current().user')
        self.assertEqual(self.state()['xp'], 17)
        self.assertIsNone(self.page.evaluate('()=>localStorage.getItem("ground.v2.user.alice")'))

    def test_redirect_fallback_offline_outbox_and_settings_sync(self):
        self.page.evaluate('()=>window.testPopupBlocked=true')
        self.login()
        self.assertTrue(self.page.evaluate('()=>window.testRedirectUsed'))
        self.context.set_offline(True)
        self.click('start-lesson')
        self.finish()
        self.assertEqual(self.state()['xp'], 0)
        self.assertIn('8:1', self.state()['completed'])
        self.assertEqual(self.page.evaluate('()=>window.GroundCloud.current().pending'), 1)
        self.assertEqual(len(self.page.evaluate('()=>JSON.parse(localStorage.getItem("ground.cloud.queue.alice"))')), 1)
        self.context.set_offline(False)
        self.wait_xp(30)
        self.page.wait_for_function('()=>window.GroundCloud.current().pending===0')
        self.page.reload()
        self.page.wait_for_function('()=>window.GroundCloud.current().phase==="synced"')
        self.wait_xp(30)
        self.nav('profile')
        self.click('edit-profile')
        self.page.locator('#profile-name').fill('Исследователь')
        self.page.locator('input[name="layout"][value="phone"]').check()
        self.page.locator('#profile-form button[type="submit"]').click()
        self.page.wait_for_function('()=>window.GroundCloud.current().pending===0')
        self.assertEqual(profiles['alice']['nickname'], 'Исследователь')
        self.assertEqual(profiles['alice']['layout'], 'phone')
        self.context, self.page = self.device(1280)
        self.login()
        self.assertEqual(self.state()['name'], 'Исследователь')
        self.assertEqual(self.state()['layout'], 'phone')

del GroundSmoke  # Prevent unittest from also collecting the imported long regression suite.

if __name__ == '__main__':
    unittest.main()
