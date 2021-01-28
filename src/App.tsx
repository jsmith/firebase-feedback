import React from 'react';
import { useAuth } from './auth';
import { Button } from './Button';
import firebase from 'firebase/app';
import { Feedback } from './Feedback';
import { SignInForm } from './SignInForm';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="h-screen max-w-xl mx-auto flex flex-col justify-center py-12 px-5 text-gray-900">
      <h1 className="text-3xl font-extrabold text-center">Feedback Tool</h1>
      <p className="text-center">
        See the accompanying{' '}
        <a
          href="https://jacobsmith.me/blog/firebase-feedback-tool"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:underline focus:underline"
        >
          blog post
        </a>{' '}
        for more information. The sign in form has been pre-filled with
        credentials that can be used for testing.
      </p>

      {user ? (
        <>
          <Button
            onClick={() => firebase.auth().signOut()}
            className="absolute right-0 top-0 m-5"
            label="Sign Out"
          />
          <Feedback user={user} />
        </>
      ) : (
        <SignInForm />
      )}
    </div>
  );
}
