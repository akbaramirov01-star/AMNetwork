"""No provider calls: real Flask client and real SQLite budgets, mocked AI."""
import os
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

_temp = tempfile.TemporaryDirectory()
os.environ['SECURITY_DB_PATH'] = os.path.join(_temp.name, 'initial.sqlite3')
import api
import security


class SecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.budget = security.RequestBudget(os.path.join(self.temp.name, 'limits.sqlite3'))
        self.replace = patch.object(security, 'budget', self.budget)
        self.replace.start()
        self.client = api.app.test_client()

    def tearDown(self):
        self.replace.stop()
        self.temp.cleanup()

    def test_all_billable_routes_share_a_budget(self):
        self.budget.daily = 1
        with patch.object(api, 'get_reply', return_value='test') as ai:
            self.assertEqual(self.client.post('/chat', json={'message':'hello'}).status_code, 200)
            for endpoint in ['/chat','/academy/explain','/academy/chrome','/academy/apply']:
                r = self.client.post(endpoint, json={'message':'again'})
                self.assertEqual(r.status_code, 429)
                self.assertGreater(int(r.headers['Retry-After']),0)
                self.assertEqual(r.headers['Cache-Control'],'no-store')
            ai.assert_called_once()

    def test_per_client_limit_ignores_forged_forwarded_header(self):
        self.budget.client_minute = 1
        with patch.object(api, 'get_reply', return_value='test') as ai:
            for i, status in [(1,200),(2,429)]:
                response = self.client.post('/chat', json={'message':'hello'}, headers={'X-Forwarded-For':f'192.0.2.{i}'})
                self.assertEqual(response.status_code,status)
            ai.assert_called_once()

    def test_malformed_inputs_never_call_ai(self):
        with patch.object(api, 'get_reply') as chat, patch.object(api, 'apply_to_case') as apply:
            for body in [[], ['x'], 'x', 42, None]:
                self.assertEqual(self.client.post('/chat', json=body).status_code,400)
            cases = [('/chat',{'message':{}}),('/academy/chrome',{'lang':[]}),
                     ('/academy/explain',{'core':'hi','audience':[]}),
                     ('/academy/apply',{'core':'hi','situation':[]})]
            for url, body in cases:
                self.assertEqual(self.client.post(url,json=body).status_code,400)
            chat.assert_not_called(); apply.assert_not_called()

    def test_oversize_body_rejected(self):
        self.assertEqual(self.client.post('/chat',json={'message':'x'*40000}).status_code,413)

    def test_database_failure_fails_closed(self):
        with patch.object(self.budget, 'acquire', side_effect=security.sqlite3.OperationalError), patch.object(api,'get_reply') as ai:
            self.assertEqual(self.client.post('/chat',json={'message':'hi'}).status_code,503)
            ai.assert_not_called()

    def test_emergency_switch(self):
        with patch.dict(os.environ, {'AI_ENABLED':'false'}), patch.object(api,'get_reply') as ai:
            self.assertEqual(self.client.post('/chat',json={'message':'hi'}).status_code,503)
            ai.assert_not_called()

    def test_parallel_global_limit_is_atomic_and_survives_recreation(self):
        self.budget.daily=4; self.budget.concurrent=50
        with ThreadPoolExecutor(max_workers=10) as pool:
            results=list(pool.map(lambda n:self.budget.acquire(f'192.0.2.{n}',now=100000),range(20)))
        self.assertEqual(sum(lease is not None for lease,_ in results),4)
        other = security.RequestBudget(self.budget.path);other.daily=4
        self.assertIsNone(other.acquire('192.0.2.90',now=100001)[0])

    def test_concurrency_release_and_expired_worker(self):
        self.budget.concurrent=1
        lease,_=self.budget.acquire('192.0.2.1',now=100000)
        self.assertIsNone(self.budget.acquire('192.0.2.2',now=100000)[0])
        self.budget.release(lease)
        self.assertIsNotNone(self.budget.acquire('192.0.2.2',now=100000)[0])
        self.assertIsNotNone(self.budget.acquire('192.0.2.3',now=100091)[0])

    def test_provider_failure_releases_concurrency(self):
        self.budget.concurrent=1
        with patch.object(api,'get_reply',side_effect=RuntimeError('not configured')):
            self.assertEqual(self.client.post('/chat',json={'message':'hi'}).status_code,503)
        with patch.object(api,'get_reply',return_value='ok'):
            self.assertEqual(self.client.post('/chat',json={'message':'hi'}).status_code,200)

if __name__ == '__main__':
    unittest.main()
