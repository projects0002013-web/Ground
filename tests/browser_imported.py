"""UI checks for the supplied grade 8–11 courses; no live Google account required."""
import json
import re
import unittest
from playwright.sync_api import expect
import browser_smoke as smoke

class ImportedCourses(unittest.TestCase):
    setUpClass = classmethod(smoke.GroundSmoke.setUpClass.__func__)
    tearDownClass = classmethod(smoke.GroundSmoke.tearDownClass.__func__)
    setUp = smoke.GroundSmoke.setUp
    tearDown = smoke.GroundSmoke.tearDown
    click = smoke.GroundSmoke.click
    nav = smoke.GroundSmoke.nav
    onboard = smoke.GroundSmoke.onboard
    state = smoke.GroundSmoke.state
    finish = smoke.GroundSmoke.finish

    def seed_profile(self,profile):
        self.page.close()
        self.page=self.context.new_page();self.page.set_default_timeout(5000)
        self.page.on('pageerror',lambda error:self.errors.append(str(error)))
        self.page.add_init_script('localStorage.setItem("ground.v2",'+json.dumps(json.dumps(profile))+')')
        self.page.goto(self.url)

    def test_courses_pdf_links_written_tasks_resume_and_rewards(self):
        total=0
        for grade,count,questions in [('8',14,40),('9',16,12),('10',13,28),('11',16,6)]:
            with self.subTest(grade=grade):
                self.onboard(grade);self.nav('road')
                self.assertEqual(self.page.locator('.road-node').count(),count)
                expect(self.page.locator('.road-node[data-id="1"]')).to_have_class(re.compile('available'))
                self.assertEqual(self.page.locator('.road-node.locked').count(),count-1)
                self.click('start-lesson')
                session=self.state()['session'];self.assertEqual(sum(s['type']=='question' for s in session['steps']),questions)
                link=self.page.locator('.source-link a').first.get_attribute('href')
                response=self.page.request.get(self.url+link)
                self.assertEqual(response.status,200);self.assertTrue(response.body().startswith(b'%PDF'))
                self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
                self.finish();total+=30
                self.assertEqual(self.state()['xp'],total);self.assertEqual(self.state()['lastResult']['total'],questions)
                self.click('result-next');expect(self.page.locator('.road-node[data-id="2"]')).to_have_class(re.compile('available'))
        self.onboard('8');self.nav('road');self.page.locator('.road-node[data-id="2"]').click()
        while not self.page.locator('.source-work').count():self.click('lesson-next')
        expect(self.page.locator('.source-work')).not_to_have_attribute('open','')
        self.page.locator('.source-work summary').click();self.assertEqual(self.page.locator('.source-work li').count(),40)
        self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
        step=self.state()['session']['step'];self.click('exit-lesson');self.page.reload();self.click('resume')
        self.assertEqual(self.state()['session']['step'],step)
        self.finish();self.assertEqual(self.state()['xp'],total+30)
        self.click('review-result');self.assertEqual(self.page.locator('.review-item').count(),40)

    def test_grade11_probnik_sixty_minute_timer_and_timeout(self):
        self.onboard('11')
        profile=self.state();profile['completed']={f'11:{i}':{'percent':100,'at':'2026-10-11'} for i in range(1,16)}
        self.seed_profile(profile);self.nav('road');self.page.clock.install()
        self.page.locator('.road-node[data-id="16"]').click()
        s=self.state()['session'];self.assertEqual(s['deadline']-s['startedAt'],3600000)
        self.assertEqual(len(s['steps']),40);expect(self.page.locator('#timer')).to_be_visible()
        self.click('exit-lesson');self.page.clock.fast_forward(3601000);self.click('resume')
        result=self.state()['lastResult'];self.assertTrue(result['expired']);self.assertEqual(result['total'],40)
        self.assertEqual(result['correct'],0);self.assertEqual(result['rewardXP'],0)
        self.click('result-next');self.finish()
        result=self.state()['lastResult'];self.assertTrue(result['passed']);self.assertEqual(result['correct'],40)
        self.assertEqual(result['rewardXP'],60)

    def test_training_errors_use_current_questions_after_cloud_normalization(self):
        self.onboard('8');self.nav('practice');self.click('start-practice');self.finish(wrong_first=True)
        profile=self.state();profile['history'][0]['courseVersion']=1
        old=json.loads(json.dumps(profile['history'][0]));old['attemptId']='old-practice-attempt-0001'
        old['answers']=[next(a for a in old['answers'] if a['selected']!=a['correct'])]
        old['answers'][0]['question']='Вопрос удалённого прежнего курса'
        profile['history'].append(old);self.seed_profile(profile)
        self.nav('practice');self.click('practice-errors')
        questions=[s for s in self.state()['session']['steps'] if s['type']=='question']
        self.assertEqual(len(questions),1);self.assertNotEqual(questions[0]['question'],'Вопрос удалённого прежнего курса')
        self.finish();self.assertEqual(self.state()['xp'],0)

    def test_old_course_migration_preserves_currency_layout_and_grade7(self):
        self.onboard('8')
        old=self.state();old.update(xp=200,genes=40,layout='phone',courseVersions={'7':2},completed={'7:1':{'percent':100,'at':'2026-10-10'},'ent:1':{'percent':100,'at':'2026-10-10'},**{g+':1':{'percent':100,'at':'2026-10-10'} for g in ['8','9','10','11']}})
        self.seed_profile(old)
        state=self.state();self.assertEqual(state['xp'],200);self.assertEqual(state['genes'],40);self.assertEqual(state['layout'],'phone')
        self.assertEqual(set(state['completed']),{'7:1','ent:1'})
        self.assertEqual(state['courseVersions'],{g:2 for g in ['7','8','9','10','11']})
        self.nav('road');expect(self.page.locator('.road-node[data-id="1"]')).to_have_class(re.compile('available'))

if __name__=='__main__':unittest.main(verbosity=2)
