"""Verify static GitHub Pages subdirectory paths and actual bundled Web SDK exports."""
import os
import shutil
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

class GitHubPages(unittest.TestCase):
    def test_subdirectory_real_sdk_assets_and_guest_lesson(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT.parent)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
                context=browser.new_context(viewport={'width':390,'height':844},service_workers='block')
                context.route('**/js/firebase-config.js',lambda r:r.fulfill(body='window.GroundFirebaseConfig={firebase:null,emulators:false};',content_type='text/javascript'))
                page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                url=f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
                page.goto(url)
                expect(page.locator('[data-action="google-login"]')).to_be_disabled()
                exports=page.evaluate('''async()=>{const sdk=await import(new URL('js/firebase-sdk.js',location.href));return ['initializeApp','getAuth','GoogleAuthProvider','setPersistence','signInWithPopup','signInWithRedirect','initializeFirestore','runTransaction','onSnapshot'].map(k=>typeof sdk[k]);}''')
                self.assertTrue(all(t=='function' for t in exports))
                for name in ['browserLocalPersistence','browserSessionPersistence','inMemoryPersistence']:
                    self.assertTrue(page.evaluate('(name)=>import(new URL("js/firebase-sdk.js",location.href)).then(sdk=>!!sdk[name])',name))
                page.locator('[data-action="choose-course"]').click();page.locator('[data-track="school"]').click();page.locator('[data-course="7"]').click()
                page.locator('[data-action="start-lesson"]').first.click()
                href=page.locator('.source-link a').first.evaluate('(a)=>a.href')
                self.assertIn('/'+ROOT.name+'/materials/grade7/',href)
                self.assertTrue(page.request.get(href).body().startswith(b'%PDF'))
                self.assertFalse(page.evaluate('document.documentElement.scrollWidth>innerWidth'))
                self.assertEqual(errors,[])
                context.close();browser.close()
        finally:server.shutdown();server.server_close()

if __name__=='__main__':unittest.main()
