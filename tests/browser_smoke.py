"""Functional browser tests. Requires Python Playwright and installed Chromium."""
import json
import os
import shutil
import re
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
KEY = 'ground.v2'
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

class GroundSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url=f'http://127.0.0.1:{cls.server.server_port}/'
        cls.playwright=sync_playwright().start()
        cls.browser=cls.playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.playwright.stop();cls.server.shutdown();cls.server.server_close()
    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':390,'height':844})
        self.page=self.context.new_page();self.page.set_default_timeout(5000)
        self.errors=[];self.page.on('pageerror',lambda error:self.errors.append(str(error)))
        self.page.goto(self.url)
    def tearDown(self):
        errors=self.errors[:];self.context.close();self.assertEqual(errors,[])
    def click(self,action):self.page.locator(f'[data-action="{action}"]:visible').first.click()
    def nav(self,view):self.page.locator(f'.sidebar nav [data-view="{view}"]').click()
    def onboard(self,key='8'):
        self.click('choose-course')
        if key in ['ent','olympiad']:self.page.locator(f'[data-track="{key}"]').click()
        else:self.page.locator('[data-track="school"]').click();self.page.locator(f'[data-course="{key}"]').click()
    def state(self):return self.page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
    def finish(self,wrong_first=False):
        wrong_done=False
        for _ in range(150):
            if not self.page.locator('.lesson-shell').count():return
            data=self.state();session=data['session'];step=session['steps'][session['step']]
            if step['type']=='question' and not session['checked']:
                index=step['correct']
                if wrong_first and not wrong_done:index=(index+1)%len(step['answers']);wrong_done=True
                self.page.locator(f'.answer[data-index="{index}"]').click()
                self.click('lesson-next')
                expect(self.page.locator('.feedback')).to_be_visible()
            self.click('lesson-next')
        self.fail('Lesson never finished')
    def test_mixed_lesson_resume_rewards_unlock_and_review(self):
        self.onboard();self.click('start-lesson')
        while self.state()['session']['steps'][self.state()['session']['step']]['type']=='theory':self.click('lesson-next')
        session=self.state()['session'];first=session['steps'][session['step']]
        self.page.locator(f'.answer[data-index="{(first["correct"]+1)%len(first["answers"])}"]').click();self.click('lesson-next')
        self.click('exit-lesson');self.page.reload();self.click('resume')
        self.assertTrue(self.state()['session']['checked']);self.finish()
        data=self.state();self.assertEqual(data['xp'],30);self.assertEqual(data['genes'],5)
        self.assertEqual(data['lastResult']['correct'],39);self.assertEqual(data['lastResult']['total'],40)
        self.click('review-result');self.assertEqual(self.page.locator('.review-item').count(),40)
        self.nav('road');expect(self.page.locator('[data-id="2"].road-node')).to_have_class(re.compile('available'))
        self.page.locator('[data-id="1"].road-node').click();self.finish()
        self.assertEqual(self.state()['xp'],30);self.assertEqual(self.state()['lastResult']['rewardXP'],0)
        self.click('result-next');self.page.locator('[data-id="2"].road-node').click();self.finish()
        self.assertEqual(self.state()['xp'],60)
        self.page.reload();self.assertEqual(self.state()['xp'],60)
        self.nav('practice');self.click('practice-errors');self.finish();self.assertEqual(self.state()['xp'],60)
    def test_library_search_reader_book_exam_and_scans(self):
        self.onboard();self.nav('library');search=self.page.locator('#library-search')
        search.fill('несуществующий материал');expect(self.page.locator('.empty')).to_be_visible()
        search.fill('клет');self.assertGreater(self.page.locator('.lesson-row').count(),0)
        search.fill('');self.click('read-book')
        for _ in range(3):self.click('book-next')
        self.assertEqual(len(self.state()['bookRead']),4);self.page.reload()
        self.nav('library');self.click('read-book');self.assertEqual(self.state()['bookPage'],3)
        self.click('book-exam');expect(self.page.locator('#timer')).to_be_visible();self.finish()
        self.assertEqual(self.state()['lastResult']['total'],6);self.assertEqual(self.state()['xp'],40)
        self.click('result-next');self.click('read-scans')
        self.page.wait_for_function('document.querySelector(".reader-image").naturalWidth>0')
        self.click('scan-next');self.page.wait_for_function('document.querySelector(".reader-image").src.includes("48.webp") && document.querySelector(".reader-image").naturalWidth>0')
        expect(self.page.locator('[data-action="scan-next"]')).to_be_disabled()
    def test_tracks_tables_failed_exam_timer_and_profile(self):
        self.onboard('olympiad');self.nav('practice');self.click('start-practice')
        seen_table=False
        for _ in range(50):
            if not self.page.locator('.lesson-shell').count():break
            seen_table |= self.page.locator('.data-table').count()>0
            s=self.state()['session'];step=s['steps'][s['step']]
            self.page.locator(f'.answer[data-index="{step["correct"]}"]').click();self.click('lesson-next');self.click('lesson-next')
        self.assertTrue(seen_table);self.assertEqual(self.state()['xp'],0)
        self.click('result-next');self.nav('road');self.click('start-lesson');self.finish()
        self.click('result-next');self.page.locator('.road-node[data-id="2"]').click();self.finish()
        self.click('result-next');self.page.locator('.road-node[data-id="3"]').click();self.finish()
        self.click('result-next');self.page.clock.install();self.page.locator('.road-node[data-id="4"]').click()
        self.click('exit-lesson');self.page.clock.fast_forward(301000);self.click('resume')
        self.assertTrue(self.state()['lastResult']['expired']);self.assertEqual(self.state()['lastResult']['correct'],0)
        self.assertNotIn('olympiad:4',self.state()['completed']);self.click('result-next');self.finish()
        self.assertIn('olympiad:4',self.state()['completed']);self.assertEqual(self.state()['xp'],140)
        self.nav('profile');self.click('edit-profile');self.page.locator('#profile-name').fill('<img onerror=alert(1)>');self.page.locator('#profile-form [type="submit"]').click()
        self.assertEqual(self.state()['name'],'<img onerror=alert(1)>');self.assertEqual(self.page.locator('img[onerror]').count(),0)
    def test_backup_validation_and_recovery(self):
        self.onboard('ent');self.click('start-lesson');self.finish();self.nav('profile');self.click('edit-profile')
        with self.page.expect_download() as event:self.click('export')
        backup=json.loads(Path(event.value.path()).read_text());self.assertEqual(backup['xp'],30)
        bad=dict(backup);bad['completed']={'ent:1':{'percent':'<img onerror=alert(1)>','at':'today'}}
        self.page.locator('#import-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':json.dumps(bad).encode()})
        expect(self.page.locator('#toast')).to_contain_text('Файл не подходит')
        self.assertEqual(self.state()['xp'],30)
        for value in ['wrong-type',['unknown-badge'],['first-lesson','first-lesson']]:
            invalid=dict(backup);invalid['achievements']=value
            self.page.locator('#import-file').set_input_files({'name':'bad-achievements.json','mimeType':'application/json','buffer':json.dumps(invalid).encode()})
            expect(self.page.locator('#toast')).to_contain_text('Файл не подходит')
            self.assertEqual(self.state()['xp'],30)
        backup['name']='Исследователь'
        self.page.locator('#import-file').set_input_files({'name':'good.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
        self.page.locator('#confirm-import').click();self.assertEqual(self.state()['name'],'Исследователь')
        self.click('edit-profile');self.click('reset-confirm');self.click('reset')
        self.assertEqual(self.state()['xp'],0);expect(self.page.locator('.welcome h1')).to_be_visible()
    def test_uploaded_grade7_lesson_and_thirteen_circles(self):
        self.onboard('7');self.assertEqual(self.page.locator('.road-node').count(),13)
        self.nav('road');self.assertEqual(self.page.locator('.road-node').count(),13)
        self.assertEqual(self.page.locator('.road-node.locked').count(),12)
        self.page.locator('.road-node[data-id="2"]').click();expect(self.page.locator('#toast')).to_contain_text('Сначала пройди предыдущий')
        self.page.locator('.road-node[data-id="3"]').click();expect(self.page.locator('#toast')).to_contain_text('Сначала пройди предыдущий')
        self.page.locator('.road-node[data-id="1"]').click()
        link=self.page.locator('.source-link a').first
        response=self.context.request.get(self.url+link.get_attribute('href'))
        self.assertEqual(response.status,200);self.assertTrue(response.body().startswith(b'%PDF'))
        def attempt(wrong_count):
            index=0;prompts=0
            for _ in range(120):
                if not self.page.locator('.lesson-shell').count():break
                session=self.state()['session'];step=session['steps'][session['step']]
                if step['type']=='theory':
                    prompts+=self.page.locator('.self-check li').count();self.click('lesson-next');continue
                correct=step['correct'];answer=(correct+1)%len(step['answers']) if index<wrong_count else correct
                self.page.locator(f'.answer[data-index="{answer}"]').click();self.click('lesson-next');self.click('lesson-next');index+=1
            self.assertEqual(index,40);self.assertEqual(prompts,25)
        attempt(13);self.assertEqual(self.state()['lastResult']['correct'],27)
        self.assertFalse(self.state()['lastResult']['passed']);self.assertEqual(self.state()['xp'],0)
        self.click('result-next');attempt(12)
        self.assertEqual(self.state()['lastResult']['correct'],28);self.assertTrue(self.state()['lastResult']['passed'])
        self.assertEqual(self.state()['xp'],30);self.assertIn('7:1',self.state()['completed'])
        self.click('result-next');self.assertEqual(self.page.locator('.road-node').count(),13)
        expect(self.page.locator('.road-node[data-id="2"]')).to_have_class(re.compile('available'))
        self.nav('home');expect(self.page.locator('.hero [data-action="start-lesson"]')).to_be_enabled()
        self.nav('library');self.assertEqual(self.page.locator('.lesson-row').count(),13)
        self.page.reload();self.assertEqual(self.state()['completed']['7:1']['percent'],70)

    def test_classification_pdf_resume_and_existing_progress(self):
        self.onboard('7')
        # Existing ecosystem completion must survive publishing lesson 2.
        data=self.state();data['completed']['7:1']={'percent':70,'at':'2026-10-10'};data['xp']=30;data['genes']=5;data['layout']='phone'
        fresh=self.context.new_page();fresh.set_default_timeout(5000)
        fresh.add_init_script('if (!sessionStorage.getItem("seeded-classification")) { localStorage.setItem("ground.v2",'+json.dumps(json.dumps(data))+'); sessionStorage.setItem("seeded-classification","1"); }')
        self.page.close();self.page=fresh;self.page.on('pageerror',lambda error:self.errors.append(str(error)))
        self.page.goto(self.url);self.click('start-lesson')
        self.assertEqual(self.state()['session']['lessonId'],2)
        link=self.page.locator('.source-link a').first
        self.assertIn('lesson-02-classification.pdf',link.get_attribute('href'))
        response=self.context.request.get(self.url+link.get_attribute('href'))
        self.assertEqual(response.status,200);self.assertTrue(response.body().startswith(b'%PDF'))
        prompts=0
        for _ in range(6):
            prompts+=self.page.locator('.self-check li').count();self.click('lesson-next')
        self.assertEqual(prompts,20)
        self.assertEqual(self.state()['session']['steps'][6]['type'],'question')
        self.click('exit-lesson');self.page.reload();self.click('resume');self.finish()
        data=self.state();self.assertEqual(data['lastResult']['total'],40);self.assertEqual(data['lastResult']['correct'],40)
        self.assertEqual(data['xp'],60);self.assertEqual(data['genes'],10);self.assertEqual(data['layout'],'phone')
        self.assertEqual(data['completed']['7:1']['percent'],70);self.assertIn('7:2',data['completed'])
        self.click('result-next');self.assertEqual(self.page.locator('.road-node').count(),13)
        expect(self.page.locator('.road-node[data-id="3"]')).to_have_class(re.compile('available'))
        self.page.reload();self.assertEqual(self.state()['completed']['7:2']['percent'],100)

    def test_uploaded_lessons_three_through_thirteen(self):
        self.onboard('7')
        data=self.state();data['completed']={f'7:{i}':{'percent':70,'at':'2026-10-10'} for i in [1,2]}
        data['xp']=60;data['genes']=10;data['layout']='phone'
        fresh=self.context.new_page();fresh.set_default_timeout(5000)
        fresh.add_init_script('if (!sessionStorage.getItem("seeded-full-course")) { localStorage.setItem("ground.v2",'+json.dumps(json.dumps(data))+'); sessionStorage.setItem("seeded-full-course","1"); }')
        self.page.close();self.page=fresh;self.page.on('pageerror',lambda error:self.errors.append(str(error)))
        self.page.goto(self.url)
        sources=json.loads((ROOT/'tests/fixtures/grade7_sources.json').read_text())
        for number in range(3,14):
            with self.subTest(lesson=number):
                self.nav('road');self.assertEqual(self.page.locator('.road-node').count(),13)
                expect(self.page.locator(f'.road-node[data-id="{number}"]')).to_have_class(re.compile('available'))
                if number<13:
                    self.page.locator(f'.road-node[data-id="{number+1}"]').click()
                    expect(self.page.locator('#toast')).to_contain_text('Сначала пройди предыдущий')
                self.page.locator(f'.road-node[data-id="{number}"]').click()
                source=sources[str(number)];session=self.state()['session']
                self.assertEqual(session['lessonId'],number);self.assertEqual(session['title'],source['title'])
                self.assertIsNone(session['deadline']);self.assertEqual(sum(s['type']=='question' for s in session['steps']),40)
                link=self.page.locator('.source-link a').first
                self.assertEqual(link.get_attribute('href'),source['source'])
                response=self.context.request.get(self.url+source['source'])
                self.assertEqual(response.status,200);self.assertEqual(response.body(),(ROOT/source['source']).read_bytes())
                prompts=0
                for _ in range(source['theoryCount']):
                    prompts+=self.page.locator('.self-check li').count();self.click('lesson-next')
                self.assertEqual(prompts,source['selfCheckCount'])
                if number in [3,10,13]:
                    self.click('exit-lesson');self.page.reload();self.click('resume')
                    self.assertEqual(self.state()['session']['lessonId'],number)
                self.finish();data=self.state()
                self.assertEqual(data['lastResult']['total'],40);self.assertEqual(data['lastResult']['correct'],40)
                self.assertEqual(data['xp'],number*30);self.assertEqual(data['genes'],number*5)
                self.assertEqual(data['completed']['7:1']['percent'],70);self.assertEqual(data['completed']['7:2']['percent'],70)
                self.assertEqual(data['layout'],'phone');self.assertEqual(data['courseVersions']['7'],2)
                self.page.reload();self.assertIn(f'7:{number}',self.state()['completed'])
        self.nav('road');self.assertEqual(self.page.locator('.road-node.completed').count(),13)
        self.assertEqual(self.page.locator('.road-node.locked').count(),0)
        self.nav('home');expect(self.page.locator('.hero')).to_contain_text('КУРС ПРОЙДЕН')
        self.nav('library');self.assertEqual(self.page.locator('.lesson-row').count(),13)
        self.nav('road');self.page.locator('.road-node[data-id="13"]').click();self.finish()
        self.assertEqual(self.state()['xp'],390);self.assertEqual(self.state()['lastResult']['rewardXP'],0)

    def test_replaced_course_keeps_other_progress_and_preferences(self):
        self.onboard('8');self.click('start-lesson');self.finish()
        original=self.state();original.pop('courseVersions');original['completed']['7:1']={'percent':100,'at':'2026-10-10'};original['completed']['7:2']={'percent':100,'at':'2026-10-10'}
        original['layout']='phone';original['xp']=90;original['genes']=15
        fresh=self.context.new_page();fresh.set_default_timeout(5000);fresh.add_init_script('localStorage.setItem("ground.v2",'+json.dumps(json.dumps(original))+')');fresh.goto(self.url)
        self.page.close();self.page=fresh
        self.nav('road');self.page.reload();self.nav('road')
        self.click('choose-course');self.page.locator('[data-track="school"]').click();self.page.locator('[data-course="7"]').click()
        data=self.state();self.assertEqual(data['xp'],90);self.assertEqual(data['genes'],15);self.assertEqual(data['layout'],'phone')
        self.assertNotIn('8:1',data['completed']);self.assertNotIn('7:1',data['completed']);self.assertEqual(data['courseVersions']['7'],2)

    def test_manual_layout_preferences(self):
        self.onboard();self.nav('profile')
        def choose(mode):
            self.click('edit-profile')
            self.page.locator(f'input[name="layout"][value="{mode}"]').check()
            self.page.locator('#profile-form [type="submit"]').click()
            self.assertEqual(self.state()['layout'],mode)
        self.page.set_viewport_size({'width':1440,'height':900})
        choose('phone')
        self.assertEqual(self.page.locator('html').get_attribute('data-compact'),'true')
        bounds=self.page.locator('.sidebar').bounding_box()
        self.assertEqual(bounds['width'],480);self.assertEqual(bounds['height'],75)
        self.assertEqual(self.page.locator('#app').bounding_box()['width'],480)
        self.page.reload();self.assertEqual(self.page.locator('html').get_attribute('data-layout'),'phone')
        for view in ['home','road','library','profile']:
            self.nav(view)
            self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
            self.assertLessEqual(self.page.locator('#main').bounding_box()['width'],480)
        self.nav('profile');choose('laptop')
        self.assertEqual(self.page.locator('html').get_attribute('data-compact'),'false')
        self.assertEqual(self.page.locator('.sidebar').bounding_box()['x'],0)
        self.assertEqual(self.page.locator('.sidebar').bounding_box()['height'],900)
        self.page.set_viewport_size({'width':390,'height':844})
        for view in ['home','road','library','profile']:
            self.nav(view);self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'),view)
        choose('auto')
        self.assertEqual(self.page.locator('html').get_attribute('data-compact'),'true')
        self.page.set_viewport_size({'width':1440,'height':900})
        expect(self.page.locator('html')).to_have_attribute('data-compact','false')
        self.assertEqual(self.state()['xp'],0)

    def test_layout_keyboard_corrupt_storage_and_legacy_migration(self):
        self.onboard()
        for width in [360,390,768,1440]:
            self.page.set_viewport_size({'width':width,'height':900})
            self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'),str(width))
            self.nav('road');self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'road {width}')
            self.nav('home')
        fresh=self.context.new_page();fresh.add_init_script('localStorage.setItem("ground.v2","invalid-json")');fresh.goto(self.url);self.page.close();self.page=fresh;expect(self.page.locator('.welcome h1')).to_be_visible()
        self.page.close();fresh=self.context.new_page()
        fresh.add_init_script('localStorage.removeItem("ground.v2");localStorage.setItem("groundAppState",JSON.stringify({grade:"8"}));localStorage.setItem("groundXP","60");localStorage.setItem("groundGenes","10");localStorage.setItem("ground_8_lesson_1_complete","true")')
        fresh.goto(self.url);self.page=fresh;self.nav('road');expect(self.page.locator('[data-id="1"].road-node')).to_have_class(re.compile('available'));self.assertEqual(self.state()['xp'],60);self.assertEqual(self.state()['genes'],10)
        self.click('start-lesson')
        while self.state()['session']['steps'][self.state()['session']['step']]['type']=='theory':self.click('lesson-next')
        self.page.keyboard.press('1')
        self.assertEqual(self.state()['session']['selected'],0)

if __name__=='__main__': unittest.main(verbosity=2)
