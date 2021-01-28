import React, { useState } from "react";
import { Button } from "./Button";
import firebase from "firebase/app";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form className="space-y-6 mt-8" action="#" method="POST">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm p-3 border-2 rounded-lg border-red-400 bg-red-200 text-red-700 mt-3">
          {error}
        </div>
      )}

      <div>
        <Button
          label="Sign in"
          className="w-full"
          loading={loading}
          onClick={async (e) => {
            e.preventDefault();

            setLoading(true);
            try {
              return await firebase
                .auth()
                .signInWithEmailAndPassword(email, password);
            } catch (e) {
              switch (e.code) {
                case "auth/invalid-email":
                case "auth/user-not-found":
                case "auth/wrong-password":
                  setError("Invalid credentials. Please try again!");
                case "auth/network-request-failed":
                  setError("Network error. Please try again!");
                default:
                  console.error(e);
                  setError("Something went wrong. Please try again!");
              }
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </form>
  );
};
