// src/FeedbackTool.tsx
import React, { useRef, useState } from 'react';
import { IssueIcon } from './IssueIcon';
import { IdeaIcon } from './IdeaIcon';
import { MoreVerticalIcon } from './MoreVerticalIcon';
import { Button } from './Button';
import firebase from 'firebase/app';
import * as uuid from 'uuid';
import { DragDiv } from './DragDiv';
import { AirplaneIcon } from './AirplaneIcon';
import { RadioIconButton } from './RadioIconButton';

// Given a # of bytes, format that into a nice human readable string
// We'll use this to show the user the size of their attachments
// Taken from https://stackoverflow.com/a/28120564/13928257
export const bytesToHumanReadable = (bytes: number) => {
  if (bytes == 0) {
    return '0B';
  }
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, e)).toFixed(2) + '' + ' KMGTP'.charAt(e) + 'B';
};

export const Feedback = ({ user }: { user: firebase.User }) => {
  // We'll use this to conditionally show a "success" state after the user has submitted feedback
  const [success, setSuccess] = useState(false);

  // The form data
  // Most of this is self explanatory
  // The "files" array contains the files objects along with blob URLs so that users can review
  // their uploads
  // The "error" variable will be used to show error messages to users
  // "loading" will be set to true while the feedback is being submitted to show a loading icon
  const [type, setType] = useState<'idea' | 'issue' | 'other'>();
  const [feedback, setFeedback] = useState('');
  const [files, setFiles] = useState<Array<{ file: File; url: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // This will be used to toggle the file upload on click
  const fileUpload = useRef<HTMLInputElement | null>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const files: File[] = [];
    for (const file of fileList) {
      files.push(file);
    }

    setFiles((current) => [
      ...current,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const submitForm = async () => {
    // Just a sanity check! We disable the button anyway if these are not defined
    if (!type || !feedback) return;

    const id = uuid.v4();
    const firestore = firebase.firestore();
    const storage = firebase.storage();
    const ref = firestore.doc(`user_data/${user.uid}/feedback/${id}`);

    // Set a file upload limit
    // We don't tell users about this since it's unlikely they will try to upload this # of items
    // Remove this if you don't want to limit the # of attachments
    if (files.length > 50) {
      setError('You can only upload a maximum of 50 items');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // This size limit is enforced using security rules
      // But it's a much better to check first so we can immediately notify the user
      // If a security rules does fail, it won't tell you why it failed
      const file = files.find(({ file }) => file.size > 20 * 1024 * 1024);
      if (file) {
        setError(`"${file.file.name}" is larger than 20 MB`);
        return;
      }

      for (const { file } of files) {
        // Since users can upload files with the same name, simply using the file name would be
        // insufficient
        // To fix this, a UUID is prepended to ensure uniqueness
        const ref = storage.ref(
          `${user.uid}/feedback/${id}/${uuid.v4()}_${file.name}`,
        );

        await ref.put(file);
      }

      await ref.set({
        feedback,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        type,
      });
    } catch (e) {
      setError('An unknown error occurred while submitting feedback.');
      throw e;
    } finally {
      setLoading(false);
    }

    setFiles([]);
    setFeedback('');
    setType(undefined);
    setSuccess(true);
  };

  return (
    <div className="space-y-3 pt-8">
      {success ? (
        <>
          <div className="flex justify-center">
            <AirplaneIcon className="w-48" />
          </div>
          <div className="text-sm p-3 border-2 rounded-lg border-green-400 bg-green-200 text-green-700">
            <h1 className="font-bold">Thank you for your feedback!</h1>
            <p>
              Your feedback has been saved and will be used to guide future
              development. Make sure to keep an eye on the roadmap and release
              notes.
            </p>
          </div>
          <p className="text-center">
            Want to{' '}
            <button
              className="cursor-pointer hover:underline focus:underline focus:outline-none text-blue-500"
              // Setting "success" to false will show the form again
              onClick={() => setSuccess(false)}
            >
              submit again?
            </button>
          </p>
        </>
      ) : (
        <>
          <div>
            <h1 className="font-bold text-xl">Have some feedback?</h1>
            <p className="text-gray-700 text-sm sm:text-xs">
              Make sure to check out the roadmap first! Any feedback you have
              will help steer future development and is greatly appreciated 🌟
            </p>
          </div>

          <form className="mt-10 space-y-3">
            <div className="flex justify-center space-x-6">
              <RadioIconButton
                id="feedback-issue"
                name="feedback-type"
                checked={type === 'issue'}
                setChecked={() => setType('issue')}
                icon={IssueIcon}
                label="Issue"
                disableOpacity={type === undefined}
              />
              <RadioIconButton
                id="feedback-idea"
                name="feedback-type"
                checked={type === 'idea'}
                setChecked={() => setType('idea')}
                icon={IdeaIcon}
                label="Idea"
                disableOpacity={type === undefined}
              />
              <RadioIconButton
                id="feedback-other"
                name="feedback-type"
                checked={type === 'other'}
                setChecked={() => setType('other')}
                icon={MoreVerticalIcon}
                label="Other"
                disableOpacity={type === undefined}
              />
            </div>

            {/** Don't show the description and file input until the user has selected a type */}
            {/** This conditional rendering isn't really necessary if you want to remove it */}
            {type && (
              <>
                <label className="text-gray-700">
                  <span className="text-sm font-bold inline-block mt-6">
                    Description*
                  </span>

                  <textarea
                    className="border-gray-300 border rounded w-full py-1 px-2"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    required
                  />
                </label>

                {/* Hide the default "Choose Files" button which appears when you set type to "file" */}
                <input
                  id="attachments-upload"
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileUpload}
                  onChange={(e) => addFiles(e.target.files)}
                />
                <label htmlFor="attachments-upload" className="text-gray-700">
                  <span className="text-sm font-bold leading-none">
                    Attach File(s)
                  </span>
                  <span className="text-xs">
                    Attach any screenshots or files that you think would help.
                    Each file must be equal or less than 20MB.
                  </span>
                  <DragDiv
                    className="rounded border border-dashed border-gray-400 flex items-center justify-center flex-col py-3 space-y-2 mt-2"
                    addFiles={addFiles}
                    dragOverClassName="bg-gray-200"
                  >
                    <div className="text-sm">
                      <button
                        title="Upload feedback files"
                        className="cursor-pointer hover:underline focus:underline focus:outline-none text-blue-500"
                        onClick={(e) => {
                          e.preventDefault();
                          fileUpload.current && fileUpload.current.click();
                        }}
                      >
                        Click here
                      </button>{' '}
                      or drag files to upload!
                    </div>
                  </DragDiv>
                </label>

                <div className="divide-y text-gray-700 py-1">
                  {files.map(({ file, url }, i) => (
                    <div
                      key={url}
                      className="flex py-2 items-center justify-between space-x-2"
                    >
                      <div className="flex space-x-3 items-baseline min-w-0">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="leading-none truncate min-w-0 text-sm cursor-pointer hover:underline focus:underline focus:outline-none text-blue-500"
                          title={file.name}
                        >
                          {file.name}
                        </a>
                        <div className="text-xs leading-none text-gray-500">
                          {bytesToHumanReadable(file.size)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFiles((files) => [
                            ...files.slice(0, i),
                            ...files.slice(i + 1, files.length),
                          ]);
                        }}
                        title={`Remove ${file.name}`}
                      >
                        {/* Heroicons X */}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <div
                role="alert"
                className="text-sm p-3 border-2 rounded-lg border-red-400 bg-red-200 text-red-700 mt-3"
              >
                {error}
              </div>
            )}

            {/** Notice that we disable the button if the user hasn't selected a type or given any feedback */}
            <Button
              label="Submit Feedback"
              className="uppercase w-full mt-2"
              loading={loading}
              disabled={type === undefined || !feedback}
              onClick={(e) => {
                // Prevent the form submission
                e.preventDefault();
                submitForm();
              }}
            />
          </form>
        </>
      )}
    </div>
  );
};
