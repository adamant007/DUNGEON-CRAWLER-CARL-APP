import { useState } from 'react';
import type { CloudPayload } from '../lib/types';
import { Card, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { loadCloud, saveCloud } from '../lib/storage';

export default function Account({
  getPayload,
  applyPayload,
}: {
  getPayload: () => CloudPayload;
  applyPayload: (p: CloudPayload) => void;
}) {
  const { configured, user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [syncedAt, setSyncedAt] = useState('');

  const submit = async () => {
    setError('');
    setStatus('');
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    if (res.error) setError(res.error);
    else {
      setPassword('');
      setStatus(mode === 'signup' ? 'Account created. Check your email if confirmation is required.' : 'Signed in.');
    }
  };

  const doSave = async () => {
    if (!user) return;
    setError('');
    setStatus('Saving…');
    try {
      await saveCloud(user.id, getPayload());
      setStatus('Saved to cloud.');
      setSyncedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
      setStatus('');
    }
  };

  const doLoad = async () => {
    if (!user) return;
    setError('');
    setStatus('Loading…');
    try {
      const res = await loadCloud(user.id);
      if (!res) {
        setStatus('No cloud save found yet. Use “Save to cloud” to create one.');
        return;
      }
      applyPayload(res.data);
      setStatus('Loaded from cloud.');
      setSyncedAt(new Date(res.updatedAt).toLocaleString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed.');
      setStatus('');
    }
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Account &amp; Cloud Saves</h2>
          <p>Optional. Your character always saves locally on this device first.</p>
        </div>
        <span className={`pill${configured ? ' active' : ''}`}>{configured ? 'Cloud enabled' : 'Local-only'}</span>
      </section>

      {!configured && (
        <Card title="Cloud Sync Is Not Configured">
          <p>
            This build is running in local-first mode. Everything you enter is stored in your browser and works fully
            offline.
          </p>
          <p className="hint">
            To enable optional accounts and cross-device cloud saves, set the public env vars{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then create a{' '}
            <code>crawler_saves</code> table with row-level security. No secret keys are ever used in the app. Setup SQL
            is in the README.
          </p>
        </Card>
      )}

      {configured && !user && (
        <Card
          title={mode === 'signin' ? 'Sign In' : 'Create Account'}
          actions={
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
            </button>
          }
        >
          <div className="formgrid">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
          </div>
          <div className="buttonrow">
            <button className="roll" disabled={loading} onClick={submit}>
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
          <p className="hint">Authentication uses Supabase Auth over HTTPS. Passwords are never stored by this app.</p>
        </Card>
      )}

      {configured && user && (
        <Card title="Signed In" actions={<button onClick={signOut}>Sign Out</button>}>
          <p>
            Signed in as <b>{user.email ?? user.id}</b>.
          </p>
          <div className="buttonrow">
            <button className="roll" onClick={doSave}>Save to cloud</button>
            <button onClick={doLoad}>Load from cloud</button>
          </div>
          {syncedAt && <p className="hint">Last cloud sync: {syncedAt}</p>}
        </Card>
      )}

      {(status || error) && (
        <Card title="Status">
          {status && <p className="success">{status}</p>}
          {error && <p className="error">{error}</p>}
        </Card>
      )}
    </>
  );
}
