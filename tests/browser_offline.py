"""Uses the real service worker and production static resources, with Auth disabled."""
import os
import shutil
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from playwright.sync_api import sync_playwright
from browser_smoke import QuietHandler, ROOT

class GroundOfflineBrowser(unittest.TestCase):
    def test_static_app_and_visited_pdf_survive_offline_reload(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f'http://127.0.0.1:{server.server_port}/'
        try:
            with sync_playwright() as playwright:
                browser=playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
                context=browser.new_context()
                context.route('**/js/firebase-config.js',lambda route:route.fulfill(body='window.GroundFirebaseConfig={firebase:null,emulators:false};',content_type='text/javascript'))
                page=context.new_page();errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                page.goto(url)
                page.wait_for_function('()=>!!navigator.serviceWorker.controller')
                status=page.evaluate("async()=>{const r=await fetch('materials/grade7/lesson-01-ecosystems.pdf');await r.arrayBuffer();return r.status;}")
                self.assertEqual(status,200)
                page.wait_for_function("async()=>{const c=await caches.open('ground-static-v2');return !!(await c.match(new URL('materials/grade7/lesson-01-ecosystems.pdf',location.href)));}")
                context.set_offline(True)
                page.reload()
                page.wait_for_selector('[data-action="choose-course"]')
                self.assertEqual(page.evaluate('()=>window.GroundDB.courses["7"].lessons.length'),13)
                prefix=page.evaluate("async()=>{const r=await fetch('materials/grade7/lesson-01-ecosystems.pdf');return (await r.text()).slice(0,4);}")
                self.assertEqual(prefix,'%PDF')
                cached=page.evaluate('async()=>{const keys=await caches.keys();return (await Promise.all(keys.map(async key=>(await (await caches.open(key)).keys()).map(r=>r.url)))).flat();}')
                self.assertTrue(all(item.startswith(url) for item in cached))
                self.assertFalse(any('/users/' in item or 'googleapis.com' in item for item in cached))
                self.assertEqual(errors,[])
                context.close();browser.close()
        finally:
            server.shutdown();server.server_close()

if __name__=='__main__':
    unittest.main()
